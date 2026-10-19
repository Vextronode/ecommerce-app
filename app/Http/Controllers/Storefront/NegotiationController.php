<?php

namespace App\Http\Controllers\Storefront;

use App\Events\NegotiationUpdatedEvent;
use App\Events\NewChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\ChatMessage;
use App\Models\ChatNegotiation;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Models\ProductSku;
use App\Notifications\PushNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class NegotiationController extends Controller
{
    public function store(Request $request, ChatRoom $room): JsonResponse
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

        if ((int) $store->user_id === (int) $userId) {
            return response()->json(['message' => 'Anda tidak dapat menawar di toko Anda sendiri.'], 422);
        }

        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'product_sku_id' => ['nullable', 'integer', 'exists:product_skus,id'],
            'offered_price' => ['required', 'numeric', 'min:100'],
            'quantity' => ['required', 'integer', 'min:1', 'max:9999'],
            'po_days' => ['nullable', 'integer', 'min:1', 'max:30'],
            'note' => ['nullable', 'string', 'max:500'],
        ], [
            'offered_price.min' => 'Harga tawaran minimal Rp 100.',
            'quantity.min' => 'Jumlah barang minimal 1.',
        ]);

        $result = DB::transaction(function () use ($room, $userId, $validated) {
            $product = Product::where('id', $validated['product_id'])
                ->where('store_id', $room->store_id)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if (!$product) {
                throw ValidationException::withMessages([
                    'product_id' => 'Produk tidak valid atau sudah tidak aktif di toko ini.',
                ]);
            }

            $sku = null;
            if (!empty($validated['product_sku_id'])) {
                $sku = ProductSku::where('id', $validated['product_sku_id'])
                    ->where('product_id', $product->id)
                    ->lockForUpdate()
                    ->first();

                if (!$sku) {
                    throw ValidationException::withMessages([
                        'product_sku_id' => 'Varian produk yang dipilih tidak valid.',
                    ]);
                }
            } elseif ($product->skus()->exists()) {
                throw ValidationException::withMessages([
                    'product_sku_id' => 'Harap pilih varian produk terlebih dahulu.',
                ]);
            }

            $originalPrice = (float) ($sku ? $sku->price : $product->price);
            $availableStock = (int) ($sku ? $sku->stock : $product->stock);
            $offeredPrice = round((float) $validated['offered_price'], 2);
            $quantity = (int) $validated['quantity'];

            if ($quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'quantity' => "Stok produk hanya tersedia {$availableStock} barang.",
                ]);
            }

            if ($offeredPrice >= $originalPrice) {
                throw ValidationException::withMessages([
                    'offered_price' => 'Harga tawaran harus lebih murah dari harga asli produk (Rp ' . number_format($originalPrice, 0, ',', '.') . ').',
                ]);
            }

            $minimumAllowedPrice = round($originalPrice * 0.3, 2);
            if ($offeredPrice < $minimumAllowedPrice) {
                throw ValidationException::withMessages([
                    'offered_price' => 'Harga tawaran terlalu rendah (minimal 30% dari harga asli: Rp ' . number_format($minimumAllowedPrice, 0, ',', '.') . ').',
                ]);
            }

            $existingActive = ChatNegotiation::where('chat_room_id', $room->id)
                ->where('product_id', $product->id)
                ->where('product_sku_id', $sku?->id)
                ->whereIn('status', ['pending', 'countered'])
                ->where('expires_at', '>', now())
                ->lockForUpdate()
                ->first();

            if ($existingActive) {
                throw ValidationException::withMessages([
                    'offered_price' => 'Masih ada penawaran aktif yang belum selesai untuk produk ini. Harap tunggu respon penjual.',
                ]);
            }

            $sanitizedNote = !empty($validated['note'])
                ? trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', strip_tags($validated['note'])))
                : null;

            $negotiation = ChatNegotiation::create([
                'chat_room_id' => $room->id,
                'user_id' => $userId,
                'store_id' => $room->store_id,
                'product_id' => $product->id,
                'product_sku_id' => $sku?->id,
                'original_price' => $originalPrice,
                'offered_price' => $offeredPrice,
                'quantity' => $quantity,
                'po_days' => $validated['po_days'] ?? null,
                'note' => $sanitizedNote,
                'status' => 'pending',
                'last_action_by' => 'user',
                'expires_at' => now()->addHours(24),
            ]);

            $variantText = $sku ? " ({$sku->variant_name})" : '';
            $chatMessage = ChatMessage::create([
                'chat_room_id' => $room->id,
                'sender_id' => $userId,
                'sender_type' => 'user',
                'message_type' => 'negotiation',
                'product_id' => $product->id,
                'negotiation_id' => $negotiation->id,
                'message' => "Mengajukan tawaran produk seharga Rp " . number_format($offeredPrice, 0, ',', '.') . "/barang untuk {$quantity} pcs {$product->name}{$variantText}.",
                'is_read' => false,
            ]);

            $room->update(['last_message_at' => now()]);

            return [$negotiation, $chatMessage];
        });

        [$negotiation, $chatMessage] = $result;

        try {
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Negotiation NewChatMessageEvent broadcast error: ' . $e->getMessage());
        }

        try {
            $sellerUser = $room->store?->user;
            if ($sellerUser && (int) $sellerUser->id !== (int) $userId) {
                $senderName = Auth::user()?->name ?? 'Pelanggan';
                $sellerUser->notify(new PushNotification(
                    "Tawaran Produk Baru dari {$senderName}",
                    "Tawaran Rp " . number_format($negotiation->offered_price, 0, ',', '.') . " untuk produk {$negotiation->product?->name}.",
                    'chat',
                    "/pedagang/chat?room={$room->id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Negotiation push notification to seller error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran produk berhasil diajukan kepada penjual.',
            'negotiation' => $negotiation->load(['product', 'sku']),
        ], 201);
    }

    public function acceptCounter(ChatNegotiation $negotiation): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $negotiation->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $chatMessage = DB::transaction(function () use ($negotiation, $userId) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['product', 'sku', 'chatRoom.store.user'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'countered') {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini tidak dalam status tawaran balik dari penjual.',
                ]);
            }

            if ($locked->isExpired()) {
                $locked->update(['status' => 'expired']);
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini sudah melewati batas waktu (kadaluarsa).',
                ]);
            }

            $availableStock = (int) ($locked->sku ? $locked->sku->stock : $locked->product->stock);
            if ($locked->quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'negotiation' => 'Stok produk sudah tidak mencukupi untuk penawaran ini.',
                ]);
            }

            $locked->update([
                'status' => 'accepted',
                'last_action_by' => 'user',
            ]);

            $msg = ChatMessage::create([
                'chat_room_id' => $locked->chat_room_id,
                'sender_id' => $userId,
                'sender_type' => 'user',
                'message_type' => 'negotiation',
                'product_id' => $locked->product_id,
                'negotiation_id' => $locked->id,
                'message' => "Menyetujui tawaran balik penjual sebesar Rp " . number_format((float) $locked->counter_price, 0, ',', '.') . "/barang untuk {$locked->quantity} pcs.",
                'is_read' => false,
            ]);

            $locked->chatRoom->update(['last_message_at' => now()]);

            return $msg;
        });

        try {
            broadcast(new NegotiationUpdatedEvent($negotiation->fresh()))->toOthers();
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Negotiation acceptCounter broadcast error: ' . $e->getMessage());
        }

        try {
            $sellerUser = $negotiation->chatRoom?->store?->user;
            if ($sellerUser) {
                $senderName = Auth::user()?->name ?? 'Pelanggan';
                $sellerUser->notify(new PushNotification(
                    "Tawaran Balik Disetujui!",
                    "{$senderName} menyetujui tawaran balik Rp " . number_format((float) $negotiation->counter_price, 0, ',', '.') . ".",
                    'chat',
                    "/pedagang/chat?room={$negotiation->chat_room_id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Negotiation acceptCounter push error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran balik penjual berhasil disetujui. Anda dapat segera melakukan pembelian.',
            'negotiation' => $negotiation->fresh(['product', 'sku']),
        ]);
    }

    public function rejectCounter(ChatNegotiation $negotiation): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $negotiation->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $chatMessage = DB::transaction(function () use ($negotiation, $userId) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['chatRoom'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'countered') {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini tidak dalam status tawaran balik dari penjual.',
                ]);
            }

            $locked->update([
                'status' => 'rejected',
                'last_action_by' => 'user',
            ]);

            $msg = ChatMessage::create([
                'chat_room_id' => $locked->chat_room_id,
                'sender_id' => $userId,
                'sender_type' => 'user',
                'message_type' => 'negotiation',
                'product_id' => $locked->product_id,
                'negotiation_id' => $locked->id,
                'message' => "Menolak tawaran balik dari penjual.",
                'is_read' => false,
            ]);

            $locked->chatRoom->update(['last_message_at' => now()]);

            return $msg;
        });

        try {
            broadcast(new NegotiationUpdatedEvent($negotiation->fresh()))->toOthers();
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Negotiation rejectCounter broadcast error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran balik telah ditolak.',
            'negotiation' => $negotiation->fresh(['product', 'sku']),
        ]);
    }

    public function checkout(ChatNegotiation $negotiation): JsonResponse
    {
        $userId = Auth::id();
        if ((int) $negotiation->user_id !== (int) $userId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $cart = DB::transaction(function () use ($negotiation, $userId) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['product', 'sku', 'store.user'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'accepted') {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran belum disetujui atau sudah tidak valid.',
                ]);
            }

            if ($locked->isExpired()) {
                $locked->update(['status' => 'expired']);
                throw ValidationException::withMessages([
                    'negotiation' => 'Masa berlaku penawaran telah habis (melewati 24 jam).',
                ]);
            }

            if ($locked->purchased_at !== null) {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini sudah pernah digunakan untuk pembelian.',
                ]);
            }

            $store = $locked->store;
            if (!$store || $store->sid_status !== 'verified' || ($store->user && in_array($store->user->status, ['suspended', 'inactive'], true))) {
                throw ValidationException::withMessages([
                    'negotiation' => 'Toko penjual sedang tidak aktif.',
                ]);
            }

            $availableStock = (int) ($locked->sku ? $locked->sku->stock : $locked->product->stock);
            if ($locked->quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'negotiation' => "Stok produk tidak mencukupi (tersisa {$availableStock}).",
                ]);
            }

            $prepOption = $locked->sku ? $locked->sku->variant_name : '';

            $cart = Cart::updateOrCreate(
                [
                    'user_id' => $userId,
                    'product_id' => $locked->product_id,
                    'preparation_option' => $prepOption,
                ],
                [
                    'quantity' => $locked->quantity,
                    'negotiation_id' => $locked->id,
                ]
            );

            return $cart;
        });

        return response()->json([
            'status' => 'success',
            'checkout_url' => route('checkout', ['items' => [$cart->id]]),
        ]);
    }
}

