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
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'total_amount' => (float) $this->total_amount,
            'subtotal' => (float) $this->subtotal,
            'shipping_cost' => (float) $this->shipping_cost,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'payment_channel' => $this->payment_channel,
            'store' => $this->store ? [
                'id' => $this->store->id,
                'name' => $this->store->name,
            ] : null,
            'items' => $this->items->map(function ($item) {
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
            }),
        ];
    }
}

