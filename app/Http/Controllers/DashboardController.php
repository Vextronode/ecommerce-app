<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $categories = Category::all();

        $featuredProducts = Product::with(['store', 'category'])
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(10)
            ->get();

        return Inertia::render('Dashboard/Dashboard', [
            'categories' => $categories,
            'featuredProducts' => $featuredProducts,
        ]);
    }
}
