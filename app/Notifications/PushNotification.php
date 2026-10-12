<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;
use App\Broadcasting\FcmChannel;

class PushNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $title;
    protected $message;
    protected $type;
    protected $actionUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($title, $message, $type = 'promo', $actionUrl = null)
    {
        $this->title = $title;
        $this->message = $message;
        $this->type = $type;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Send to database (for the bell icon dropdown) and FCM (for browser push)
        return ['database', FcmChannel::class];
    }

    /**
     * Get the array representation of the notification for Database.
     *
     * @return array<string, mixed>
     */
    public function toDatabase(object $notifiable): array
    {
        return [
            'title' => $this->title,
            'message' => $this->message,
            'type' => $this->type,
            'action_url' => $this->actionUrl,
        ];
    }

    /**
     * Get the array representation for FCM.
     * 
     * @return array<string, mixed>
     */
    public function toFcm(object $notifiable): array
    {
        $isMerchant = in_array($notifiable->role ?? '', ['pedagang', 'merchant'], true) || str_contains($this->actionUrl ?? '', '/pedagang');
        $icon = $isMerchant ? '/icons/icon-merchant-192.png' : '/icons/icon-192.png';
        $fullIconUrl = url($icon);
        $fullActionUrl = url($this->actionUrl ?? '/');
        $notifTag = (string) ($this->id ?? ($this->title . ':' . $this->message));

        return [
            'notification' => [
                'title' => $this->title,
                'body' => $this->message,
            ],
            'data' => [
                'id' => (string) ($this->id ?? ''),
                'title' => $this->title,
                'message' => $this->message,
                'type' => $this->type,
                'action_url' => $this->actionUrl ?? '',
                'is_merchant' => $isMerchant ? 'true' : 'false',
                'icon' => $icon,
            ],
            'android' => [
                'priority' => 'high',
                'notification' => [
                    'title' => $this->title,
                    'body' => $this->message,
                    'icon' => 'stock_ticker_update',
                    'color' => '#f97316',
                    'default_sound' => true,
                    'default_vibrate_timings' => true,
                    'notification_priority' => 'PRIORITY_MAX',
                ],
            ],
            'webpush' => [
                'headers' => [
                    'Urgency' => 'high',
                    'TTL' => '86400',
                ],
                'notification' => [
                    'title' => $this->title,
                    'body' => $this->message,
                    'icon' => $fullIconUrl,
                    'badge' => $fullIconUrl,
                    'tag' => $notifTag,
                    'renotify' => true,
                    'requireInteraction' => true,
                    'vibrate' => [200, 100, 200, 100, 200],
                    'data' => [
                        'action_url' => $this->actionUrl ?? '/',
                    ],
                ],
                'fcm_options' => [
                    'link' => $fullActionUrl,
                ],
            ],
        ];
    }
}
