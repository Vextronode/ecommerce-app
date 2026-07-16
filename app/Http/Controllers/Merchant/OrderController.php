<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        // 1. Ambil data toko dari merchant yang lagi login
        $store = $request->user()->store;

        if (!$store) {
            // Jaga-jaga kalau dia belum setup toko, lempar ke halaman setup
            return redirect()->route('merchant.store.setup');
        }

        // 2. Tarik data pesanan KHUSUS buat toko ini aja, urutin dari yang terbaru
        $orders = Order::with(['user', 'items'])
            ->where('store_id', $store->id)
            ->latest()
            ->paginate(10); // Dibikin pagination per 10 baris

        // 3. Hitung data statistik buat di OrderSummaryCard
        $totalOrders = Order::where('store_id', $store->id)->count();
        $pendingShipping = Order::where('store_id', $store->id)->where('shipping_status', 'pending')->count();
        $pendingPayment = Order::where('store_id', $store->id)->where('payment_status', 'pending')->count();

        // 4. Lempar datanya ke frontend (React)
        return Inertia::render('Merchant/Order/Index', [
            'orders' => $orders,
            'stats' => [
                'totalOrders' => $totalOrders,
                'pendingShipping' => $pendingShipping,
                'pendingPayment' => $pendingPayment,
            ],
        ]);
    }
}
