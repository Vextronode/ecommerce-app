<?php

namespace App\Events;

use App\Models\ChatNegotiation;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NegotiationUpdatedEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public ChatNegotiation $negotiation)
    {
        $this->negotiation->loadMissing(['product', 'sku', 'user', 'store']);
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.room.' . $this->negotiation->chat_room_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'NegotiationUpdated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->negotiation->id,
            'chat_room_id' => $this->negotiation->chat_room_id,
            'status' => $this->negotiation->status,
            'original_price' => (float) $this->negotiation->original_price,
            'offered_price' => (float) $this->negotiation->offered_price,
            'counter_price' => $this->negotiation->counter_price !== null ? (float) $this->negotiation->counter_price : null,
            'quantity' => $this->negotiation->quantity,
            'po_days' => $this->negotiation->po_days,
            'last_action_by' => $this->negotiation->last_action_by,
            'expires_at' => $this->negotiation->expires_at?->toISOString(),
            'is_expired' => $this->negotiation->isExpired(),
            'product' => [
                'id' => $this->negotiation->product?->id,
                'name' => $this->negotiation->product?->name,
                'slug' => $this->negotiation->product?->slug,
                'image_path' => $this->negotiation->product?->image_path,
                'unit' => $this->negotiation->product?->unit ?? 'pcs',
            ],
            'variant_name' => $this->negotiation->sku?->variant_name,
            'agreed_price' => $this->negotiation->agreed_price,
        ];
    }
}

