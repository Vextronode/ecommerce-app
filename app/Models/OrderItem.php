<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'price',
        'quantity',
        'unit',
        'variant_name',
    ];

    // Relasi balik ke induk pesanannya
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relasi ke produk aslinya
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function review()
    {
        return $this->hasOne(ProductReview::class);
    }
}
