<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Order;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Merchant Store Orders Channel
Broadcast::channel('store.{storeId}', function ($user, $storeId) {
    return (int) ($user->store?->id ?? 0) === (int) $storeId || ($user->role ?? '') === 'admin';
});

// Specific Order Channel (for Buyer & Merchant)
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = Order::find($orderId);
    if (!$order) {
        return false;
    }
    return (int) $user->id === (int) $order->user_id || (int) ($user->store?->id ?? 0) === (int) $order->store_id;
});
