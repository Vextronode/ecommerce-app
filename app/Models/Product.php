<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id', 'category_id', 'name', 'slug', 'description',
        'price', 'stock', 'image_path', 'is_active',
        'is_preorder', 'po_days', 'po_hours', 'unit',
    ];

    protected $appends = ['sold'];

    public function getSoldAttribute()
    {
        return $this->attributes['sold'] ?? 0;
    }

    public function store()
    {
        return $this->belongsTo(Store::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants()
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function skus()
    {
        return $this->hasMany(ProductSku::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }
}
