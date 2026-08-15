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
            return; // Requires specific formatting
        }

        $this->sendToFcm($token, $message);
    }

    protected function sendToFcm($token, $payload)
    {
        try {
            $credentialsPath = storage_path('app/firebase-auth.json');
            
            if (!file_exists($credentialsPath)) {
                Log::error('Firebase credentials not found at: ' . $credentialsPath);
                return;
            }

            // Using Google Client to get OAuth2 token
            $client = new \Google\Client();
            $client->setAuthConfig($credentialsPath);
            $client->addScope('https://www.googleapis.com/auth/firebase.messaging');
            $client->fetchAccessTokenWithAssertion();
            $accessToken = $client->getAccessToken();

            if (!$accessToken || !isset($accessToken['access_token'])) {
                Log::error('Failed to get Firebase access token');
                return;
            }

            $projectId = json_decode(file_get_contents($credentialsPath))->project_id;
            
            // FCM v1 HTTP API Format
            $fcmMessage = [
                'message' => array_merge([
                    'token' => $token
                ], $payload)
            ];

            $response = Http::withToken($accessToken['access_token'])
                ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", $fcmMessage);

            if (!$response->successful()) {
                Log::error('FCM Send Error: ' . $response->body());
            }
        } catch (\Exception $e) {
            Log::error('FCM Exception: ' . $e->getMessage());
        }
    }
}
