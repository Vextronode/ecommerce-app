<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentOrderResource extends JsonResource
{
    /**
     * Transform the order resource into an array safe for frontend payment screen.
     * Excludes sensitive payment_payload and internal database metadata.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $siblingOrders = collect([$this->resource]);

        if (! empty($this->parent_transaction_id)) {
            $loadedSiblings = \App\Models\Order::with(['items.product', 'store'])
                ->where('user_id', $this->user_id)
                ->where('parent_transaction_id', $this->parent_transaction_id)
                ->get();

            if ($loadedSiblings->isNotEmpty()) {
                $siblingOrders = $loadedSiblings;
            }
        }

        $allItems = $siblingOrders->flatMap(fn ($ord) => $ord->items);
        $storeNames = $siblingOrders->map(fn ($ord) => $ord->store?->name)->filter()->unique()->values();

        return [
            'id' => $this->id,
            'invoice_number' => $siblingOrders->count() > 1 ? $this->parent_transaction_id : $this->invoice_number,
            'total_amount' => (float) $siblingOrders->sum('total_amount'),
            'subtotal' => (float) $siblingOrders->sum('subtotal'),
            'shipping_cost' => (float) $siblingOrders->sum('shipping_cost'),
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'payment_channel' => $this->payment_channel,
            'store' => $this->store ? [
                'id' => $this->store->id,
                'name' => $storeNames->count() > 1 ? $storeNames->implode(', ') : $this->store->name,
            ] : null,
            'items' => $allItems->map(function ($item) {
                return [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'quantity' => $item->quantity,
                    'price' => (float) $item->price,
                    'product' => $item->product ? [
                        'id' => $item->product->id,
                        'name' => $item->product->name,
                        'image_path' => $item->product->image_path,
                    ] : null,
                ];
            })->values(),
        ];
    }
}

