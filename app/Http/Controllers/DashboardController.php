<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $categories = Category::all();
        $stores = Store::take(4)->get();

        $featuredProducts = Product::with(['store', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Dashboard', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
            'stores' => $stores,
        ]);
    }
}
