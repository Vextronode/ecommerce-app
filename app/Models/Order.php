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
}
