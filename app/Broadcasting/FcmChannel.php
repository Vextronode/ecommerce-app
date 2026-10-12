<?php

namespace App\Broadcasting;

use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FcmChannel
{
    /**
     * Send the given notification.
     *
     * @param  mixed  $notifiable
     * @param  \Illuminate\Notifications\Notification  $notification
     * @return void
     */
    public function send($notifiable, Notification $notification)
    {
        $token = $notifiable->routeNotificationFor('fcm') ?? $notifiable->fcm_token;

        if (!$token) {
            return;
        }

        if (method_exists($notification, 'toFcm')) {
            $message = $notification->toFcm($notifiable);
        } else {
            return;
        }

        $this->sendToFcm($notifiable, $token, $message);
    }

    protected function sendToFcm($notifiable, string $token, array $payload)
    {
        try {
            $authConfig = $this->getAuthConfig();

            if (!$authConfig) {
                Log::error('FCM Error: Firebase credentials not found (checked storage/app/firebase-auth.json and FIREBASE_CREDENTIALS_JSON env).');
                return;
            }

            // Using Google Client to get OAuth2 token
            $client = new \Google\Client();
            $client->setAuthConfig($authConfig);
            $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
            $client->fetchAccessTokenWithAssertion();
            $accessToken = $client->getAccessToken();

            if (!$accessToken || !isset($accessToken['access_token'])) {
                Log::error('FCM Error: Failed to obtain Firebase OAuth2 access token.');
                return;
            }

            $projectId = is_array($authConfig)
                ? ($authConfig['project_id'] ?? 'cibendamart')
                : json_decode(file_get_contents($authConfig), true)['project_id'] ?? 'cibendamart';

            // Ensure all data values are strings for FCM v1 API specifications
            if (isset($payload['data']) && is_array($payload['data'])) {
                $payload['data'] = array_map(function ($val) {
                    return is_scalar($val) ? (string) $val : json_encode($val);
                }, $payload['data']);
            }

            // FCM v1 HTTP API Format with High Urgency for instant desktop & mobile push
            $baseConfig = [
                'token' => $token,
                'android' => [
                    'priority' => 'high',
                ],
                'webpush' => [
                    'headers' => [
                        'Urgency' => 'high',
                    ],
                ],
            ];

            $fcmMessage = [
                'message' => array_replace_recursive($baseConfig, $payload),
            ];

            $response = Http::withToken($accessToken['access_token'])
                ->timeout(10)
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $fcmMessage);

            if (!$response->successful()) {
                $body = $response->json();
                Log::error('FCM Send Error: ' . $response->body());

                $errorCode = $body['error']['details'][0]['errorCode'] ?? $body['error']['status'] ?? null;
                $this->bersihkanTokenKadaluarsa($notifiable, $token, $errorCode, $response->status());
            }
        } catch (\Throwable $e) {
            Log::error('FCM Exception: ' . $e->getMessage());
        }
    }

    /**
     * buang token kalau fcm bilang token itu sudah tidak terdaftar.
     *
     * penghapusan wajib berbasis baris db, bukan objek in-memory. job notifikasi
     * (PushNotification implements ShouldQueue) bisa pegang snapshot lama selama
     * fcm balas; kalau user sudah kirim token baru di jendela itu, objek in-memory
     * masih pegang token lama sehingga perbandingan memori salah dan token baru yang sah
     * ikut terhapus. conditional update di bawah cuma nge-null-kan saat kolom db masih
     * token yang dikirim.
     */
    protected function bersihkanTokenKadaluarsa($notifiable, string $token, ?string $errorCode, int $status): void
    {
        if ($errorCode !== 'UNREGISTERED' && $status !== 404) {
            return;
        }

        $adalahModel = $notifiable instanceof \Illuminate\Database\Eloquent\Model;

        if (!$adalahModel || !$notifiable->exists) {
            return;
        }

        // conditional update atomik: baris cuma ke-null-kan kalau fcm_token di db masih sama.
        // pakai newQuery() (hormati global scope/soft deletes), bukan newQueryWithoutScopes().
        $terhapus = $notifiable->newQuery()
            ->whereKey($notifiable->getKey())
            ->where('fcm_token', $token)
            ->update(['fcm_token' => null]);

        if ($terhapus > 0) {
            $notifiable->setRawAttributes(
                array_merge($notifiable->getAttributes(), ['fcm_token' => null]),
                true
            );
            Log::info("FCM: Removed expired token for user #{$notifiable->getKey()}");
        }
    }

    /**
     * Resolve Firebase Auth config from config (raw/base64 JSON) or local file.
     *
     * @return array|string|null
     */
    protected function getAuthConfig()
    {
        $envJson = config('services.firebase.credentials_json');
        if ($envJson) {
            $decoded = json_decode($envJson, true);
            if (is_array($decoded) && isset($decoded['private_key'])) {
                return $decoded;
            }
        }

        $envBase64 = config('services.firebase.credentials_base64');
        if ($envBase64) {
            $decoded = json_decode(base64_decode($envBase64), true);
            if (is_array($decoded) && isset($decoded['private_key'])) {
                return $decoded;
            }
        }

        $filePath = storage_path('app/firebase-auth.json');
        if (file_exists($filePath)) {
            return $filePath;
        }

        $baseFilePath = base_path('firebase-auth.json');
        if (file_exists($baseFilePath)) {
            return $baseFilePath;
        }

        return null;
    }
}
