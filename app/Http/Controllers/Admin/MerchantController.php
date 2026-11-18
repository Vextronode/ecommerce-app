<?php

namespace App\Http\Controllers\Admin;

use App\Exceptions\Sid\SidApiException;
use App\Exceptions\Sid\SidApplicationCancelledException;
use App\Http\Controllers\Controller;
use App\Jobs\SyncSidSellerApplicationsJob;
use App\Models\Order;
use App\Models\SellerApplication;
use App\Models\Store;
use App\Models\User;
use App\Services\Sid\SidApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MerchantController extends Controller
{
    /**
     * Display a listing of the merchants with server-side pagination, search, and filters.
     */
    public function index(Request $request, SidApiService $sidService): Response
    {
        // Auto-seed mock data on first visit if table is empty
        if (SellerApplication::count() === 0 && $sidService->isEnabled()) {
            (new SyncSidSellerApplicationsJob)->handle($sidService);
        }

        $activeTab = $request->input('tab', 'merchants');
        if (! in_array($activeTab, ['merchants', 'applications'])) {
            $activeTab = 'merchants';
        }

        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status');
        $sidFilter = $request->input('sid_status');
        $subdistrictFilter = $request->input('subdistrict');

        // Query base: only users with role pedagang
        $query = User::where('role', 'pedagang')
            ->with(['store.user'])
            ->latest('id');

        // Search across user name, email, phone, and store attributes
        if (! empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhereHas('store', function ($sq) use ($search) {
                        $sq->where('name', 'like', "%{$search}%")
                            ->orWhere('slug', 'like', "%{$search}%")
                            ->orWhere('address', 'like', "%{$search}%")
                            ->orWhere('subdistrict', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Account Status (active, warning, suspended, inactive)
        if (! empty($statusFilter) && in_array($statusFilter, ['active', 'warning', 'suspended', 'inactive'])) {
            $query->where('status', $statusFilter);
        }

        // Filter by SID / Verification Status (verified, pending, rejected)
        if (! empty($sidFilter) && in_array($sidFilter, ['verified', 'pending', 'rejected'])) {
            $query->whereHas('store', function ($sq) use ($sidFilter) {
                $sq->where('sid_status', $sidFilter);
            });
        }

        // Filter by Subdistrict if provided
        if (! empty($subdistrictFilter)) {
            $query->whereHas('store', function ($sq) use ($subdistrictFilter) {
                $sq->where('subdistrict', $subdistrictFilter);
            });
        }

        // Server-side pagination (10 per page as per UI spec)
        $merchantsPaginator = $query->paginate(10, ['*'], 'merchant_page')->withQueryString();

        // Query applications for Tab 2
        $appSearch = trim((string) $request->input('app_search', ''));
        $appStatus = $request->input('app_status', 'pending');

        $applicationsQuery = SellerApplication::query()->latest('requested_at');

        if (! empty($appSearch)) {
            $applicationsQuery->where(function ($q) use ($appSearch) {
                $q->where('business_name', 'like', "%{$appSearch}%")
                    ->orWhere('name', 'like', "%{$appSearch}%")
                    ->orWhere('nik', 'like', "%{$appSearch}%")
                    ->orWhere('letter_number', 'like', "%{$appSearch}%")
                    ->orWhere('email', 'like', "%{$appSearch}%")
                    ->orWhere('phone', 'like', "%{$appSearch}%");
            });
        }

        if (! empty($appStatus) && in_array($appStatus, ['all', 'pending', 'accepted', 'rejected', 'cancelled'])) {
            if ($appStatus !== 'all') {
                $applicationsQuery->where('status', $appStatus);
            }
        } else {
            $applicationsQuery->where('status', 'pending');
            $appStatus = 'pending';
        }

        $applicationsPaginator = $applicationsQuery->paginate(10, ['*'], 'app_page')->withQueryString();

        // Calculate real-time stats
        $totalMerchants = User::where('role', 'pedagang')->count();
        $suspendedMerchants = User::where('role', 'pedagang')
            ->whereIn('status', ['suspended', 'inactive'])
            ->count();
        $verifiedCount = Store::where('sid_status', 'verified')->count();
        $pendingApplicationsCount = SellerApplication::where('status', 'pending')->count();

        // Transform paginated collection
        $merchantsPaginator->getCollection()->transform(function ($user) {
            $store = $user->store;
            $subdistrict = $store?->subdistrict;

            if (empty($subdistrict) && ! empty($store?->address)) {
                // Heuristic: Extract first district/village mentioned in address if available
                $parts = explode(',', $store->address);
                $subdistrict = trim($parts[0] ?? 'Pangandaran');
            } elseif (empty($subdistrict)) {
                $subdistrict = 'Cibenda';
            }

            return [
                'id' => $user->id,
                'store_id' => $store?->id,
                'name' => $user->name,
                'nik' => $user->nik ?: '-',
                'email' => $user->email,
                'phone' => $user->phone ?: '-',
                'status' => $user->status ?: 'active',
                'created_at' => $user->created_at ? $user->created_at->toISOString() : null,
                'reg_date' => $user->created_at ? $user->created_at->format('d M Y') : '-',
                'store' => [
                    'id' => $store?->id,
                    'name' => $store?->name ?: $user->name,
                    'slug' => $store?->slug ?: Str::slug($user->name),
                    'logo_path' => $store?->logo_path,
                    'description' => $store?->description,
                    'address' => $store?->address ?: '-',
                    'subdistrict' => $subdistrict,
                    'sid_status' => $store?->sid_status ?? 'verified',
                    'balance' => (int) ($store?->available_balance ?? 0),
                ],
                'username' => '@'.preg_replace('/-[0-9a-f]{10,}$/i', '', $store?->slug ?: Str::slug($user->name)),
            ];
        });

        // Transform paginated collection for applications
        $applicationsPaginator->getCollection()->transform(function ($app) {
            return [
                'id' => $app->id,
                'business_ref' => $app->business_ref,
                'status' => $app->status,
                'requested_at' => $app->requested_at ? $app->requested_at->toISOString() : null,
                'requested_date' => $app->requested_at ? $app->requested_at->format('d M Y H:i') : '-',
                'decided_at' => $app->decided_at ? $app->decided_at->toISOString() : null,
                'note' => $app->note,
                'nik' => $app->nik ?: '-',
                'name' => $app->name ?: '-',
                'business_name' => $app->business_name ?: '-',
                'business_activity' => $app->business_activity ?: '-',
                'category' => $app->category ?: '-',
                'category_label' => $app->category_label ?: 'Lainnya',
                'email' => $app->email ?: '-',
                'phone' => $app->phone ?: '-',
                'address' => $app->address ?: '-',
                'letter_number' => $app->letter_number ?: '-',
                'issued_at' => $app->issued_at ? $app->issued_at->format('d M Y') : '-',
                'expires_at' => $app->expires_at ? $app->expires_at->format('d M Y') : '-',
                'store_id' => $app->store_id,
                'user_id' => $app->user_id,
            ];
        });

        return Inertia::render('Admin/Merchants/Index', [
            'merchants' => $merchantsPaginator,
            'applications' => $applicationsPaginator,
            'active_tab' => $activeTab,
            'stats' => [
                'total_merchants' => $totalMerchants,
                'suspended_merchants' => $suspendedMerchants,
                'verified_merchants' => $verifiedCount,
                'pending_merchants' => $pendingApplicationsCount,
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'sid_status' => $sidFilter,
                'subdistrict' => $subdistrictFilter,
            ],
            'app_filters' => [
                'app_search' => $appSearch,
                'app_status' => $appStatus,
            ],
        ]);
    }

    /**
     * Show the form for creating a new merchant account.
     */
    public function create(Request $request): Response
    {
        $application = null;
        $businessRef = $request->query('business_ref');

        if ($businessRef) {
            $app = SellerApplication::where('business_ref', $businessRef)->first();
            if ($app && $app->status === SellerApplication::STATUS_PENDING) {
                $application = [
                    'business_ref' => $app->business_ref,
                    'business_name' => $app->business_name,
                    'business_activity' => $app->business_activity,
                    'name' => $app->name,
                    'nik' => $app->nik,
                    'email' => $app->email,
                    'phone' => $app->phone,
                    'address' => $app->address,
                    'category' => $app->category,
                    'category_label' => $app->category_label,
                    'letter_number' => $app->letter_number,
                ];
            }
        }

        return Inertia::render('Admin/Merchants/Create', [
            'application' => $application,
        ]);
    }

    /**
     * Store a newly created merchant and associated store in storage.
     */
    public function store(Request $request, SidApiService $sidService): RedirectResponse
    {
        $validated = $request->validate([
            'merchant_name' => ['required', 'string', 'min:3', 'max:100'],
            'owner_name' => ['required', 'string', 'min:3', 'max:100'],
            'nik' => ['required', 'string', 'size:16', 'regex:/^[0-9]{16}$/', 'unique:users,nik'],
            'username' => ['nullable', 'string', 'regex:/^[a-zA-Z0-9_\-\.]+$/', 'min:3', 'max:50'],
            'email' => ['required', 'string', 'email:rfc', 'max:150', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'regex:/^(\+62|62|08)[0-9]{7,13}$/'],
            'password' => ['required', 'string', 'min:8'],
            'business_ref' => ['nullable', 'uuid', 'exists:seller_applications,business_ref'],
        ], [
            'merchant_name.required' => 'Nama toko (Store Name) wajib diisi.',
            'merchant_name.min' => 'Nama toko minimal 3 karakter.',
            'merchant_name.max' => 'Nama toko maksimal 100 karakter.',
            'owner_name.required' => 'Nama lengkap pemilik wajib diisi.',
            'owner_name.min' => 'Nama pemilik minimal 3 karakter.',
            'owner_name.max' => 'Nama pemilik maksimal 100 karakter.',
            'nik.required' => 'Nomor Induk Kependudukan (NIK) pemilik wajib diisi.',
            'nik.size' => 'NIK harus tepat 16 digit angka.',
            'nik.regex' => 'NIK hanya boleh berupa 16 digit angka.',
            'nik.unique' => 'NIK ini sudah terdaftar di sistem.',
            'username.regex' => 'Username hanya boleh mengandung huruf, angka, tanda minus (-), titik (.), atau garis bawah (_).',
            'username.min' => 'Username minimal 3 karakter.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid (contoh: pedagang@domain.com).',
            'email.unique' => 'Alamat email ini sudah terdaftar di sistem.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 081234567890 atau +6281234567890).',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal terdiri dari 8 karakter.',
        ]);

        $businessRef = $validated['business_ref'] ?? null;
        $application = null;

        if ($businessRef) {
            $application = SellerApplication::where('business_ref', $businessRef)->firstOrFail();
            if ($application->status !== SellerApplication::STATUS_PENDING) {
                return back()->withErrors(['business_ref' => 'Permohonan ini sudah diproses atau telah dibatalkan.']);
            }
        }

        try {
            DB::transaction(function () use ($validated, $businessRef, $application, $sidService) {
                // Atomic Lock: Notify SID with status accepted BEFORE committing local account
                if ($application) {
                    $sidService->updateApplicationStatus($application->business_ref, 'accepted');
                }

                $user = new User([
                    'name' => strip_tags(trim($validated['owner_name'])),
                    'email' => $validated['email'],
                    'phone' => $validated['phone'] ?? null,
                    'nik' => $validated['nik'],
                    'password' => Hash::make($validated['password']),
                    'is_password_changed' => false,
                ]);
                $user->role = 'pedagang';
                $user->status = 'active';
                $user->email_verified_at = now();
                $user->save();

                $baseSlug = ! empty($validated['username']) ? Str::slug($validated['username']) : Str::slug($validated['merchant_name']);
                $slug = $baseSlug ?: 'toko-'.$user->id;
                $count = 1;
                while (Store::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$count++;
                }

                $store = Store::create([
                    'user_id' => $user->id,
                    'business_ref' => $businessRef,
                    'name' => strip_tags(trim($validated['merchant_name'])),
                    'slug' => $slug,
                    'description' => $application ? $application->business_activity : null,
                    'subdistrict' => 'Cibenda',
                    'address' => $application ? $application->address : null,
                    'support_email' => $validated['email'],
                ]);
                $store->forceFill(['sid_status' => 'verified'])->save();

                if ($application) {
                    $application->update([
                        'status' => SellerApplication::STATUS_ACCEPTED,
                        'decided_at' => now(),
                        'user_id' => $user->id,
                        'store_id' => $store->id,
                    ]);
                }
            });
        } catch (SidApplicationCancelledException $e) {
            if ($application) {
                $application->anonymizeCancelled();
            }

            return redirect()->route('admin.merchants.index', ['tab' => 'applications'])
                ->with('error', 'Permohonan telah dibatalkan oleh pemohon di SID. Akun tidak dapat dibuat.');
        } catch (\Throwable $e) {
            return back()->withInput()->withErrors(['general' => 'Gagal membuat akun pedagang: ' . $e->getMessage()]);
        }

        return redirect()->route('admin.merchants.index', ['tab' => 'merchants'])
            ->with('success', 'Akun pedagang berhasil dibuat dan status telah disinkronkan ke SID.');
    }

    /**
     * Reject a pending seller application with reason note.
     */
    public function rejectApplication(Request $request, string $businessRef, SidApiService $sidService): RedirectResponse
    {
        $validated = $request->validate([
            'note' => ['required', 'string', 'min:3', 'max:500'],
        ], [
            'note.required' => 'Alasan penolakan wajib diisi.',
            'note.min' => 'Alasan penolakan minimal 3 karakter.',
            'note.max' => 'Alasan penolakan maksimal 500 karakter.',
        ]);

        $application = SellerApplication::where('business_ref', $businessRef)->firstOrFail();

        if ($application->status !== SellerApplication::STATUS_PENDING) {
            return back()->with('error', 'Permohonan ini sudah diproses atau tidak lagi berstatus pending.');
        }

        try {
            $sidService->updateApplicationStatus($businessRef, 'rejected', $validated['note']);

            $application->update([
                'status' => SellerApplication::STATUS_REJECTED,
                'note' => $validated['note'],
                'decided_at' => now(),
            ]);

            return back()->with('success', 'Permohonan pedagang berhasil ditolak dan alasan telah dikirimkan ke SID.');
        } catch (SidApplicationCancelledException) {
            $application->anonymizeCancelled();
            return back()->with('error', 'Permohonan telah dibatalkan oleh pemohon di SID.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menolak permohonan ke SID: ' . $e->getMessage());
        }
    }

    /**
     * Trigger manual sync with SID API.
     */
    public function syncApplications(SidApiService $sidService): RedirectResponse
    {
        try {
            (new SyncSidSellerApplicationsJob)->handle($sidService);
            return back()->with('success', 'Sinkronisasi permohonan dari SID berhasil dijalankan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Sinkronisasi SID gagal: ' . $e->getMessage());
        }
    }


    /**
     * Update the specified merchant account in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::where('role', 'pedagang')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'nik' => ['nullable', 'string', 'size:16', 'regex:/^[0-9]{16}$/', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:150', Rule::unique('users')->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:25'],
            'password' => ['nullable', 'string', 'min:8'],
            'store_name' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:500'],
            'subdistrict' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:active,warning,suspended,inactive'],
            'sid_status' => ['required', 'string', 'in:verified,pending,rejected'],
        ]);

        DB::transaction(function () use ($user, $validated) {
            $userPayload = [
                'name' => strip_tags(trim($validated['name'])),
                'email' => $validated['email'],
                'phone' => isset($validated['phone']) ? strip_tags(trim($validated['phone'])) : null,
            ];

            if (array_key_exists('nik', $validated)) {
                $userPayload['nik'] = $validated['nik'];
            }

            if (! empty($validated['password'])) {
                $userPayload['password'] = Hash::make($validated['password']);
            }

            $user->update($userPayload);
            $user->status = $validated['status'];
            if (in_array($validated['status'], ['suspended', 'inactive'], true)) {
                $user->setRememberToken(Str::random(60));
                $user->forceFill(['fcm_token' => null]);
            }
            $user->save();

            if (in_array($validated['status'], ['suspended', 'inactive'], true)) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
            }

            $store = $user->store;
            if ($store) {
                $store->update([
                    'name' => strip_tags(trim($validated['store_name'])),
                    'description' => isset($validated['description']) ? strip_tags(trim($validated['description'])) : null,
                    'subdistrict' => isset($validated['subdistrict']) ? strip_tags(trim($validated['subdistrict'])) : 'Cibenda',
                    'address' => isset($validated['address']) ? strip_tags(trim($validated['address'])) : null,
                ]);
                $store->forceFill(['sid_status' => $validated['sid_status']])->save();
            } else {
                $baseSlug = Str::slug($validated['store_name']) ?: 'toko-'.$user->id;
                $slug = $baseSlug;
                $count = 1;
                while (Store::where('slug', $slug)->exists()) {
                    $slug = $baseSlug.'-'.$count++;
                }

                $store = Store::create([
                    'user_id' => $user->id,
                    'name' => strip_tags(trim($validated['store_name'])),
                    'slug' => $slug,
                    'description' => isset($validated['description']) ? strip_tags(trim($validated['description'])) : null,
                    'subdistrict' => isset($validated['subdistrict']) ? strip_tags(trim($validated['subdistrict'])) : 'Cibenda',
                    'address' => isset($validated['address']) ? strip_tags(trim($validated['address'])) : null,
                    'support_email' => $validated['email'],
                ]);
                $store->forceFill(['sid_status' => $validated['sid_status']])->save();
            }
        });

        return redirect()->back()->with('success', 'Data pedagang berhasil diperbarui.');
    }

    /**
     * Quick update for account status (Active / Warning / Suspended / Inactive).
     */
    public function updateStatus(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:active,warning,suspended,inactive'],
        ]);

        $user = User::where('role', 'pedagang')->findOrFail($id);
        $user->status = $validated['status'];
        if (in_array($validated['status'], ['suspended', 'inactive'], true)) {
            $user->setRememberToken(Str::random(60));
            $user->forceFill(['fcm_token' => null]);
        }
        $user->save();

        if (in_array($validated['status'], ['suspended', 'inactive'], true)) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
        }

        $statusLabel = ucfirst($validated['status']);

        return redirect()->back()->with('success', "Status akun berhasil diubah menjadi {$statusLabel}.");
    }

    /**
     * Quick update for Store SID / Verification status.
     */
    public function updateVerification(Request $request, int $id): RedirectResponse
    {
        $validated = $request->validate([
            'sid_status' => ['required', 'string', 'in:verified,pending,rejected'],
        ]);

        $user = User::where('role', 'pedagang')->findOrFail($id);
        $store = $user->store;

        if (! $store) {
            abort(404);
        }

        $store->forceFill(['sid_status' => $validated['sid_status']])->save();

        $label = ucfirst($validated['sid_status']);

        return redirect()->back()->with('success', "Status verifikasi toko berhasil diubah menjadi {$label}.");
    }

    /**
     * Remove the specified merchant account from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = User::where('role', 'pedagang')->with('store')->findOrFail($id);
        $store = $user->store;

        if ($store) {
            $hasActiveOrders = Order::where('store_id', $store->id)
                ->whereIn('shipping_status', ['pending', 'processing', 'shipped'])
                ->exists();

            $hasRemainingBalance = ((float) $store->available_balance > 0) || ((float) $store->pending_balance > 0);
            $hasActiveWithdrawals = $store->withdrawals()
                ->where(function ($query) {
                    $query->whereIn('status', ['pending', 'processing'])
                        ->orWhere('needs_reconciliation', true);
                })
                ->exists();

            if ($hasActiveOrders || $hasRemainingBalance || $hasActiveWithdrawals) {
                return redirect()->back()->with('error', 'Tidak dapat menghapus pedagang yang masih memiliki pesanan aktif, saldo mengendap, atau penarikan dana yang sedang diproses. Gunakan fitur Suspend sebagai gantinya.');
            }
        }

        DB::transaction(function () use ($user, $store) {
            DB::table('sessions')->where('user_id', $user->id)->delete();
            if ($store) {
                $store->delete();
            }
            $user->delete();
        });

        return redirect()->back()->with('success', 'Akun pedagang dan toko berhasil dihapus.');
    }
}
