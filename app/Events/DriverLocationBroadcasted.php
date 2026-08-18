<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DriverLocationBroadcasted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ?string $batchToken;
    public ?string $invoiceNumber;
    public float $latitude;
    public float $longitude;
    public ?float $heading;
    public ?float $speed;
    public string $updatedAt;

    /**
     * Create a new event instance.
     */
    public function __construct(
        ?string $batchToken,
        ?string $invoiceNumber,
        float $latitude,
        float $longitude,
        ?float $heading = null,
        ?float $speed = null
    ) {
        $this->batchToken = $batchToken;
        $this->invoiceNumber = $invoiceNumber;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->heading = $heading;
        $this->speed = $speed;
        $this->updatedAt = now()->toIso8601String();
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if (!empty($this->batchToken)) {
            $channels[] = new Channel('batch.' . $this->batchToken);
        }

        if (!empty($this->invoiceNumber)) {
            $channels[] = new Channel('order-tracking.' . $this->invoiceNumber);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'DriverLocationBroadcasted';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'batch_token' => $this->batchToken,
            'invoice_number' => $this->invoiceNumber,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'heading' => $this->heading,
            'speed' => $this->speed,
            'updated_at' => $this->updatedAt,
        ];
    }
}
