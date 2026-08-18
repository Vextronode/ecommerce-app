<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public string $status;
    public string $shippingStatus;

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing(['store', 'user', 'items']);
        $this->status = $order->status;
        $this->shippingStatus = $order->shipping_status ?? 'pending';
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('order-tracking.' . $this->order->invoice_number),
            new Channel('global-orders'),
        ];

        if ($this->order->store_id) {
            $channels[] = new Channel('store-orders.' . $this->order->store_id);
            $channels[] = new PrivateChannel('store.' . $this->order->store_id);
        }

        if ($this->order->user_id) {
            $channels[] = new Channel('user-orders.' . $this->order->user_id);
            $channels[] = new PrivateChannel('order.' . $this->order->id);
            $channels[] = new PrivateChannel('App.Models.User.' . $this->order->user_id);
        }

        if (!empty($this->order->delivery_batch_token)) {
            $channels[] = new Channel('batch.' . $this->order->delivery_batch_token);
        }

        return $channels;
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'OrderStatusUpdated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'order_id' => $this->order->id,
            'invoice_number' => $this->order->invoice_number,
            'status' => $this->status,
            'shipping_status' => $this->shippingStatus,
            'shipping_pin' => $this->order->shipping_pin,
            'delivery_batch_token' => $this->order->delivery_batch_token,
            'total_amount' => $this->order->total_amount,
            'updated_at' => $this->order->updated_at?->toIso8601String(),
        ];
    }
}
