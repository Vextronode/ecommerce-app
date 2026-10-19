<?php

namespace App\Http\Controllers\Storefront;

use App\Events\NewChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Models\Store;
use App\Notifications\PushNotification;
use App\Services\ChatMediaProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function index(): JsonResponse
    {
        $userId = Auth::id();
        if (!$userId) {
            return response()->json(['rooms' => []]);
        }

        $rooms = ChatRoom::where('user_id', $userId)
            ->with(['store.user', 'latestMessage.product'])
            // hitung unread sekali lewat subquery, bukan satu count() per room
            ->withCount(['messages as unread_count' => function ($query) use ($userId) {
                $query->where('is_read', false)->where('sender_id', '!=', $userId);
            }])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($room) use ($userId) {
                $storeUser = $room->store?->user;
                return [
                    'id' => $room->id,
                    'store' => [
                        'id' => $room->store?->id,
                        'name' => $room->store?->name,
                        'slug' => $room->store?->slug,
                        'logo_path' => $room->store?->logo_path,
                        'is_online' => $storeUser?->isOnline() ?? false,
                        'last_seen' => $storeUser?->lastSeenFormatted() ?? 'Tidak aktif',
                    ],
                    'last_message' => $room->latestMessage ? [
                        'message' => $room->latestMessage->message,
                        'created_at' => $room->latestMessage->created_at->diffForHumans(),
                        'sender_type' => $room->latestMessage->sender_type,
                    ] : null,
                    'unread_count' => (int) $room->unread_count,
                    'last_message_at' => $room->last_message_at?->toISOString(),
                ];
            });

        return response()->json(['rooms' => $rooms]);
    }

    public function getOrCreateRoom(Request $request): JsonResponse
    {
        $request->validate([
            'store_id' => ['required', 'exists:stores,id'],
            'product_id' => ['nullable', 'exists:products,id'],
        ]);

        $userId = Auth::id();
        $store = Store::with('user')->findOrFail($request->store_id);

        if ($store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
            return response()->json([
                'message' => 'Toko ini sedang tidak aktif atau belum terverifikasi.',
            ], 422);
        }

        if ((int) $store->user_id === (int) $userId) {
            return response()->json([
                'message' => 'Anda tidak dapat mengirim pesan ke toko Anda sendiri.',
            ], 422);
        }

        $room = ChatRoom::firstOrCreate(
            ['user_id' => $userId, 'store_id' => $store->id],
            ['last_message_at' => now()]
        );

        $storeUser = $store->user;

        return response()->json([
            'room' => [
                'id' => $room->id,
                'store' => [
                    'id' => $store->id,
                    'name' => $store->name,
                    'slug' => $store->slug,
                    'logo_path' => $store->logo_path,
                    'is_online' => $storeUser?->isOnline() ?? false,
                    'last_seen' => $storeUser?->lastSeenFormatted() ?? 'Tidak aktif',
                ],
            ],
        ]);
    }

    public function messages(ChatRoom $room): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $room->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ChatMessage::where('chat_room_id', $room->id)
            ->where('sender_type', 'merchant')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $messages = $room->messages()
            ->with([
                'product:id,name,slug,price,image_path',
                'negotiation.product:id,name,slug,price,image_path,unit',
                'negotiation.sku:id,product_id,variant_name,price,stock',
            ])
            ->orderBy('id', 'desc')
            ->take(60)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($msg) {
                $negotiationData = null;
                if ($msg->negotiation) {
                    $negotiationData = [
                        'id' => $msg->negotiation->id,
                        'chat_room_id' => $msg->negotiation->chat_room_id,
                        'status' => $msg->negotiation->status,
                        'original_price' => (float) $msg->negotiation->original_price,
                        'offered_price' => (float) $msg->negotiation->offered_price,
                        'counter_price' => $msg->negotiation->counter_price !== null ? (float) $msg->negotiation->counter_price : null,
                        'quantity' => $msg->negotiation->quantity,
                        'po_days' => $msg->negotiation->po_days,
                        'note' => $msg->negotiation->note,
                        'last_action_by' => $msg->negotiation->last_action_by,
                        'expires_at' => $msg->negotiation->expires_at?->toISOString(),
                        'is_expired' => $msg->negotiation->isExpired(),
                        'agreed_price' => $msg->negotiation->agreed_price,
                        'purchased_at' => $msg->negotiation->purchased_at?->toISOString(),
                        'product' => $msg->negotiation->product ? [
                            'id' => $msg->negotiation->product->id,
                            'name' => $msg->negotiation->product->name,
                            'slug' => $msg->negotiation->product->slug,
                            'image_path' => $msg->negotiation->product->image_path,
                            'unit' => $msg->negotiation->product->unit ?? 'pcs',
                        ] : null,
                        'variant_name' => $msg->negotiation->sku?->variant_name,
                    ];
                }

                return [
                    'id' => $msg->id,
                    'chat_room_id' => $msg->chat_room_id,
                    'sender_id' => $msg->sender_id,
                    'sender_type' => $msg->sender_type,
                    'message_type' => $msg->message_type ?? 'text',
                    'negotiation_id' => $msg->negotiation_id,
                    'negotiation' => $negotiationData,
                    'message' => $msg->message,
                    'product' => $msg->product ? [
                        'id' => $msg->product->id,
                        'name' => $msg->product->name,
                        'slug' => $msg->product->slug,
                        'price' => $msg->product->price,
                        'image_path' => $msg->product->image_path,
                    ] : null,
                    'media_path' => $msg->media_path ? '/storage/' . $msg->media_path : null,
                    'media_type' => $msg->media_type,
                    'is_read' => $msg->is_read,
                    'created_at' => $msg->created_at->toISOString(),
                    'formatted_time' => $msg->created_at->format('H:i'),
                ];
            });

        $unreadTotal = ChatMessage::whereHas('chatRoom', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->where('sender_type', 'merchant')->where('is_read', false)->count();

        $storeUser = $room->store?->user;

        return response()->json([
            'messages' => $messages,
            'store_status' => [
                'is_online' => $storeUser?->isOnline() ?? false,
                'last_seen' => $storeUser?->lastSeenFormatted() ?? 'Tidak aktif',
            ],
            'unread_total' => $unreadTotal,
        ]);
    }

    public function markAsRead(ChatRoom $room): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $room->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        ChatMessage::where('chat_room_id', $room->id)
            ->where('sender_type', 'merchant')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $unreadTotal = ChatMessage::whereHas('chatRoom', function ($q) use ($userId) {
            $q->where('user_id', $userId);
        })->where('sender_type', 'merchant')->where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'unread_total' => $unreadTotal,
        ]);
    }

    public function sendMessage(Request $request, ChatRoom $room): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $room->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $room->loadMissing('store.user');
        $store = $room->store;
        if (!$store || $store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
            return response()->json(['message' => 'Toko ini sedang tidak aktif.'], 422);
        }

        $request->validate([
            'message' => ['nullable', 'string', 'max:2000'],
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'media' => [
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,webp,gif,mp4,mov',
                'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime',
                'max:10240',
            ],
        ]);

        $rawMessage = (string) ($request->message ?? '');
        $sanitizedMessage = trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $rawMessage));

        if ($sanitizedMessage === '' && !$request->hasFile('media') && !$request->product_id) {
            return response()->json(['message' => 'Pesan atau lampiran tidak boleh kosong.'], 422);
        }

        $validProductId = null;
        if ($request->filled('product_id')) {
            $productExists = Product::where('id', $request->product_id)
                ->where('store_id', $room->store_id)
                ->where('is_active', true)
                ->exists();
            if (!$productExists) {
                return response()->json(['message' => 'Produk tidak berasal dari toko ini.'], 422);
            }
            $validProductId = (int) $request->product_id;
        }

        $mediaPath = null;
        $mediaType = null;

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            try {
                [$mediaPath, $mediaType] = app(ChatMediaProcessor::class)->store($file);
            } catch (\Throwable $e) {
                Log::error('Chat media upload failed: ' . $e->getMessage());
                return response()->json(['message' => 'Gagal memproses gambar lampiran: ' . $e->getMessage()], 422);
            }
        }

        $chatMessage = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $userId,
            'sender_type' => 'user',
            'message' => $sanitizedMessage,
            'product_id' => $validProductId,
            'media_path' => $mediaPath,
            'media_type' => $mediaType,
            'is_read' => false,
        ]);

        $room->update(['last_message_at' => now()]);

        try {
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('NewChatMessageEvent broadcast error: ' . $e->getMessage());
        }

        // Push notification ke pedagang jika sedang offline / di luar livechat
        try {
            $sellerUser = $room->store?->user;
            if ($sellerUser && (int) $sellerUser->id !== (int) $userId) {
                $preview = $chatMessage->message
                    ?: ($chatMessage->media_type === 'video' ? '[Mengirim Video]' : ($chatMessage->media_path ? '[Mengirim Foto]' : 'Pesan baru'));
                $senderName = Auth::user()?->name ?? 'Pelanggan';
                $sellerUser->notify(new PushNotification(
                    "Pesan dari {$senderName}",
                    $preview,
                    'chat',
                    "/pedagang/chat?room={$room->id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Chat push notification to seller error: ' . $e->getMessage());
        }

        $formattedMessage = [
            'id' => $chatMessage->id,
            'chat_room_id' => $chatMessage->chat_room_id,
            'sender_id' => $chatMessage->sender_id,
            'sender_type' => $chatMessage->sender_type,
            'message' => $chatMessage->message,
            'product' => $chatMessage->product ? [
                'id' => $chatMessage->product->id,
                'name' => $chatMessage->product->name,
                'slug' => $chatMessage->product->slug,
                'price' => $chatMessage->product->price,
                'image_path' => $chatMessage->product->image_path,
            ] : null,
            'media_path' => $chatMessage->media_path ? '/storage/' . $chatMessage->media_path : null,
            'media_type' => $chatMessage->media_type,
            'is_read' => false,
            'created_at' => $chatMessage->created_at->toISOString(),
            'formatted_time' => $chatMessage->created_at->format('H:i'),
        ];

        return response()->json([
            'status' => 'success',
            'message' => $formattedMessage,
        ]);
    }
}
