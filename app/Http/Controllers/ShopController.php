<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    public function index(Request $request)
    {
        $categories = Category::all();
        $query = Product::with(['store', 'category'])
            ->where('is_active', true)
            ->where('stock', '>', 0);

        if ($request->has('search') && $request->search != '') {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhereHas('category', function ($qCat) use ($search) {
                      $qCat->where('name', 'like', "%{$search}%");
                  });
            });
        }

        $products = $query->latest()->get();

        $groupedProducts = [];
        foreach ($categories as $category) {
            $catProducts = $products->where('category_id', $category->id)->values();
            if ($catProducts->count() > 0) {
                $groupedProducts[] = [
                    'category_name' => $category->name,
                    'products' => $catProducts,
                ];
            }
        }

        return Inertia::render('Storefront/Shop', [
            'categories' => $categories,
            'groupedProducts' => $groupedProducts,
            'searchQuery' => $request->search ?? '',
        ]);
    }

    public function show($id)
    {
        $product = Product::with([
            'store',
            'category',
            'images',
            'variants.options',
            'skus',
        ])->findOrFail($id);

        $relatedProducts = Product::with(['store', 'category'])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->where('stock', '>', 0)
            ->latest()
            ->take(5)
            ->get();

        return Inertia::render('Storefront/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }
}
