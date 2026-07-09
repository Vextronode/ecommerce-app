<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    // fngsi yg nampilin daftar produk
    public function index(Request $request)
    {
        $user = $request->user()->load('store');
        $products = $user->store->products()->with('category')->latest()->paginate(10);

        return Inertia::render('Merchant/Product/Index', [
            'products' => $products,
        ]);
    }

    // fungsi yg nampilin halaman form tambah produk
    public function create()
    {
        // ambil semua kategori biar bisa dipilih di dropdown form
        $categories = Category::all();

        return Inertia::render('Merchant/Product/Create', [
            'categories' => $categories,
        ]);
    }

    // proses nyimpen data produk baru
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $user = $request->user()->load('store');
        $imagePath = null;

        // kalau pedagang upload foto, kita simpan di folder 'products'
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('products', 'public');
            $imagePath = '/storage/' . $path;
        }

        $user->store->products()->create([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => Str::slug($request->name . '-' . uniqid()),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image_path' => $imagePath,
            'is_active' => true,
        ]);

        return redirect()->route('merchant.products.index');
    }

    // form edit produk
    public function edit(\App\Models\Product $product)
    {
        // balidasi pedagang cuma bisa edit produk milik tokonya sendiri
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        return Inertia::render('Merchant/Product/Edit', [
            'product' => $product,
            'categories' => \App\Models\Category::all(),
        ]);
    }

    // update data produk
    public function update(Request $request, \App\Models\Product $product)
    {
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'price' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'description' => 'nullable|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        $imagePath = $product->image_path;

        // upload foto baru dan, hapus foto lama dan simpan yang baru
        if ($request->hasFile('image')) {
            // hapus file lama jika ada
            if ($product->image_path && file_exists(public_path($product->image_path))) {
                @unlink(public_path($product->image_path));
            }

            $path = $request->file('image')->store('products', 'public');
            $imagePath = '/storage/' . $path;
        }

        $product->update([
            'category_id' => $request->category_id,
            'name' => $request->name,
            'slug' => \Illuminate\Support\Str::slug($request->name . '-' . uniqid()),
            'description' => $request->description,
            'price' => $request->price,
            'stock' => $request->stock,
            'image_path' => $imagePath,
        ]);

        return redirect()->route('merchant.products.index');
    }

    // hapus produk
    public function destroy(\App\Models\Product $product)
    {
        if ($product->store_id !== auth()->user()->store->id) {
            abort(403, 'Unauthorized action.');
        }

        // aapus file gambarnya dari storage sebelum datanya dihapus
        if ($product->image_path && file_exists(public_path($product->image_path))) {
            @unlink(public_path($product->image_path));
        }

        $product->delete();

        return redirect()->route('merchant.products.index');
    }
}
