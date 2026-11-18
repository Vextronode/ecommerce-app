<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PlatformSettingsUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Array of updated platform settings (key-value pairs).
     *
     * @var array<string, mixed>
     */
    public array $settings;

    /**
     * Array of setting keys that were actually changed in this update.
     *
     * @var array<int, string>
     */
    public array $changedKeys;

    /**
     * Create a new event instance.
     *
     * @param array<string, mixed> $settings
     * @param array<int, string> $changedKeys
     */
    public function __construct(array $settings, array $changedKeys = [])
    {
        $this->settings = $settings;
        $this->changedKeys = $changedKeys;
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'settings' => $this->settings,
            'changed_keys' => $this->changedKeys,
        ];
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('platform-settings'),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'PlatformSettingsUpdated';
    }
}
