<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Order $order;
    public ?string $status = null;
    public ?string $shippingStatus = null;

    /**
     * Create a new event instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order->loadMissing(['store', 'user', 'items']);
        $this->status = $order->status ?? $order->shipping_status ?? 'pending';
        $this->shippingStatus = $order->shipping_status ?? 'pending';
    }

    /**
     * Get the channels the event should broadcast on.
     * All channels are private — no unauthenticated subscriber can receive order data.
     *
     * @return array<int, \Illuminate\Broadcasting\PrivateChannel>
     */
    public function broadcastOn(): array
    {
        $channels = [];

        if ($this->order->store_id) {
            $channels[] = new PrivateChannel('store.' . $this->order->store_id);
            $channels[] = new PrivateChannel('store-orders.' . $this->order->store_id);
        }

        if ($this->order->user_id) {
            $channels[] = new PrivateChannel('order.' . $this->order->id);
            $channels[] = new PrivateChannel('App.Models.User.' . $this->order->user_id);
            $channels[] = new PrivateChannel('user-orders.' . $this->order->user_id);
        }

        if ($this->order->invoice_number) {
            $channels[] = new PrivateChannel('order-tracking.' . $this->order->invoice_number);
        }

        if (!empty($this->order->delivery_batch_token)) {
            $channels[] = new PrivateChannel('batch.' . $this->order->delivery_batch_token);
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
     * shipping_pin is intentionally excluded — never sent over WebSocket.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'order_id'             => $this->order->id,
            'invoice_number'       => $this->order->invoice_number,
            'status'               => $this->status,
            'shipping_status'      => $this->shippingStatus,
            'delivery_batch_token' => $this->order->delivery_batch_token,
            'total_amount'         => $this->order->total_amount,
            'updated_at'           => $this->order->updated_at?->toIso8601String(),
        ];
    }
}
