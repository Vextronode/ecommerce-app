<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MidtransIrisService
{
    private string $irisApiKey;

    private string $baseUrl;

    private bool $isProduction;

    private bool $mockEnabled;

    private string $payoutPath;

    private string $payoutStatusPath;

    public function __construct()
    {
        $this->irisApiKey = (string) config('services.midtrans.iris_api_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->mockEnabled = (bool) config('services.midtrans.iris_mock', true);
        $this->payoutPath = (string) config('services.midtrans.iris_payout_path', '/payouts');
        $this->payoutStatusPath = (string) config('services.midtrans.iris_payout_status_path', '/payouts/{reference_no}');
        $this->baseUrl = $this->isProduction
            ? 'https://app.midtrans.com/iris/api/v1'
            : 'https://app.sandbox.midtrans.com/iris/api/v1';
    }

    /**
     * Create payout (disbursement) to bank account.
     *
     * @param array $payoutData
     * @return array
     * @throws \RuntimeException
     */
    public function createPayout(array $payoutData): array
    {
        if ($this->isProduction && empty($this->irisApiKey)) {
            throw new \RuntimeException('Midtrans IRIS API Key belum dikonfigurasi di environment produksi.');
        }

        // Allow mock/simulation mode when not in production and configured or without API key
        if (! $this->isProduction && ($this->mockEnabled || empty($this->irisApiKey))) {
            Log::info('Midtrans Iris Payout: running in local mock/simulation mode.');

            return [
                'status' => 'success',
                'simulated' => true,
                'message' => 'Payout berhasil diproses via Midtrans IRIS Simulator Sandbox.',
            ];
        }

        try {
            $headers = [
                'Accept' => 'application/json',
                'Content-Type' => 'application/json',
            ];
            if (! empty($payoutData['idempotency_key'])) {
                $headers['X-Idempotency-Key'] = (string) $payoutData['idempotency_key'];
            }

            $response = Http::withBasicAuth($this->irisApiKey, '')
                ->withHeaders($headers)
                ->timeout(15)
                ->post("{$this->baseUrl}{$this->payoutPath}", [
                    'payouts' => [
                        [
                            'beneficiary_name' => $payoutData['beneficiary_name'],
                            'beneficiary_account' => $payoutData['beneficiary_account'],
                            'beneficiary_bank' => strtolower($payoutData['beneficiary_bank']),
                            'amount' => (string) $payoutData['amount'],
                            'notes' => $payoutData['notes'] ?? 'Penarikan Saldo Toko',
                        ],
                    ],
                ]);

            if ($response->successful()) {
                return [
                    'status' => 'success',
                    'simulated' => false,
                    'data' => $response->json(),
                ];
            }

            if ($response->status() === 429) {
                $retryAfter = (int) ($response->header('Retry-After') ?: 60);
                throw new \App\Exceptions\GatewayRateLimitedException(
                    'Gateway Midtrans IRIS mengembalikan 429 Too Many Requests (Rate Limited).',
                    $retryAfter
                );
            }

            if (in_array($response->status(), [502, 503, 504])) {
                // 5xx artinya request udah nyampe gateway tapi ga dapet jawaban pasti.
                // payout mungkin udah kebuat, jadi jangan dianggap rate-limit yang aman di-retry dari nol.
                throw new \App\Exceptions\GatewayUncertainException(
                    "Gateway Midtrans IRIS memberi respons ambigu saat kirim payout (HTTP {$response->status()}).",
                    $response->status()
                );
            }

            $errorBody = $response->body();
            Log::error('Midtrans Iris Payout API Error: '.$errorBody);

            $errorData = $response->json();
            $errorMessage = $errorData['errors'][0] ?? $errorData['message'] ?? 'API Midtrans IRIS menolak permintaan penarikan dana.';

            throw new \RuntimeException($errorMessage);
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Midtrans Iris Payout Exception: '.$e->getMessage());

            throw new \RuntimeException('Gagal menghubungi gateway pembayaran Midtrans IRIS: '.$e->getMessage(), 0, $e);
        }
    }

    /**
     * cek status payout yang udah pernah dikirim ke IRIS berdasarkan reference_no
     * dipakai buat rekonsiliasi withdrawal yang nyangkut processing
     *
     * @return array{status: string, found: bool, raw: array}
     *
     * @throws \RuntimeException kalau gateway ga bisa dihubungi atau balikin error
     */
    public function getPayoutStatus(string $referenceNo): array
    {
        if ($this->isProduction && empty($this->irisApiKey)) {
            throw new \RuntimeException('Midtrans IRIS API Key belum dikonfigurasi di environment produksi.');
        }

        // mode mock/simulasi lokal: ga ada gateway beneran, jadi anggap payout selalu sukses
        if (! $this->isProduction && ($this->mockEnabled || empty($this->irisApiKey))) {
            Log::info("Midtrans Iris Payout Status: mock mode, reference {$referenceNo} dianggap completed.");

            return [
                'status' => 'completed',
                'found' => true,
                'raw' => ['status' => 'completed', 'simulated' => true],
            ];
        }

        try {
            $statusPath = str_replace('{reference_no}', rawurlencode($referenceNo), $this->payoutStatusPath);
            $response = Http::withBasicAuth($this->irisApiKey, '')
                ->withHeaders(['Accept' => 'application/json'])
                ->timeout(15)
                ->get("{$this->baseUrl}{$statusPath}");

            // 404 artinya reference_no ga ketemu di sisi gateway, ini bukan error transport
            if ($response->status() === 404) {
                return [
                    'status' => 'not_found',
                    'found' => false,
                    'raw' => (array) $response->json(),
                ];
            }

            if ($response->successful()) {
                $data = (array) $response->json();
                $status = strtolower((string) ($data['status'] ?? ''));

                return [
                    'status' => $status !== '' ? $status : 'unknown',
                    'found' => true,
                    'raw' => $data,
                ];
            }

            if (in_array($response->status(), [502, 503, 504])) {
                // 5xx saat cek status itu ambigu, bukan rate-limit yang aman di-retry dari nol
                throw new \App\Exceptions\GatewayUncertainException(
                    "Gateway Midtrans IRIS sedang mengalami gangguan sementara saat cek status (HTTP {$response->status()}).",
                    $response->status()
                );
            }

            $errorBody = $response->body();
            Log::error('Midtrans Iris Payout Status API Error: '.$errorBody);

            $errorData = $response->json();
            $errorMessage = $errorData['errors'][0] ?? $errorData['message'] ?? 'API Midtrans IRIS menolak permintaan cek status payout.';

            throw new \RuntimeException($errorMessage);
        } catch (\RuntimeException $e) {
            throw $e;
        } catch (\Throwable $e) {
            Log::error('Midtrans Iris Payout Status Exception: '.$e->getMessage());

            throw new \RuntimeException('Gagal menghubungi gateway Midtrans IRIS buat cek status payout: '.$e->getMessage(), 0, $e);
        }
    }
}
