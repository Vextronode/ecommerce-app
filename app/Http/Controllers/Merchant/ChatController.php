<?php

namespace App\Http\Controllers\Merchant;

use App\Events\NewChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Notifications\PushNotification;
use App\Services\ChatMediaProcessor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store) {
            abort(403, 'Anda belum memiliki toko yang terdaftar.');
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            abort(403, 'Toko Anda sedang tidak aktif.');
        }

        $queryRoom = $request->query('room_id') ?: $request->query('room');
        $requestedRoomId = $queryRoom ? (int) $queryRoom : null;
        $initialRoomId = null;

        if ($requestedRoomId) {
            $initialRoomId = ChatRoom::where('store_id', $store->id)
                ->where('id', $requestedRoomId)
                ->value('id');
        }

        if (!$initialRoomId) {
            $initialRoomId = ChatRoom::where('store_id', $store->id)
                ->orderByDesc('last_message_at')
                ->value('id');
        }

        if ($initialRoomId) {
            ChatMessage::where('chat_room_id', $initialRoomId)
                ->where('sender_type', 'user')
                ->where('is_read', false)
                ->update([
                    'is_read' => true,
                    'read_at' => now(),
                ]);
        }

        $rooms = ChatRoom::where('store_id', $store->id)
            ->with(['user', 'latestMessage.product'])
            // hitung unread sekali lewat subquery, bukan satu count() per room
            ->withCount(['messages as unread_count' => function ($query) use ($user) {
                $query->where('is_read', false)->where('sender_id', '!=', $user->id);
            }])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(function ($room) use ($user) {
                $customer = $room->user;
                return [
                    'id' => $room->id,
                    'customer' => [
                        'id' => $customer?->id,
                        'name' => $customer?->name,
                        'profile_photo_path' => $customer?->profile_photo_path,
                        'is_online' => $customer?->isOnline() ?? false,
                        'last_seen' => $customer?->lastSeenFormatted() ?? 'Tidak aktif',
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

        return Inertia::render('Merchant/Chat/Index', [
            'initialRooms' => $rooms,
            'initialRoomId' => $initialRoomId,
        ]);
    }

    public function messages(ChatRoom $room): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $room->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            return response()->json(['message' => 'Toko ini sedang tidak aktif.'], 403);
        }

        ChatMessage::where('chat_room_id', $room->id)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $unreadTotal = ChatMessage::whereHas('chatRoom', function ($q) use ($store) {
            $q->where('store_id', $store->id);
        })->where('sender_type', 'user')->where('is_read', false)->count();

        $messages = $room->messages()
            ->with(['product:id,name,slug,price,image_path'])
            ->orderBy('id', 'desc')
            ->take(60)
            ->get()
            ->reverse()
            ->values()
            ->map(function ($msg) {
                return [
                    'id' => $msg->id,
                    'chat_room_id' => $msg->chat_room_id,
                    'sender_id' => $msg->sender_id,
                    'sender_type' => $msg->sender_type,
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

        $customer = $room->user;

        return response()->json([
            'messages' => $messages,
            'customer_status' => [
                'is_online' => $customer?->isOnline() ?? false,
                'last_seen' => $customer?->lastSeenFormatted() ?? 'Tidak aktif',
            ],
            'unread_total' => $unreadTotal,
        ]);
    }

    public function markAsRead(ChatRoom $room): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $room->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            return response()->json(['message' => 'Toko ini sedang tidak aktif.'], 403);
        }

        ChatMessage::where('chat_room_id', $room->id)
            ->where('sender_type', 'user')
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now(),
            ]);

        $unreadTotal = ChatMessage::whereHas('chatRoom', function ($q) use ($store) {
            $q->where('store_id', $store->id);
        })->where('sender_type', 'user')->where('is_read', false)->count();

        return response()->json([
            'status' => 'success',
            'unread_total' => $unreadTotal,
        ]);
    }

    public function sendMessage(Request $request, ChatRoom $room): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $room->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
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
                'max:20480',
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
                ->where('store_id', $store->id)
                ->where('is_active', true)
                ->exists();
            if (!$productExists) {
                return response()->json(['message' => 'Produk tidak valid untuk toko ini.'], 422);
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
                Log::error('Merchant chat media upload failed: ' . $e->getMessage());
                return response()->json(['message' => 'Gagal memproses lampiran media: ' . $e->getMessage()], 422);
            }
        }

        $chatMessage = ChatMessage::create([
            'chat_room_id' => $room->id,
            'sender_id' => $user->id,
            'sender_type' => 'merchant',
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

        // Push notification ke pembeli jika sedang offline / di luar livechat
        try {
            $buyerUser = $room->user;
            if ($buyerUser && (int) $buyerUser->id !== (int) $user->id) {
                $preview = $chatMessage->message
                    ?: ($chatMessage->media_type === 'video' ? '[Mengirim Video]' : ($chatMessage->media_path ? '[Mengirim Foto]' : 'Pesan baru'));
                $storeName = $store->name ?? 'Toko';
                $buyerUser->notify(new PushNotification(
                    "Pesan dari {$storeName}",
                    $preview,
                    'chat',
                    "/chat?room={$room->id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Chat push notification to buyer error: ' . $e->getMessage());
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
