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
                'message' => array_merge($baseConfig, $payload),
            ];

            $response = Http::withToken($accessToken['access_token'])
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $fcmMessage);

            if (!$response->successful()) {
                $body = $response->json();
                Log::error('FCM Send Error: ' . $response->body());

                // If token is invalid or unregistered, clean it up from user
                $errorCode = $body['error']['details'][0]['errorCode'] ?? $body['error']['status'] ?? null;
                if ($errorCode === 'UNREGISTERED' || $response->status() === 404) {
                    if (isset($notifiable->fcm_token)) {
                        $notifiable->update(['fcm_token' => null]);
                        Log::info("FCM: Removed expired token for user #{$notifiable->id}");
                    }
                }
            }
        } catch (\Throwable $e) {
            Log::error('FCM Exception: ' . $e->getMessage());
        }
    }

    /**
     * Resolve Firebase Auth config from ENV (raw/base64 JSON) or local file.
     *
     * @return array|string|null
     */
    protected function getAuthConfig()
    {
        // 1. Check environment variable (Raw JSON)
        $envJson = env('FIREBASE_CREDENTIALS_JSON');
        if ($envJson) {
            $decoded = json_decode($envJson, true);
            if (is_array($decoded) && isset($decoded['private_key'])) {
                return $decoded;
            }
        }

        // 2. Check environment variable (Base64 Encoded JSON)
        $envBase64 = env('FIREBASE_CREDENTIALS_BASE64');
        if ($envBase64) {
            $decoded = json_decode(base64_decode($envBase64), true);
            if (is_array($decoded) && isset($decoded['private_key'])) {
                return $decoded;
            }
        }

        // 3. Check storage/app/firebase-auth.json
        $filePath = storage_path('app/firebase-auth.json');
        if (file_exists($filePath)) {
            return $filePath;
        }

        // 4. Check base path fallback
        $baseFilePath = base_path('firebase-auth.json');
        if (file_exists($baseFilePath)) {
            return $baseFilePath;
        }

        return null;
    }
}
