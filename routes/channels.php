<?php

use Illuminate\Support\Facades\Broadcast;
use App\Models\Order;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Merchant Store Orders Channel
Broadcast::channel('store.{storeId}', function ($user, $storeId) {
    $userStoreId = $user->store?->id;
    return ($userStoreId && (int) $userStoreId === (int) $storeId) || ($user->role ?? '') === 'admin';
});

// Per-store order list (for merchant Order Index page)
Broadcast::channel('store-orders.{storeId}', function ($user, $storeId) {
    $userStoreId = $user->store?->id;
    return ($userStoreId && (int) $userStoreId === (int) $storeId) || ($user->role ?? '') === 'admin';
});

// Per-user order list (for buyer History Index page)
Broadcast::channel('user-orders.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});

// Specific Order Channel (for Buyer & Merchant)
Broadcast::channel('order.{orderId}', function ($user, $orderId) {
    $order = Order::find($orderId);
    if (!$order) {
        return false;
    }
    $userStoreId = $user->store?->id;
    return (int) $user->id === (int) $order->user_id
        || ($userStoreId && (int) $userStoreId === (int) $order->store_id);
});

// Per-invoice tracking channel (for buyer History/Show, merchant OrderTableRow, Delivery Tracker)
Broadcast::channel('order-tracking.{invoiceNumber}', function ($user, $invoiceNumber) {
    $order = Order::where('invoice_number', $invoiceNumber)->first();
    if (!$order) {
        return false;
    }
    $userStoreId = $user->store?->id;
    return (int) $user->id === (int) $order->user_id
        || ($userStoreId && (int) $userStoreId === (int) $order->store_id);
});

// Batch delivery tracking channel (for BatchTracker & OrderTable)
Broadcast::channel('batch.{batchToken}', function ($user, $batchToken) {
    // Allow if user owns any order in this batch, or is the batch's store merchant
    $userStoreId = $user->store?->id;
    return Order::where('delivery_batch_token', $batchToken)
        ->where(function ($q) use ($user, $userStoreId) {
            $q->where('user_id', $user->id);
            if ($userStoreId) {
                $q->orWhere('store_id', $userStoreId);
            }
        })
        ->exists();
});
