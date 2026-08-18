<?php

namespace App\Events;

use App\Models\Product;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductStockUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Product $product;
    public int $productId;
    public int $storeId;
    public string $name;
    public int $stock;
    public float $price;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(Product $product, string $action = 'updated')
    {
        $this->product = $product;
        $this->productId = $product->id;
        $this->storeId = $product->store_id;
        $this->name = $product->name;
        $this->stock = $product->stock ?? 0;
        $this->price = (float) $product->price;
        $this->action = $action; // 'created', 'updated', 'stock_changed', 'deleted'
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('storefront-products'),
            new Channel('store-products.' . $this->storeId),
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'ProductStockUpdated';
    }

    /**
     * Get the data to broadcast.
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'product_id' => $this->productId,
            'store_id' => $this->storeId,
            'name' => $this->name,
            'stock' => $this->stock,
            'price' => $this->price,
            'action' => $this->action,
            'updated_at' => now()->toIso8601String(),
        ];
    }
}
