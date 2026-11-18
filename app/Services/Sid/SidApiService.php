<?php

namespace App\Services\Sid;

use App\Exceptions\Sid\SidAlreadyProcessedException;
use App\Exceptions\Sid\SidApiException;
use App\Exceptions\Sid\SidApplicationCancelledException;
use App\Models\SellerApplication;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SidApiService
{
    protected string $baseUrl;
    protected string $token;
    protected bool $enabled;
    protected bool $isMock;

    public function __construct()
    {
        $this->baseUrl = rtrim((string) config('services.sid.url', ''), '/');
        $this->token = (string) config('services.sid.token', '');
        $this->enabled = (bool) config('services.sid.enabled', true);
        $this->isMock = (bool) config('services.sid.mock', true);

        if (! $this->isMock && $this->enabled && empty($this->baseUrl)) {
            throw new SidApiException('Konfigurasi SID_API_URL belum diatur pada .env', 500);
        }
    }

    public function isMock(): bool
    {
        return $this->isMock;
    }

    public function isEnabled(): bool
    {
        return $this->enabled;
    }

    protected function client(): PendingRequest
    {
        return Http::baseUrl($this->baseUrl)
            ->withToken($this->token)
            ->acceptJson()
            ->timeout(10);
    }

    /**
     * Test connection and token integrity via GET /ping
     */
    public function ping(): array
    {
        if ($this->isMock) {
            return [
                'data' => [
                    'client' => 'Cimart (Mock)',
                    'abilities' => ['seller-applications:read', 'seller-applications:update'],
                    'server_time' => now()->toIso8601String(),
                ],
            ];
        }

        $response = $this->client()->get('/ping');
        return $this->handleResponse($response);
    }

    /**
     * Fetch seller applications queue from SID
     */
    public function fetchApplications(string $status = 'pending', int $page = 1, int $perPage = 50, ?string $since = null): array
    {
        if ($this->isMock) {
            return $this->mockApplicationsList($status, $page, $perPage);
        }

        $params = [
            'status' => $status,
            'page' => $page,
            'per_page' => $perPage,
        ];

        if ($since) {
            $params['since'] = $since;
        }

        $response = $this->client()->get('/seller-applications', $params);
        return $this->handleResponse($response);
    }

    /**
     * Get detail of a single application by UUID business_ref
     */
    public function getApplicationDetail(string $businessRef): array
    {
        if ($this->isMock) {
            return $this->mockApplicationDetail($businessRef);
        }

        $response = $this->client()->get("/seller-applications/{$businessRef}");
        return $this->handleResponse($response);
    }

    /**
     * Update application status (accepted / rejected) via PATCH /seller-applications/{business_ref}
     */
    public function updateApplicationStatus(string $businessRef, string $status, ?string $note = null): array
    {
        if ($this->isMock) {
            return $this->mockUpdateApplicationStatus($businessRef, $status, $note);
        }

        $payload = ['status' => $status];
        if ($status === 'rejected') {
            $payload['note'] = $note;
        }

        $response = $this->client()->patch("/seller-applications/{$businessRef}", $payload);
        return $this->handleResponse($response);
    }

    /**
     * Handle HTTP responses and map standard error codes
     */
    protected function handleResponse(Response $response): array
    {
        if ($response->successful()) {
            return $response->json();
        }

        $status = $response->status();
        $json = $response->json() ?? [];
        $code = $json['code'] ?? null;
        $message = $json['message'] ?? 'SID API request failed with status ' . $status;

        if ($status === 410 || $code === 'application_cancelled') {
            throw new SidApplicationCancelledException($message);
        }

        if ($status === 409 || $code === 'application_already_processed') {
            throw new SidAlreadyProcessedException($message);
        }

        Log::warning('SID API call returned error', [
            'status' => $status,
            'code' => $code,
            'message' => $message,
        ]);

        throw new SidApiException($message, $status, $code);
    }

    /**
     * Mock Data Provider matching openapi.yaml specifications
     */
    protected function mockApplicationsList(string $status, int $page, int $perPage): array
    {
        $mockDatabase = [
            [
                'business_ref' => '3f6c2a9e-8b1d-4c57-9e2a-0d4b7f1a2c3e',
                'status' => 'pending',
                'requested_at' => now()->subHours(5)->toIso8601String(),
                'decided_at' => null,
                'note' => null,
                'nik' => '3201010101900001',
                'name' => 'Joni Saputra',
                'business_name' => 'Warung Kopi Joni',
                'business_activity' => 'Warung kopi dan makanan ringan khas Pangandaran',
                'category' => 'kuliner',
                'category_label' => 'Toko Kuliner',
                'email' => 'warkopjoni@example.com',
                'phone' => '081234567890',
                'address' => 'Jl. Raya Cibenda No. 12, RT 01/RW 02, Desa Cibenda',
                'letter_number' => '470/012/Des/XI/2026',
                'issued_at' => now()->subDays(2)->toIso8601String(),
                'expires_at' => now()->addYear()->toIso8601String(),
            ],
            [
                'business_ref' => '8e2a1b4c-9f3d-4c58-8b1d-1e5c8f2a3d4e',
                'status' => 'pending',
                'requested_at' => now()->subHours(2)->toIso8601String(),
                'decided_at' => null,
                'note' => null,
                'nik' => '3201010202950002',
                'name' => 'Siti Maryam',
                'business_name' => 'Toko Kelontong Berkah Ibu',
                'business_activity' => 'Toko kelontong sembako dan kebutuhan harian',
                'category' => 'kelontong',
                'category_label' => 'Toko Kelontong',
                'email' => 'berkahibu.cibenda@example.com',
                'phone' => '085712345678',
                'address' => 'Dusun Karanganyar RT 03/RW 01, Desa Cibenda',
                'letter_number' => '470/015/Des/XI/2026',
                'issued_at' => now()->subDays(1)->toIso8601String(),
                'expires_at' => now()->addYear()->toIso8601String(),
            ],
        ];

        // Filter based on status and check if locally processed
        $filtered = array_values(array_filter($mockDatabase, function ($item) use ($status) {
            // Check if local database already has a decided status for this ref
            $local = SellerApplication::where('business_ref', $item['business_ref'])->first();
            if ($local && $local->status !== 'pending' && $status === 'pending') {
                return false;
            }
            return $item['status'] === $status;
        }));

        return [
            'data' => $filtered,
            'meta' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => count($filtered),
                'last_page' => 1,
            ],
        ];
    }

    protected function mockApplicationDetail(string $businessRef): array
    {
        $list = $this->mockApplicationsList('pending', 1, 10)['data'];
        foreach ($list as $item) {
            if ($item['business_ref'] === $businessRef) {
                return ['data' => $item];
            }
        }

        // Check if in local DB
        $local = SellerApplication::where('business_ref', $businessRef)->first();
        if ($local) {
            if ($local->status === SellerApplication::STATUS_CANCELLED) {
                throw new SidApplicationCancelledException();
            }
            return [
                'data' => [
                    'business_ref' => $local->business_ref,
                    'status' => $local->status,
                    'requested_at' => $local->requested_at?->toIso8601String(),
                    'decided_at' => $local->decided_at?->toIso8601String(),
                    'note' => $local->note,
                    'nik' => $local->nik,
                    'name' => $local->name,
                    'business_name' => $local->business_name,
                    'business_activity' => $local->business_activity,
                    'category' => $local->category,
                    'category_label' => $local->category_label,
                    'email' => $local->email,
                    'phone' => $local->phone,
                    'address' => $local->address,
                    'letter_number' => $local->letter_number,
                    'issued_at' => $local->issued_at?->toIso8601String(),
                    'expires_at' => $local->expires_at?->toIso8601String(),
                ],
            ];
        }

        throw new SidApiException('Data tidak ditemukan.', 404);
    }

    protected function mockUpdateApplicationStatus(string $businessRef, string $status, ?string $note = null): array
    {
        if ($status === 'rejected' && empty(trim((string) $note))) {
            throw new SidApiException('Alasan penolakan wajib diisi.', 422);
        }

        // Simulate cancellation edge case if business_ref ends with 'c44ce1'
        if (str_ends_with($businessRef, 'c44ce1')) {
            throw new SidApplicationCancelledException();
        }

        return [
            'data' => [
                'business_ref' => $businessRef,
                'status' => $status,
                'decided_at' => now()->toIso8601String(),
                'note' => $note,
            ],
        ];
    }
}
