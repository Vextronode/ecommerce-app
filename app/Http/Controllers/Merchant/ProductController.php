<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('store');

        $query = $user->store->products()->with(['category', 'images', 'variants.options', 'skus'])->latest();

        if ($request->filled('category')) {
            $query->where('category_id', $request->category);
        }

        if ($request->filled('status')) {
            switch ($request->status) {
                case 'habis':
                    $query->where('stock', 0);
                    break;
                case 'kritis':
                    $query->whereBetween('stock', [1, 5]);
                    break;
                case 'menipis':
                    $query->whereBetween('stock', [6, 10]);
                    break;
                case 'active':
                    $query->where('stock', '>', 10);
                    break;
            }
        }


        if ($request->filled('search')) {
            $searchTerm = $request->search;
            $query->where('name', 'like', "%{$searchTerm}%");
        }

        $products = $query->paginate(10)->withQueryString();

        return Inertia::render('Merchant/Product/Index', [
            'products' => $products,
            'categories' => Category::all(),
            'filters' => $request->only(['category', 'status', 'search']),
        ]);
    }

    public function create()
    {
        return Inertia::render('Merchant/Product/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_preorder' => 'boolean',
            'po_days' => 'nullable|integer|min:0',
            'po_hours' => 'nullable|integer|min:0|max:23',
            'variants' => 'nullable|array',
            'skus' => 'nullable|array',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
        ]);

        $hasSkus = $request->has('skus') && is_array($request->skus) && count($request->skus) > 0;

        $basePrice = $request->price ?? 0;
        $totalStock = $request->stock ?? 0;

        if ($hasSkus) {
            $basePrice = collect($request->skus)->min('price');
            $totalStock = collect($request->skus)->sum('stock');
        }

        $user = $request->user()->load('store');

        $product = $user->store->products()->create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name . '-' . uniqid()),
            'description' => $request->description,
            'price' => $basePrice,
            'stock' => $totalStock,
            'is_active' => true,
            'is_preorder' => $request->is_preorder ?? false,
            'po_days' => $request->po_days ?? 0,
            'po_hours' => $request->po_hours ?? 0,
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $file) {
                $path = $file->store('products', 'public');
                $url = '/storage/' . $path;

                if ($index === 0) {
                    $product->update(['image_path' => $url]);
                }
                $product->images()->create(['image_path' => $url]);
            }
        }

        if ($request->has('variants') && is_array($request->variants)) {
            foreach ($request->variants as $variantData) {
                if (!empty($variantData['name'])) {
                    $variant = $product->variants()->create(['name' => $variantData['name']]);
                    if (!empty($variantData['options'])) {
                        foreach ($variantData['options'] as $optionName) {
                            $variant->options()->create(['name' => $optionName]);
                        }
                    }
                }
            }
        }

        if ($hasSkus) {
            foreach ($request->skus as $sku) {
                $product->skus()->create([
                    'variant_name' => $sku['variant_name'],
                    'price' => $sku['price'],
                    'stock' => $sku['stock'],
                ]);
            }
        }

        return redirect()->route('merchant.products.index');
    }

    public function edit(Product $product)
    {
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        $product->load(['images', 'variants.options', 'skus']);

        return Inertia::render('Merchant/Product/Edit', [
            'product' => $product,
            'categories' => Category::all(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'deleted_images' => 'nullable|array',
            'is_preorder' => 'boolean',
            'po_days' => 'nullable|integer|min:0',
            'po_hours' => 'nullable|integer|min:0|max:23',
            'variants' => 'nullable|array',
            'skus' => 'nullable|array',
            'price' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
        ]);

        $hasSkus = $request->has('skus') && is_array($request->skus) && count($request->skus) > 0;

        $basePrice = $request->price ?? 0;
        $totalStock = $request->stock ?? 0;

        if ($hasSkus) {
            $basePrice = collect($request->skus)->min('price');
            $totalStock = collect($request->skus)->sum('stock');
        }

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name . '-' . uniqid()),
            'description' => $request->description,
            'price' => $basePrice,
            'stock' => $totalStock,
            'is_preorder' => $request->is_preorder ?? false,
            'po_days' => $request->po_days ?? 0,
            'po_hours' => $request->po_hours ?? 0,
        ]);

        if ($request->has('deleted_images')) {
            $imagesToDelete = $product->images()->whereIn('id', $request->deleted_images)->get();
            foreach ($imagesToDelete as $img) {
                if (file_exists(public_path($img->image_path))) {
                    @unlink(public_path($img->image_path));
                }
                $img->delete();
            }
        }

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $file) {
                $path = $file->store('products', 'public');
                $url = '/storage/' . $path;
                $product->images()->create(['image_path' => $url]);
            }
        }

        $firstImage = $product->images()->first();
        $product->update(['image_path' => $firstImage ? $firstImage->image_path : null]);

        $product->variants()->delete();
        if ($request->has('variants') && is_array($request->variants)) {
            foreach ($request->variants as $variantData) {
                if (!empty($variantData['name'])) {
                    $variant = $product->variants()->create(['name' => $variantData['name']]);
                    if (!empty($variantData['options'])) {
                        foreach ($variantData['options'] as $optionName) {
                            $variant->options()->create(['name' => $optionName]);
                        }
                    }
                }
            }
        }

        $product->skus()->delete();
        if ($hasSkus) {
            foreach ($request->skus as $sku) {
                $product->skus()->create([
                    'variant_name' => $sku['variant_name'],
                    'price' => $sku['price'],
                    'stock' => $sku['stock'],
                ]);
            }
        }

        return redirect()->route('merchant.products.index');
    }

    public function destroy(Product $product)
    {
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        if ($product->image_path && file_exists(public_path($product->image_path))) {
            @unlink(public_path($product->image_path));
        }

        foreach ($product->images as $img) {
            if (file_exists(public_path($img->image_path))) {
                @unlink(public_path($img->image_path));
            }
        }

        $product->delete();

        return redirect()->route('merchant.products.index');
    }
}
