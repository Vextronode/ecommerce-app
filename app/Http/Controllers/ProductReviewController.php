<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProductReviewController extends Controller
{
    public function create($order_item_id)
    {
        $orderItem = OrderItem::with(['order.store', 'product', 'review'])
            ->where('id', $order_item_id)
            ->whereHas('order', function ($query) {
                $query->where('user_id', auth()->id())
                      ->where('shipping_status', 'delivered');
            })
            ->first();

        if (!$orderItem) {
            return redirect()->route('history.index', ['status' => 'rating'])
                ->with('error', 'Produk tidak ditemukan atau belum selesai.');
        }

        return Inertia::render('History/RatingForm', [
            'orderItem' => [
                'id' => $orderItem->id,
                'product_id' => $orderItem->product_id,
                'product_name' => $orderItem->product_name,
                'variant_name' => $orderItem->variant_name,
                'quantity' => $orderItem->quantity,
                'price' => $orderItem->price,
                'image' => $orderItem->product ? ($orderItem->product->image_path ?? 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200') : 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=80&w=200',
                'store_name' => $orderItem->order->store->name ?? 'Toko',
                'existing_review' => $orderItem->review ? [
                    'rating' => $orderItem->review->rating,
                    'comment' => $orderItem->review->comment,
                    'is_anonymous' => $orderItem->review->is_anonymous,
                    'seller_rating' => $orderItem->review->seller_rating,
                    'shipping_rating' => $orderItem->review->shipping_rating,
                    'courier_rating' => $orderItem->review->courier_rating,
                    'images' => $orderItem->review->images ?? [],
                ] : null,
            ]
        ]);
    }

    public function store(Request $request, $order_item_id)
    {
        $orderItem = OrderItem::with(['order', 'review'])->findOrFail($order_item_id);

        if ($orderItem->order->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'seller_rating' => 'nullable|integer|min:1|max:5',
            'shipping_rating' => 'nullable|integer|min:1|max:5',
            'courier_rating' => 'nullable|integer|min:1|max:5',
            'images' => 'nullable|array|max:3',
            'images.*' => 'nullable|file|mimes:jpeg,png,jpg,mp4,mov|max:10240',
        ]);

        $imagePaths = $orderItem->review ? ($orderItem->review->images ?? []) : [];
        if ($request->hasFile('images')) {
            // Kita bisa menghapus gambar lama di storage jika diperlukan, untuk simpelnya kita tumpuk saja
            $imagePaths = []; 
            $files = is_array($request->file('images')) ? $request->file('images') : [$request->file('images')];
            foreach ($files as $file) {
                $path = $file->store('reviews', 'public');
                $imagePaths[] = '/storage/' . $path;
            }
        }

        $reviewData = [
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'seller_rating' => $validated['seller_rating'] ?? null,
            'shipping_rating' => $validated['shipping_rating'] ?? null,
            'courier_rating' => $validated['courier_rating'] ?? null,
            'images' => count($imagePaths) > 0 ? $imagePaths : null, // keep old ones if no new files? Actually if they don't upload new, keep old. wait, the frontend might send files again or not. We'll simplify: if they upload new ones, overwrite. Otherwise keep old.
        ];
        
        if (!$request->hasFile('images')) {
            $reviewData['images'] = $orderItem->review ? $orderItem->review->images : null;
        }

        if ($orderItem->review) {
            $orderItem->review->update($reviewData);
        } else {
            $reviewData['user_id'] = auth()->id();
            $reviewData['store_id'] = $orderItem->order->store_id;
            $reviewData['product_id'] = $orderItem->product_id;
            $reviewData['order_item_id'] = $orderItem->id;
            ProductReview::create($reviewData);
        }

        return redirect()->route('history.index', ['status' => 'rating'])
            ->with('success', 'Penilaian berhasil disimpan!');
    }
}
