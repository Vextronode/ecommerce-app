<?php

namespace App\Http\Controllers\Merchant;

use App\Events\WithdrawalUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\ProcessWithdrawalPayout;
use App\Models\Order;
use App\Models\Store;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('store');
        $store = $user->store;

        if (! $store) {
            return redirect()->route('merchant.store.setup');
        }

        // Calculate earnings from delivered + paid orders
        $totalEarnings = Order::where('store_id', $store->id)
            ->where('shipping_status', 'delivered')
            ->sum('subtotal');

        $totalWithdrawn = Withdrawal::where('store_id', $store->id)
            ->where('status', 'completed')
            ->sum('amount');

        $withdrawals = Withdrawal::where('store_id', $store->id)
            ->latest()
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
                'total_withdrawn' => (float) $totalWithdrawn,
                'total_earnings' => (float) $totalEarnings,
            ],
        ]);
    }

    public function updateBank(Request $request)
    {
        $validated = $request->validate([
            'bank_name' => 'required|string|max:50',
            'bank_account_number' => 'required|string|max:30',
            'bank_account_holder' => 'required|string|max:100',
        ]);

        $store = $request->user()->store;
        $store->update($validated);

        return back()->with('success', 'Informasi rekening bank berhasil diperbarui.');
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
                'numeric',
                'min:10000',
            ],
        ], [
            'amount.min' => 'Minimal penarikan saldo adalah Rp 10.000.',
        ]);

        $amount = (float) $validated['amount'];
        $refNo = 'WD-'.date('YmdHis').'-'.strtoupper(substr(uniqid(), -4));

        // Phase 1: Atomically lock store, check balance, deduct available_balance, and create pending withdrawal
        try {
            $withdrawal = DB::transaction(function () use ($store, $amount, $refNo) {
                $lockedStore = Store::where('id', $store->id)->lockForUpdate()->firstOrFail();

                // Prevent race condition & double-spending: reject if a withdrawal is already pending
                $hasPending = Withdrawal::where('store_id', $lockedStore->id)
                    ->where('status', 'pending')
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
