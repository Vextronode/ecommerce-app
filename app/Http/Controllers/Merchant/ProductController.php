<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->load('store');

        if (! $user->store) {
            return redirect()->route('merchant.store.setup');
        }

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

    public function create(Request $request)
    {
        $user = $request->user()->load('store');

        if (! $user->store) {
            return redirect()->route('merchant.store.setup');
        }

        if (empty(trim($user->store->address ?? ''))) {
            return redirect()->route('merchant.settings.index')
                ->with('warning', 'Alamat toko wajib diisi terlebih dahulu sebelum Anda dapat mengunggah atau membuat produk baru.');
        }

        return Inertia::render('Merchant/Product/Create', [
            'categories' => Category::all(),
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user()->load('store');

        if (! $user->store) {
            return redirect()->route('merchant.store.setup');
        }

        if (empty(trim($user->store->address ?? ''))) {
            return redirect()->route('merchant.settings.index')
                ->with('warning', 'Alamat toko wajib diisi terlebih dahulu sebelum Anda dapat mengunggah atau membuat produk baru.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'is_preorder' => 'boolean',
            'po_days' => 'nullable|integer|min:0|max:365',
            'po_hours' => 'nullable|integer|min:0|max:23',
            'variants' => 'nullable|array|max:10',
            'variants.*.name' => 'required|string|max:100',
            'variants.*.options' => 'nullable|array|max:50',
            'variants.*.options.*' => 'required|string|max:100',
            'skus' => 'nullable|array|max:100',
            'skus.*.variant_name' => 'required|string|max:100',
            'skus.*.price' => 'required|numeric|min:100|max:1000000000',
            'skus.*.stock' => 'required|integer|min:0|max:1000000',
            'price' => 'required_without:skus|nullable|numeric|min:100|max:1000000000',
            'stock' => 'required_without:skus|nullable|integer|min:0|max:1000000',
            'unit' => 'nullable|string|max:20',
        ]);

        $hasSkus = $request->has('skus') && is_array($request->skus) && count($request->skus) > 0;

        $basePrice = $request->price ?? 0;
        $totalStock = $request->stock ?? 0;

        if ($hasSkus) {
            $basePrice = collect($request->skus)->min('price');
            $totalStock = collect($request->skus)->sum('stock');
        }

        $product = \Illuminate\Support\Facades\DB::transaction(function () use ($request, $user, $hasSkus, $basePrice, $totalStock) {
            $cleanName = strip_tags(trim($request->name));
            $product = $user->store->products()->create([
                'category_id' => $request->category_id,
                'name' => $cleanName,
                'description' => $request->description ? strip_tags(trim($request->description)) : null,
                'price' => $basePrice,
                'slug' => Str::slug($cleanName).'-'.uniqid(),
                'unit' => $request->unit ? strip_tags(trim($request->unit)) : null,
                'stock' => $totalStock,
                'is_active' => true,
                'is_preorder' => $request->is_preorder ?? false,
                'po_days' => $request->po_days ?? 0,
                'po_hours' => $request->po_hours ?? 0,
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $index => $file) {
                    [$path] = app(\App\Services\ChatMediaProcessor::class)->store($file, 'products', 'public');
                    $url = '/storage/'.$path;

                    if ($index === 0) {
                        $product->update(['image_path' => $url]);
                    }
                    $product->images()->create(['image_path' => $url]);
                }
            }

            if ($request->has('variants') && is_array($request->variants)) {
                foreach ($request->variants as $variantData) {
                    $variantName = strip_tags(trim((string) ($variantData['name'] ?? '')));
                    if ($variantName !== '') {
                        $variant = $product->variants()->create(['name' => $variantName]);
                        if (! empty($variantData['options'])) {
                            foreach ($variantData['options'] as $optionName) {
                                $cleanOpt = strip_tags(trim((string) $optionName));
                                if ($cleanOpt !== '') {
                                    $variant->options()->create(['name' => $cleanOpt]);
                                }
                            }
                        }
                    }
                }
            }

            if ($hasSkus) {
                foreach ($request->skus as $sku) {
                    $product->skus()->create([
                        'variant_name' => strip_tags(trim((string) $sku['variant_name'])),
                        'price' => $sku['price'],
                        'stock' => $sku['stock'],
                    ]);
                }
            }

            return $product;
        });

        try {
            broadcast(new \App\Events\ProductStockUpdated($product, 'created'))->toOthers();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ProductStockUpdated broadcast error: ' . $e->getMessage());
        }

        try {
            $followers = $user->store->followers()->get();
            foreach ($followers as $follower) {
                $follower->notify(new \App\Notifications\PushNotification(
                    title: '✨ Produk Baru dari ' . $user->store->name,
                    message: $user->store->name . ' baru saja menambahkan produk baru: "' . $product->name . '". Yuk cek sekarang!',
                    type: 'promo',
                    actionUrl: route('product.detail', $product->slug)
                ));
            }
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Follower notification error: ' . $e->getMessage());
        }

        return redirect()->route('merchant.products.index');
    }

    public function edit(Product $product)
    {
        if ($product->store_id !== auth()->user()->store?->id) {
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
        if ($product->store_id !== auth()->user()->store?->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'description' => 'nullable|string',
            'images' => 'nullable|array|max:5',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:2048',
            'deleted_images' => 'nullable|array',
            'deleted_images.*' => 'integer',
            'is_preorder' => 'boolean',
            'po_days' => 'nullable|integer|min:0|max:365',
            'po_hours' => 'nullable|integer|min:0|max:23',
            'variants' => 'nullable|array|max:10',
            'variants.*.name' => 'required|string|max:100',
            'variants.*.options' => 'nullable|array|max:50',
            'variants.*.options.*' => 'required|string|max:100',
            'skus' => 'nullable|array|max:100',
            'skus.*.variant_name' => 'required|string|max:100',
            'skus.*.price' => 'required|numeric|min:100|max:1000000000',
            'skus.*.stock' => 'required|integer|min:0|max:1000000',
            'price' => 'required_without:skus|nullable|numeric|min:100|max:1000000000',
            'stock' => 'required_without:skus|nullable|integer|min:0|max:1000000',
            'unit' => 'nullable|string|max:20',
        ]);

        $hasSkus = $request->has('skus') && is_array($request->skus) && count($request->skus) > 0;

        $basePrice = $request->price ?? 0;
        $totalStock = $request->stock ?? 0;

        if ($hasSkus) {
            $basePrice = collect($request->skus)->min('price');
            $totalStock = collect($request->skus)->sum('stock');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($request, $product, $hasSkus, $basePrice, $totalStock) {
            $cleanName = strip_tags(trim($request->name));
            $newSlug = $cleanName !== $product->name
                ? Str::slug($cleanName.'-'.uniqid())
                : $product->slug;

            $product->update([
                'category_id' => $request->category_id,
                'name' => $cleanName,
                'slug' => $newSlug,
                'description' => $request->description ? strip_tags(trim($request->description)) : null,
                'price' => $basePrice,
                'stock' => $totalStock,
                'is_preorder' => $request->is_preorder ?? false,
                'po_days' => $request->po_days ?? 0,
                'po_hours' => $request->po_hours ?? 0,
                'unit' => $request->unit ? strip_tags(trim($request->unit)) : null,
            ]);

            if ($request->has('deleted_images')) {
                $imagesToDelete = $product->images()->whereIn('id', $request->deleted_images)->get();
                foreach ($imagesToDelete as $img) {
                    $this->safeDeleteStoredFile($img->image_path);
                    $img->delete();
                }
            }

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $file) {
                    [$path] = app(\App\Services\ChatMediaProcessor::class)->store($file, 'products', 'public');
                    $url = '/storage/'.$path;
                    $product->images()->create(['image_path' => $url]);
                }
            }

            $firstImage = $product->images()->first();
            $product->update(['image_path' => $firstImage ? $firstImage->image_path : null]);

            $product->variants()->delete();
            if ($request->has('variants') && is_array($request->variants)) {
                foreach ($request->variants as $variantData) {
                    $variantName = strip_tags(trim((string) ($variantData['name'] ?? '')));
                    if ($variantName !== '') {
                        $variant = $product->variants()->create(['name' => $variantName]);
                        if (! empty($variantData['options'])) {
                            foreach ($variantData['options'] as $optionName) {
                                $cleanOpt = strip_tags(trim((string) $optionName));
                                if ($cleanOpt !== '') {
                                    $variant->options()->create(['name' => $cleanOpt]);
                                }
                            }
                        }
                    }
                }
            }

            if ($hasSkus) {
                $keptVariantNames = [];
                foreach ($request->skus as $sku) {
                    $cleanVariantName = strip_tags(trim((string) $sku['variant_name']));
                    $keptVariantNames[] = $cleanVariantName;
                    $product->skus()->updateOrCreate(
                        ['variant_name' => $cleanVariantName],
                        [
                            'price' => $sku['price'],
                            'stock' => $sku['stock'],
                        ]
                    );
                }
                $product->skus()->whereNotIn('variant_name', $keptVariantNames)->delete();
            } else {
                $product->skus()->delete();
            }
        });

        try {
            broadcast(new \App\Events\ProductStockUpdated($product, 'updated'))->toOthers();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ProductStockUpdated broadcast error: ' . $e->getMessage());
        }

        return redirect()->route('merchant.products.index');
    }

    public function destroy(Product $product)
    {
        if ($product->store_id !== auth()->user()->store?->id) {
            abort(403, 'Unauthorized action.');
        }

        $hasActiveOrders = $product->orderItems()
            ->whereHas('order', function ($q) {
                $q->whereIn('shipping_status', ['pending', 'processing', 'shipped']);
            })
            ->exists();

        if ($hasActiveOrders) {
            return redirect()->back()->with('error', 'Produk tidak dapat dihapus karena masih terdapat pesanan yang sedang berjalan.');
        }

        if ($product->image_path) {
            $this->safeDeleteStoredFile($product->image_path);
        }

        foreach ($product->images as $img) {
            $this->safeDeleteStoredFile($img->image_path);
        }

        try {
            broadcast(new \App\Events\ProductStockUpdated($product, 'deleted'))->toOthers();
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('ProductStockUpdated broadcast error: ' . $e->getMessage());
        }

        $product->delete();

        return redirect()->route('merchant.products.index');
    }

    private function safeDeleteStoredFile(?string $path): void
    {
        if (! $path) {
            return;
        }

        $cleanPath = ltrim(str_replace('/storage/', '', $path), '/');
        if (Storage::disk('public')->exists($cleanPath)) {
            Storage::disk('public')->delete($cleanPath);
        }
    }
}
