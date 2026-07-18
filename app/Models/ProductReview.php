<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductReview extends Model
{
    protected $fillable = [
        'user_id',
        'store_id',
        'product_id',
        'order_item_id',
        'rating',
        'comment',
        'is_anonymous',
        'seller_rating',
        'shipping_rating',
        'courier_rating',
        'images',
    ];

    protected $casts = [
        'is_anonymous' => 'boolean',
        'images' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function orderItem()
    {
        return $this->belongsTo(OrderItem::class);
    }
}
