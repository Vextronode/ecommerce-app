<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Store;
use App\Models\User;
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
    public function index(Request $request): Response
    {
        $search = trim((string) $request->input('search', ''));
        $statusFilter = $request->input('status');
        $sidFilter = $request->input('sid_status');
        $subdistrictFilter = $request->input('subdistrict');

        // Query base: only users with role pedagang
        $query = User::where('role', 'pedagang')
            ->with(['store'])
            ->latest('id');

        // Search across user name, email, phone, and store attributes
        if (!empty($search)) {
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
        if (!empty($statusFilter) && in_array($statusFilter, ['active', 'warning', 'suspended', 'inactive'])) {
            $query->where('status', $statusFilter);
        }

        // Filter by SID / Verification Status (verified, pending, rejected)
        if (!empty($sidFilter) && in_array($sidFilter, ['verified', 'pending', 'rejected'])) {
            $query->whereHas('store', function ($sq) use ($sidFilter) {
                $sq->where('sid_status', $sidFilter);
            });
        }

        // Filter by Subdistrict if provided
        if (!empty($subdistrictFilter)) {
            $query->whereHas('store', function ($sq) use ($subdistrictFilter) {
                $sq->where('subdistrict', $subdistrictFilter);
            });
        }

        // Server-side pagination (10 per page as per UI spec)
        $merchantsPaginator = $query->paginate(10)->withQueryString();

        // Calculate real-time stats
        $totalMerchants = User::where('role', 'pedagang')->count();
        $suspendedMerchants = User::where('role', 'pedagang')
            ->whereIn('status', ['suspended', 'inactive'])
            ->count();
        $verifiedCount = Store::where('sid_status', 'verified')->count();
        $pendingCount = Store::where('sid_status', 'pending')->count();

        // Transform paginated collection
        $merchantsPaginator->getCollection()->transform(function ($user) {
            $store = $user->store;
            $subdistrict = $store?->subdistrict;

            if (empty($subdistrict) && !empty($store?->address)) {
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
                    'sid_status' => $store?->sid_status ?: 'verified',
                    'balance' => (int) ($store?->balance ?? 0),
                ],
                'username' => '@' . preg_replace('/-[0-9a-f]{10,}$/i', '', $store?->slug ?: Str::slug($user->name)),
            ];
        });

        return Inertia::render('Admin/Merchants/Index', [
            'merchants' => $merchantsPaginator,
            'stats' => [
                'total_merchants' => $totalMerchants,
                'suspended_merchants' => $suspendedMerchants,
                'verified_merchants' => $verifiedCount,
                'pending_merchants' => $pendingCount,
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'sid_status' => $sidFilter,
                'subdistrict' => $subdistrictFilter,
            ],
        ]);
    }

    /**
     * Show the form for creating a new merchant account.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Merchants/Create');
    }

    /**
     * Store a newly created merchant and associated store in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'merchant_name' => ['required', 'string', 'min:3', 'max:100'],
            'owner_name' => ['required', 'string', 'min:3', 'max:100'],
            'username' => ['nullable', 'string', 'regex:/^[a-zA-Z0-9_\-\.]+$/', 'min:3', 'max:50'],
            'email' => ['required', 'string', 'email:rfc', 'max:150', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'regex:/^(\+62|62|08)[0-9]{7,13}$/'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'merchant_name.required' => 'Nama toko (Store Name) wajib diisi.',
            'merchant_name.min' => 'Nama toko minimal 3 karakter.',
            'merchant_name.max' => 'Nama toko maksimal 100 karakter.',
            'owner_name.required' => 'Nama lengkap pemilik wajib diisi.',
            'owner_name.min' => 'Nama pemilik minimal 3 karakter.',
            'owner_name.max' => 'Nama pemilik maksimal 100 karakter.',
            'username.regex' => 'Username hanya boleh mengandung huruf, angka, tanda minus (-), titik (.), atau garis bawah (_).',
            'username.min' => 'Username minimal 3 karakter.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid (contoh: pedagang@domain.com).',
            'email.unique' => 'Alamat email ini sudah terdaftar di sistem.',
            'phone.regex' => 'Format nomor telepon tidak valid. Gunakan format Indonesia (contoh: 081234567890 atau +6281234567890).',
            'password.required' => 'Password wajib diisi.',
            'password.min' => 'Password minimal terdiri dari 8 karakter.',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['owner_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => Hash::make($validated['password']),
                'role' => 'pedagang',
                'status' => 'active',
                'is_password_changed' => false,
                'email_verified_at' => now(),
            ]);

            $baseSlug = !empty($validated['username']) ? Str::slug($validated['username']) : Str::slug($validated['merchant_name']);
            $slug = $baseSlug ?: 'toko-' . $user->id;
            $count = 1;
            while (Store::where('slug', $slug)->exists()) {
                $slug = $baseSlug . '-' . $count++;
            }

            Store::create([
                'user_id' => $user->id,
                'name' => $validated['merchant_name'],
                'slug' => $slug,
                'description' => null,
                'subdistrict' => 'Cibenda',
                'address' => null,
                'support_email' => $validated['email'],
                'sid_status' => 'verified',
            ]);
        });

        return redirect()->route('admin.merchants.index')->with('success', 'Akun pedagang berhasil dibuat.');
    }

    /**
     * Update the specified merchant account in storage.
     */
    public function update(Request $request, int $id): RedirectResponse
    {
        $user = User::where('role', 'pedagang')->findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
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
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'status' => $validated['status'],
            ];

            if (!empty($validated['password'])) {
                $userPayload['password'] = Hash::make($validated['password']);
            }

            $user->update($userPayload);

            $store = $user->store;
            if ($store) {
                $store->update([
                    'name' => $validated['store_name'],
                    'description' => $validated['description'] ?? null,
                    'subdistrict' => $validated['subdistrict'] ?? 'Cibenda',
                    'address' => $validated['address'] ?? null,
                    'sid_status' => $validated['sid_status'],
                ]);
            } else {
                $baseSlug = Str::slug($validated['store_name']);
                $slug = $baseSlug;
                $count = 1;
                while (Store::where('slug', $slug)->exists()) {
                    $slug = $baseSlug . '-' . $count++;
                }

                Store::create([
                    'user_id' => $user->id,
                    'name' => $validated['store_name'],
                    'slug' => $slug,
                    'description' => $validated['description'] ?? null,
                    'subdistrict' => $validated['subdistrict'] ?? 'Cibenda',
                    'address' => $validated['address'] ?? null,
                    'support_email' => $validated['email'],
                    'sid_status' => $validated['sid_status'],
                ]);
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
        $user->update(['status' => $validated['status']]);

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

        $store = Store::findOrFail($id);
        $store->update(['sid_status' => $validated['sid_status']]);

        $label = ucfirst($validated['sid_status']);
        return redirect()->back()->with('success', "Status verifikasi toko berhasil diubah menjadi {$label}.");
    }

    /**
     * Remove the specified merchant account from storage.
     */
    public function destroy(int $id): RedirectResponse
    {
        $user = User::where('role', 'pedagang')->findOrFail($id);

        DB::transaction(function () use ($user) {
            if ($user->store) {
                $user->store->delete();
            }
            $user->delete();
        });

        return redirect()->back()->with('success', 'Akun pedagang dan toko berhasil dihapus.');
    }
}
