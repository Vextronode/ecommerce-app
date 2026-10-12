<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewChatMessageEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    protected ChatMessage $message;
    public int $roomId;
    public int $receiverUserId;
    public ?int $storeId;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message->load(['sender', 'product', 'chatRoom.store', 'chatRoom.user']);
        $this->roomId = $message->chat_room_id;
        
        $room = $this->message->chatRoom;
        $this->storeId = $room?->store_id;

        if ($message->sender_type === 'user') {
            $this->receiverUserId = $room?->store?->user_id ?? 0;
        } else {
            $this->receiverUserId = $room?->user_id ?? 0;
        }
    }

    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('chat.room.' . $this->roomId),
        ];

        if ($this->receiverUserId > 0) {
            $channels[] = new PrivateChannel('user-chats.' . $this->receiverUserId);
        }
        if ($this->storeId) {
            $channels[] = new PrivateChannel('store-chats.' . $this->storeId);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'NewChatMessage';
    }

    public function broadcastWith(): array
    {
        $room = $this->message->chatRoom;
        $isMerchant = $this->message->sender_type === 'merchant';

        $senderName = $isMerchant
            ? ($room?->store?->name ?? $this->message->sender?->name ?? 'Toko')
            : ($this->message->sender?->name ?? 'Pelanggan');

        $rawAvatar = $isMerchant
            ? $room?->store?->logo_path
            : $this->message->sender?->profile_photo_path;

        $senderAvatar = $rawAvatar
            ? (str_starts_with($rawAvatar, 'http') || str_starts_with($rawAvatar, '/storage/') ? $rawAvatar : '/storage/' . ltrim($rawAvatar, '/'))
            : null;

        return [
            'id' => $this->message->id,
            'chat_room_id' => $this->message->chat_room_id,
            'sender_id' => $this->message->sender_id,
            'sender_name' => $senderName,
            'sender_avatar' => $senderAvatar,
            'sender_type' => $this->message->sender_type,
            'message' => $this->message->message,
            'product' => $this->message->product ? [
                'id' => $this->message->product->id,
                'name' => $this->message->product->name,
                'slug' => $this->message->product->slug,
                'price' => $this->message->product->price,
                'image_path' => $this->message->product->image_path,
            ] : null,
            'media_path' => $this->message->media_path ? '/storage/' . $this->message->media_path : null,
            'media_type' => $this->message->media_type,
            'is_read' => $this->message->is_read,
            'created_at' => $this->message->created_at->toISOString(),
            'formatted_time' => $this->message->created_at->format('H:i'),
        ];
    }
}
