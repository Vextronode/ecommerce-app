<?php

namespace App\Http\Controllers\Merchant;

use App\Events\WithdrawalUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessWithdrawalPayout;
use App\Models\Store;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    private const BANK_CHANGE_COOLDOWN_MINUTES = 30;

    // batas baris riwayat penarikan yang dikirim ke halaman index
    private const MAX_HISTORY_ROWS = 200;

    public function index(Request $request)
    {
        $user = $request->user()->load('store');
        $store = $user->store;

        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        $totalWithdrawn = (float) Withdrawal::where('store_id', $store->id)
            ->where('status', 'completed')
            ->sum('amount');

        $totalEarnings = (float) $store->available_balance + (float) $store->pending_balance + $totalWithdrawn;

        // batasi riwayat agar payload tidak membengkak untuk toko dengan ribuan penarikan.
        // table di frontend memfilter & menghitung dari daftar ini, jadi tetap dikirim sebagai array.
        $withdrawals = Withdrawal::where('store_id', $store->id)
            ->latest()
            ->limit(self::MAX_HISTORY_ROWS)
            ->get();

        return Inertia::render('Merchant/Withdrawals/Index', [
            'store' => [
                'id' => $store->id,
                'name' => $store->name,
                'available_balance' => (float) $store->available_balance,
                'pending_balance' => (float) $store->pending_balance,
                'bank_name' => $store->bank_name ?? '',
                'bank_account_number' => $store->bank_account_number ?? '',
                'bank_account_holder' => $store->bank_account_holder ?? '',
            ],
            'withdrawals' => $withdrawals,
            'stats' => [
                'available_balance' => (float) $store->available_balance,
                'pending_balance' => (float) $store->pending_balance,
                'total_withdrawn' => $totalWithdrawn,
                'total_earnings' => $totalEarnings,
            ],
        ]);
    }

    public function updateBank(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => ['required', 'string', 'max:50'],
            'bank_account_number' => ['required', 'string', 'regex:/^[0-9]{5,30}$/'],
            'bank_account_holder' => ['required', 'string', 'max:100'],
            'password' => ['required', 'current_password'],
        ], [
            'bank_account_number.regex' => 'Nomor rekening hanya boleh berisi angka (5-30 digit).',
            'password.current_password' => 'Password akun tidak cocok. Konfirmasi password untuk mengubah rekening.',
        ]);

        $store = $request->user()->store;
        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        // ganti rekening = operasi sensitif: butuh re-auth password (guard sesi hijack)
        // plus cooldown supaya penyerang yang punya sesi singkat tidak bisa langsung ganti lalu tarik dana
        $cooldownKey = $this->bankChangeCooldownKey($store);

        // lock per-toko membungkus refresh state + cek cooldown + update supaya tidak bisa disela request paralel
        // (anti race check-then-act yang ditemukan akechi & agy)
        $result = Cache::lock('withdrawal_bank_lock:'.$store->id, 10)
            ->block(3, function () use ($store, $validated, $cooldownKey) {
                $store->refresh();
                $bankBerubah = strtoupper((string) $store->bank_name) !== strtoupper((string) $validated['bank_name'])
                    || (string) $store->bank_account_number !== trim($validated['bank_account_number'])
                    || (string) $store->bank_account_holder !== trim($validated['bank_account_holder']);

                // no-op (data sama persis) tidak perlu sentuh cooldown
                if ($bankBerubah && Cache::has($cooldownKey)) {
                    return [
                        'ok' => false,
                        'message' => 'Rekening baru saja diubah. Tunggu '.self::BANK_CHANGE_COOLDOWN_MINUTES.' menit sebelum mengubah lagi.',
                    ];
                }

                $store->update([
                    'bank_name' => strip_tags(trim($validated['bank_name'])),
                    'bank_account_number' => trim($validated['bank_account_number']),
                    'bank_account_holder' => strip_tags(trim($validated['bank_account_holder'])),
                ]);

                if ($bankBerubah) {
                    // add() atomic add-if-not-exists: request paralel kedua gagal pasang cooldown,
                    // tapi perubahan kedua sudah dicegah oleh lock di atas
                    Cache::add($cooldownKey, true, now()->addMinutes(self::BANK_CHANGE_COOLDOWN_MINUTES));
                }

                return ['ok' => true];
            });

        if (($result['ok'] ?? false) === false) {
            throw ValidationException::withMessages([
                'password' => $result['message'] ?? 'Rekening baru saja diubah. Tunggu sebelum mengubah lagi.',
            ]);
        }

        return back()->with('success', 'Informasi rekening bank berhasil diperbarui.');
    }

    private function bankChangeCooldownKey(Store $store): string
    {
        return 'withdrawal_bank_cooldown:'.$store->id;
    }

    /**
     * Store a withdrawal request with strict concurrency locking and dispatch to async queue worker.
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $store = $user->store;

        if (! $store) {
            return back()->with('error', 'Toko tidak ditemukan.');
        }

        if (! $store->bank_name || ! $store->bank_account_number || ! $store->bank_account_holder) {
            throw ValidationException::withMessages([
                'amount' => 'Silakan lengkapi informasi rekening bank terlebih dahulu.',
            ]);
        }

        $validated = $request->validate([
            'amount' => [
                'required',
                'integer',
                'min:10000',
                'max:100000000',
            ],
        ], [
            'amount.integer' => 'Nominal penarikan harus berupa angka bulat dalam Rupiah.',
            'amount.min' => 'Minimal penarikan saldo adalah Rp 10.000.',
            'amount.max' => 'Maksimal penarikan per transaksi adalah Rp 100.000.000.',
        ]);

        $amount = (int) $validated['amount'];
        $refNo = 'WD-'.date('YmdHis').'-'.strtoupper(substr(uniqid(), -4));

        // Phase 1: Atomically lock store, check balance, deduct available_balance, and create pending withdrawal
        try {
            $withdrawal = DB::transaction(function () use ($store, $amount, $refNo) {
                $lockedStore = Store::where('id', $store->id)->lockForUpdate()->firstOrFail();

                // tahan penarikan dana selama masa cooldown pasca-perubahan rekening bank
                if (Cache::has($this->bankChangeCooldownKey($lockedStore))) {
                    throw ValidationException::withMessages([
                        'amount' => 'Rekening bank baru saja diubah. Demi keamanan, penarikan dana ditahan selama '.self::BANK_CHANGE_COOLDOWN_MINUTES.' menit setelah perubahan rekening.',
                    ]);
                }

                // cegah race & double-spending: tolak kalau masih ada penarikan yang belum kelar
                $hasPending = Withdrawal::where('store_id', $lockedStore->id)
                    ->whereIn('status', ['pending', 'processing'])
                    ->exists();

                if ($hasPending) {
                    throw ValidationException::withMessages([
                        'amount' => 'Masih ada transaksi penarikan dana yang sedang diproses. Mohon tunggu hingga proses selesai sebelum mengajukan penarikan baru.',
                    ]);
                }

                if ($lockedStore->available_balance < $amount) {
                    throw ValidationException::withMessages([
                        'amount' => 'Saldo yang dapat ditarik tidak mencukupi (Tersedia: Rp '.number_format($lockedStore->available_balance, 0, ',', '.').').',
                    ]);
                }

                // Decrement balance atomically inside locked transaction
                $lockedStore->decrement('available_balance', $amount);

                return Withdrawal::create([
                    'store_id' => $lockedStore->id,
                    'reference_no' => $refNo,
                    'amount' => $amount,
                    'bank_name' => strtoupper($lockedStore->bank_name),
                    'account_number' => $lockedStore->bank_account_number,
                    'account_holder' => $lockedStore->bank_account_holder,
                    'status' => 'pending',
                    'notes' => 'Menunggu pemrosesan oleh sistem payout',
                ]);
            });
        } catch (ValidationException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error("Withdrawal initiation failed for store {$store->id}: ".$e->getMessage());

            throw ValidationException::withMessages([
                'amount' => 'Gagal memproses permintaan penarikan: '.$e->getMessage(),
            ]);
        }

        // Phase 2: Dispatch payout to background queue worker
        ProcessWithdrawalPayout::dispatch($withdrawal);

        try {
            broadcast(new WithdrawalUpdated($withdrawal))->toOthers();
        } catch (\Throwable $e) {}

        return back()->with('success', 'Permintaan penarikan saldo sebesar Rp '.number_format($amount, 0, ',', '.').' berhasil diajukan dan sedang diproses!');
    }
}
