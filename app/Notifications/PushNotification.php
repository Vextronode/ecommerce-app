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
        return [
            'data' => [
                'title' => $this->title,
                'message' => $this->message,
                'type' => $this->type,
                'action_url' => $this->actionUrl ?? '',
            ]
        ];
    }
}
