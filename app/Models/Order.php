<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class Order extends Model
{
    protected $fillable = [
        'store_id',
        'user_id',
        'invoice_number',
        'parent_transaction_id',
        'customer_name',
        'customer_phone',
        'shipping_address',
        'shipping_latitude',
        'shipping_longitude',
        'shipping_pin',
        'delivery_method',
        'subtotal',
        'shipping_cost',
        'total_amount',
        'payment_method',
        'payment_type',
        'payment_channel',
        'va_number',
        'bill_key',
        'biller_code',
        'qr_code_url',
        'payment_expiry_time',
        'payment_payload',
        'payment_status',
        'balance_credited_at',
        'stock_restored_at',
        'shipping_status',
        'notes',
    ];

    protected $casts = [
        'payment_expiry_time' => 'datetime',
        'balance_credited_at' => 'datetime',
        'stock_restored_at' => 'datetime',
        'payment_payload' => 'array',
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
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

    /**
     * Idempotent and thread-safe stock restoration
     */
    public function restoreStock(): bool
    {
        return DB::transaction(function () {
            // Lock this order row for atomic update
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$order || $order->stock_restored_at !== null) {
                return false; // Already restored, skip to prevent double restore
            }

            foreach ($order->items as $item) {
                if ($item->variant_name) {
                    $sku = \App\Models\ProductSku::where('product_id', $item->product_id)
                        ->where('variant_name', $item->variant_name)
                        ->lockForUpdate()
                        ->first();
                    if ($sku) {
                        $sku->increment('stock', $item->quantity);
                    }
                }

                $product = \App\Models\Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
            }

            $order->update(['stock_restored_at' => now()]);
            $this->stock_restored_at = $order->stock_restored_at;

            return true;
        });
    }

    /**
     * Idempotent and thread-safe merchant balance crediting (credits net subtotal only)
     */
    public function creditStoreBalance(): bool
    {
        return DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$order || $order->balance_credited_at !== null || !$order->store_id) {
                return false; // Already credited or no store, prevent double-crediting
            }

            $store = Store::where('id', $order->store_id)->lockForUpdate()->first();
            if ($store) {
                // Move total amount from pending_balance to available_balance
                $amount = (float) $order->total_amount;
                
                // Ensure we don't drop pending_balance below 0 due to old data
                if ($store->pending_balance >= $amount) {
                    $store->decrement('pending_balance', $amount);
                } else {
                    $store->update(['pending_balance' => 0]);
                }
                
                $store->increment('available_balance', $amount);

                Log::info("Escrow Released: Moved Rp {$amount} from pending to available for store ID {$store->id} for order #{$order->invoice_number}");
            }

            $order->update(['balance_credited_at' => now()]);
            $this->balance_credited_at = $order->balance_credited_at;

            return true;
        });
    }
}
