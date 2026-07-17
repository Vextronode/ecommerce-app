<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $fillable = [
        'store_id',
        'user_id',
        'invoice_number',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'delivery_method',
        'subtotal',
        'shipping_cost',
        'total_amount',
        'payment_method',
        'payment_status',
        'shipping_status',
        'notes',
    ];

    // Relasi ke tabel order_items
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    // Relasi ke pembeli
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function restoreStock()
    {
        foreach ($this->items as $item) {
            if ($item->variant_name) {
                $sku = \App\Models\ProductSku::where('product_id', $item->product_id)
                    ->where('variant_name', $item->variant_name)
                    ->first();
                if ($sku) {
                    $sku->increment('stock', $item->quantity);
                    continue;
                }
            }
            if ($item->product) {
                $item->product->increment('stock', $item->quantity);
            }
        }
    }
}
