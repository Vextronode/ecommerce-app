<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ChatNegotiation extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_room_id',
        'user_id',
        'store_id',
        'product_id',
        'product_sku_id',
        'original_price',
        'offered_price',
        'quantity',
        'po_days',
        'note',
        'status',
        'last_action_by',
        'counter_price',
        'expires_at',
        'purchased_at',
        'order_id',
    ];

    protected function casts(): array
    {
        return [
            'original_price' => 'decimal:2',
            'offered_price' => 'decimal:2',
            'counter_price' => 'decimal:2',
            'quantity' => 'integer',
            'po_days' => 'integer',
            'expires_at' => 'datetime',
            'purchased_at' => 'datetime',
        ];
    }

    public function chatRoom(): BelongsTo
    {
        return $this->belongsTo(ChatRoom::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function sku(): BelongsTo
    {
        return $this->belongsTo(ProductSku::class, 'product_sku_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(ChatMessage::class, 'negotiation_id');
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class, 'negotiation_id');
    }

    public function getAgreedPriceAttribute(): float
    {
        return (float) ($this->counter_price ?? $this->offered_price);
    }

    public function isExpired(): bool
    {
        if ($this->status === 'expired') {
            return true;
        }

        if ($this->expires_at && $this->expires_at->isPast() && in_array($this->status, ['pending', 'countered', 'accepted'], true)) {
            return true;
        }

        return false;
    }

    public function checkAndExpire(): bool
    {
        if ($this->isExpired() && $this->status !== 'expired') {
            $this->update(['status' => 'expired']);
            return true;
        }

        return false;
    }
}

