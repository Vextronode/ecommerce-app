<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

#[Fillable([
    'store_id',
    'user_id',
    'invoice_number',
    'parent_transaction_id',
    'customer_name',
    'customer_phone',
    'shipping_address',
    'shipping_latitude',
    'shipping_longitude',
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
    'payment_status',
    'shipping_status',
    'notes',
])]
#[Hidden([
    'payment_payload',
    'shipping_pin',
    'delivery_batch_token',
    'balance_credited_at',
    'escrow_credited_at',
    'stock_restored_at',
])]
class Order extends Model
{
    protected $casts = [
        'payment_expiry_time' => 'datetime',
        'balance_credited_at' => 'datetime',
        'escrow_credited_at' => 'datetime',
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

            if (! $order || $order->stock_restored_at !== null) {
                return false; // Already restored, skip to prevent double restore
            }

            foreach ($order->items as $item) {
                if ($item->variant_name) {
                    $sku = ProductSku::where('product_id', $item->product_id)
                        ->where('variant_name', $item->variant_name)
                        ->lockForUpdate()
                        ->first();
                    if ($sku) {
                        $sku->increment('stock', $item->quantity);
                    }
                }

                $product = Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();
                if ($product) {
                    $product->increment('stock', $item->quantity);
                }
            }

            $order->forceFill(['stock_restored_at' => now()])->save();
            $this->stock_restored_at = $order->stock_restored_at;

            return true;
        });
    }

    public function deductRestoredStock(): bool
    {
        return DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            if (! $order || $order->stock_restored_at === null) {
                return false;
            }

            foreach ($order->items as $item) {
                if ($item->variant_name) {
                    $sku = ProductSku::where('product_id', $item->product_id)
                        ->where('variant_name', $item->variant_name)
                        ->lockForUpdate()
                        ->first();
                    if ($sku) {
                        $sku->decrement('stock', min($sku->stock, $item->quantity));
                    }
                }

                $product = Product::where('id', $item->product_id)
                    ->lockForUpdate()
                    ->first();
                if ($product) {
                    $product->decrement('stock', min($product->stock, $item->quantity));
                }
            }

            $order->forceFill(['stock_restored_at' => null])->save();
            $this->stock_restored_at = null;

            return true;
        });
    }

    /**
     * Net amount belonging to the merchant store (product subtotal + store courier shipping cost, excluding platform admin fee).
     */
    public function merchantNetAmount(): float
    {
        $subtotal = (float) ($this->subtotal ?? 0);
        $shippingCost = (float) ($this->shipping_cost ?? 0);

        if ($subtotal > 0) {
            return $subtotal + $shippingCost;
        }

        return (float) $this->total_amount;
    }

    /**
     * Idempotent and thread-safe merchant balance crediting
     */
    public function creditStoreBalance(): bool
    {
        return DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            if (! $order || $order->balance_credited_at !== null || ! $order->store_id) {
                return false; // Already credited or no store, prevent double-crediting
            }

            // defense-in-depth: order COD ga lewat escrow, jadi ga boleh narik saldo sama sekali.
            // kalau escrow belum pernah dikredit, juga ga boleh narik dari pending_balance (biar ga ada saldo dari udara).
            if ($order->payment_method === 'cod' || $order->escrow_credited_at === null) {
                return false;
            }

            $store = Store::where('id', $order->store_id)->lockForUpdate()->first();
            if ($store) {
                $amount = $order->merchantNetAmount();

                // Ensure we don't drop pending_balance below 0 due to old data
                if ($store->pending_balance >= $amount) {
                    $store->decrement('pending_balance', $amount);
                } else {
                    $store->forceFill(['pending_balance' => 0])->save();
                }

                $store->increment('available_balance', $amount);
            }

            $order->forceFill(['balance_credited_at' => now()])->save();
            $this->balance_credited_at = $order->balance_credited_at;

            return true;
        });
    }

    public function reversePendingBalance(): bool
    {
        return DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            // cuma boleh reverse kalau escrow memang pernah dicredit dan belum dipindah ke available
            if (! $order || ! $order->store_id || $order->escrow_credited_at === null || $order->balance_credited_at !== null) {
                return false;
            }

            $store = Store::where('id', $order->store_id)->lockForUpdate()->first();
            if ($store) {
                $amount = $order->merchantNetAmount();

                if ($store->pending_balance >= $amount) {
                    $store->decrement('pending_balance', $amount);
                } else {
                    $store->forceFill(['pending_balance' => 0])->save();
                }
            }

            // kosongin escrow flag biar ga di-reverse dobel
            $order->forceFill(['escrow_credited_at' => null])->save();
            $this->escrow_credited_at = null;

            return true;
        });
    }

    /**
     * tarik balik saldo yang udah masuk available (order udah delivered) saat refund
     * beda dari reversePendingBalance yang nanganin escrow belum dipindah
     */
    public function reverseCreditedBalance(): bool
    {
        return DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            // cuma jalan kalau saldo udah pernah dipindah ke available
            if (! $order || ! $order->store_id || $order->balance_credited_at === null) {
                return false;
            }

            $store = Store::where('id', $order->store_id)->lockForUpdate()->first();
            if ($store) {
                $amount = $order->merchantNetAmount();

                if ($store->available_balance >= $amount) {
                    $store->decrement('available_balance', $amount);
                } else {
                    $store->forceFill(['available_balance' => 0])->save();
                }
            }

            // tandai udah ditarik biar ga dobel
            $order->forceFill(['balance_credited_at' => null])->save();
            $this->balance_credited_at = null;

            return true;
        });
    }


    /**
     * Mark order as arrived at customer delivery location.
     */
    public function markAsArrived(): void
    {
        \Illuminate\Support\Facades\Cache::put("order_arrived_{$this->id}", now()->toIso8601String(), 86400 * 7);
        if (\Illuminate\Support\Facades\Schema::hasColumn('orders', 'arrived_at')) {
            $this->forceFill(['arrived_at' => now()])->save();
        }
    }


    /**
     * Check whether courier has arrived at destination.
     */
    public function isArrived(): bool
    {
        if (!empty($this->arrived_at)) {
            return true;
        }
        return \Illuminate\Support\Facades\Cache::has("order_arrived_{$this->id}");
    }

    /**
     * Check if buyer is eligible to complete this order.
     * Buyer button activates when courier arrives OR after 4 hours have passed (for non-COD).
     */
    public function canBuyerComplete(): bool
    {
        if ($this->shipping_status !== 'shipped') {
            return false;
        }

        if ($this->payment_method === 'cod' || $this->payment_status !== 'paid') {
            return false;
        }

        if ($this->delivery_method !== 'local_delivery') {
            return true;
        }

        if ($this->isArrived()) {
            return true;
        }

        $hoursElapsed = $this->updated_at ? $this->updated_at->diffInHours(now()) : 0;
        return $hoursElapsed >= 4;
    }

    /**
     * Automatically complete delivery by system (e.g. after 4 hours timeout like Shopee).
     */
    public function autoCompleteDelivery(): bool
    {
        if (
            $this->shipping_status !== 'shipped' ||
            $this->delivery_method !== 'local_delivery' ||
            $this->payment_method === 'cod' ||
            $this->payment_status !== 'paid'
        ) {
            return false;
        }

        return DB::transaction(function () {
            $locked = self::where('id', $this->id)->lockForUpdate()->first();
            if (
                ! $locked ||
                $locked->shipping_status !== 'shipped' ||
                $locked->delivery_method !== 'local_delivery' ||
                $locked->payment_method === 'cod' ||
                $locked->payment_status !== 'paid'
            ) {
                return false;
            }

            $locked->update(['shipping_status' => 'delivered']);
            $locked->creditStoreBalance();

            \App\Services\OrderNotificationService::orderDelivered($locked);

            try {
                broadcast(new \App\Events\OrderStatusUpdated($locked))->toOthers();
            } catch (\Throwable $e) {}

            Log::info("Order #{$locked->invoice_number} auto-completed by system (4-hour timeout).");
            return true;
        });
    }
}

