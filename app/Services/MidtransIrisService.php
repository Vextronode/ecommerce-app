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

    public function __construct()
    {
        $this->irisApiKey = (string) config('services.midtrans.iris_api_key', '');
        $this->isProduction = (bool) config('services.midtrans.is_production', false);
        $this->mockEnabled = (bool) config('services.midtrans.iris_mock', true);
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
            $response = Http::withBasicAuth($this->irisApiKey, '')
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ])
                ->timeout(15)
                ->post("{$this->baseUrl}/payouts", [
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
                throw new \App\Exceptions\GatewayRateLimitedException(
                    "Gateway Midtrans IRIS sedang mengalami gangguan sementara (HTTP {$response->status()}).",
                    60
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
}
