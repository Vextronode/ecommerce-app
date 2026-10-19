<?php

namespace App\Http\Controllers\Merchant;

use App\Events\NegotiationUpdatedEvent;
use App\Events\NewChatMessageEvent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\ChatNegotiation;
use App\Notifications\PushNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class NegotiationController extends Controller
{
    public function accept(ChatNegotiation $negotiation): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $negotiation->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            return response()->json(['message' => 'Toko Anda sedang tidak aktif.'], 403);
        }

        $chatMessage = DB::transaction(function () use ($negotiation, $user) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['product', 'sku', 'chatRoom.user'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'pending') {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini tidak dalam status menunggu respon.',
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
                    'negotiation' => "Stok produk tidak mencukupi (tersisa {$availableStock}).",
                ]);
            }

            $locked->update([
                'status' => 'accepted',
                'last_action_by' => 'merchant',
            ]);

            $variantText = $locked->sku ? " ({$locked->sku->variant_name})" : '';
            $msg = ChatMessage::create([
                'chat_room_id' => $locked->chat_room_id,
                'sender_id' => $user->id,
                'sender_type' => 'merchant',
                'message_type' => 'negotiation',
                'product_id' => $locked->product_id,
                'negotiation_id' => $locked->id,
                'message' => "Menyetujui tawaran produk seharga Rp " . number_format((float) $locked->offered_price, 0, ',', '.') . "/barang untuk {$locked->quantity} pcs {$locked->product?->name}{$variantText}.",
                'is_read' => false,
            ]);

            $locked->chatRoom->update(['last_message_at' => now()]);

            return $msg;
        });

        try {
            broadcast(new NegotiationUpdatedEvent($negotiation->fresh()))->toOthers();
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Merchant accept negotiation broadcast error: ' . $e->getMessage());
        }

        try {
            $buyerUser = $negotiation->user;
            if ($buyerUser) {
                $storeName = $store->name ?? 'Penjual';
                $buyerUser->notify(new PushNotification(
                    "Tawaran Produk Disetujui!",
                    "{$storeName} telah menyetujui tawaran produk Rp " . number_format((float) $negotiation->offered_price, 0, ',', '.') . ". Segera checkout sebelum masa berlaku habis.",
                    'chat',
                    "/chat?room={$negotiation->chat_room_id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Merchant accept negotiation push error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran produk berhasil disetujui. Pembeli dapat segera melakukan checkout.',
            'negotiation' => $negotiation->fresh(['product', 'sku']),
        ]);
    }

    public function reject(ChatNegotiation $negotiation): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $negotiation->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            return response()->json(['message' => 'Toko Anda sedang tidak aktif.'], 403);
        }

        $chatMessage = DB::transaction(function () use ($negotiation, $user) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['chatRoom.user', 'product', 'sku'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'pending') {
                throw ValidationException::withMessages([
                    'negotiation' => 'Penawaran ini tidak dalam status menunggu respon.',
                ]);
            }

            $locked->update([
                'status' => 'rejected',
                'last_action_by' => 'merchant',
            ]);

            $variantText = $locked->sku ? " ({$locked->sku->variant_name})" : '';
            $msg = ChatMessage::create([
                'chat_room_id' => $locked->chat_room_id,
                'sender_id' => $user->id,
                'sender_type' => 'merchant',
                'message_type' => 'negotiation',
                'product_id' => $locked->product_id,
                'negotiation_id' => $locked->id,
                'message' => "Menolak tawaran produk untuk {$locked->product?->name}{$variantText}.",
                'is_read' => false,
            ]);

            $locked->chatRoom->update(['last_message_at' => now()]);

            return $msg;
        });

        try {
            broadcast(new NegotiationUpdatedEvent($negotiation->fresh()))->toOthers();
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Merchant reject negotiation broadcast error: ' . $e->getMessage());
        }

        try {
            $buyerUser = $negotiation->user;
            if ($buyerUser) {
                $storeName = $store->name ?? 'Penjual';
                $buyerUser->notify(new PushNotification(
                    "Tawaran Belum Disetujui",
                    "{$storeName} belum dapat menerima tawaran produk Anda untuk {$negotiation->product?->name}.",
                    'chat',
                    "/chat?room={$negotiation->chat_room_id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Merchant reject negotiation push error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran produk telah ditolak.',
            'negotiation' => $negotiation->fresh(['product', 'sku']),
        ]);
    }

    public function counter(Request $request, ChatNegotiation $negotiation): JsonResponse
    {
        $user = Auth::user();
        $store = $user->store;

        if (!$store || (int) $negotiation->store_id !== (int) $store->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($store->sid_status !== 'verified' || in_array($user->status, ['suspended', 'inactive'], true)) {
            return response()->json(['message' => 'Toko Anda sedang tidak aktif.'], 403);
        }

        $validated = $request->validate([
            'counter_price' => ['required', 'numeric', 'min:100'],
            'note' => ['nullable', 'string', 'max:500'],
        ], [
            'counter_price.required' => 'Nominal tawaran balik harus diisi.',
            'counter_price.min' => 'Nominal tawaran balik minimal Rp 100.',
        ]);

        $counterPrice = round((float) $validated['counter_price'], 2);

        $chatMessage = DB::transaction(function () use ($negotiation, $user, $counterPrice, $validated) {
            $locked = ChatNegotiation::where('id', $negotiation->id)
                ->with(['product', 'sku', 'chatRoom.user'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($locked->status !== 'pending') {
                throw ValidationException::withMessages([
                    'counter_price' => 'Penawaran ini tidak dalam status menunggu respon.',
                ]);
            }

            if ($locked->isExpired()) {
                $locked->update(['status' => 'expired']);
                throw ValidationException::withMessages([
                    'counter_price' => 'Penawaran ini sudah melewati batas waktu (kadaluarsa).',
                ]);
            }

            $originalPrice = (float) $locked->original_price;
            $offeredPrice = (float) $locked->offered_price;

            if ($counterPrice <= $offeredPrice) {
                throw ValidationException::withMessages([
                    'counter_price' => 'Tawaran balik harus lebih tinggi dari penawaran pembeli (Rp ' . number_format($offeredPrice, 0, ',', '.') . ').',
                ]);
            }

            if ($counterPrice >= $originalPrice) {
                throw ValidationException::withMessages([
                    'counter_price' => 'Tawaran balik harus lebih murah dari harga normal (Rp ' . number_format($originalPrice, 0, ',', '.') . ').',
                ]);
            }

            $availableStock = (int) ($locked->sku ? $locked->sku->stock : $locked->product->stock);
            if ($locked->quantity > $availableStock) {
                throw ValidationException::withMessages([
                    'counter_price' => "Stok produk tidak mencukupi (tersisa {$availableStock}).",
                ]);
            }

            $sanitizedNote = !empty($validated['note'])
                ? trim((string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', strip_tags($validated['note'])))
                : null;

            $locked->update([
                'status' => 'countered',
                'counter_price' => $counterPrice,
                'last_action_by' => 'merchant',
                'expires_at' => now()->addHours(24),
            ]);

            $variantText = $locked->sku ? " ({$locked->sku->variant_name})" : '';
            $noteSuffix = $sanitizedNote ? " Catatan: \"{$sanitizedNote}\"" : '';

            $msg = ChatMessage::create([
                'chat_room_id' => $locked->chat_room_id,
                'sender_id' => $user->id,
                'sender_type' => 'merchant',
                'message_type' => 'negotiation',
                'product_id' => $locked->product_id,
                'negotiation_id' => $locked->id,
                'message' => "Mengajukan tawaran balik sebesar Rp " . number_format($counterPrice, 0, ',', '.') . "/barang untuk {$locked->quantity} pcs {$locked->product?->name}{$variantText}.{$noteSuffix}",
                'is_read' => false,
            ]);

            $locked->chatRoom->update(['last_message_at' => now()]);

            return $msg;
        });

        try {
            broadcast(new NegotiationUpdatedEvent($negotiation->fresh()))->toOthers();
            broadcast(new NewChatMessageEvent($chatMessage))->toOthers();
        } catch (\Throwable $e) {
            Log::warning('Merchant counter negotiation broadcast error: ' . $e->getMessage());
        }

        try {
            $buyerUser = $negotiation->user;
            if ($buyerUser) {
                $storeName = $store->name ?? 'Penjual';
                $buyerUser->notify(new PushNotification(
                    "Tawaran Balik dari {$storeName}",
                    "Penjual menawarkan harga Rp " . number_format($counterPrice, 0, ',', '.') . " untuk {$negotiation->product?->name}. Cek penawaran sekarang.",
                    'chat',
                    "/chat?room={$negotiation->chat_room_id}"
                ));
            }
        } catch (\Throwable $e) {
            Log::warning('Merchant counter negotiation push error: ' . $e->getMessage());
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Tawaran balik berhasil dikirimkan ke pembeli.',
            'negotiation' => $negotiation->fresh(['product', 'sku']),
        ]);
    }
}

