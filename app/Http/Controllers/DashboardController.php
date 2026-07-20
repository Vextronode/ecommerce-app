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
        $stores = Store::with('user')->take(4)->get()->map(function ($store) {
            return [
                'id' => $store->id,
                'slug' => $store->slug,
                'name' => $store->name,
                'description' => $store->description,
                'image' => $store->user?->profile_photo_path
                    ? \Illuminate\Support\Facades\Storage::url($store->user->profile_photo_path)
                    : null,
            ];
        });

        $featuredProducts = Product::with(['store', 'category'])
            ->withSum(['orderItems as sold' => function ($query) {
                $query->whereHas('order', function ($q) {
                    $q->where('shipping_status', 'delivered');
                });
            }], 'quantity')
            ->withAvg('reviews as rating', 'rating')
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
