<?php

namespace App\Http\Controllers;

use App\Models\OrderItem;
use App\Models\ProductReview;
use App\Notifications\PushNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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

        if (! $orderItem) {
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
                'image' => $orderItem->product ? ($orderItem->product->image_path ?? 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400') : 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&q=80&w=400',
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
            ],
        ]);
    }

    public function store(Request $request, $order_item_id)
    {
        $orderItem = OrderItem::with(['order', 'review'])
            ->where('id', $order_item_id)
            ->whereHas('order', function ($query) {
                $query->where('user_id', auth()->id())
                    ->where('shipping_status', 'delivered');
            })
            ->first();

        if (! $orderItem) {
            abort(403, 'Anda hanya dapat memberikan ulasan untuk pesanan Anda sendiri yang telah selesai.');
        }

        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
            'is_anonymous' => 'boolean',
            'seller_rating' => 'nullable|integer|min:1|max:5',
            'shipping_rating' => 'nullable|integer|min:1|max:5',
            'courier_rating' => 'nullable|integer|min:1|max:5',
            'images' => ['nullable', 'array', 'max:3'],
            'images.*' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,webp,mp4,mov',
                'mimetypes:image/jpeg,image/png,image/webp,video/mp4,video/quicktime',
                'max:5120',
            ],
        ]);

        $imagePaths = $orderItem->review ? ($orderItem->review->images ?? []) : [];
        if ($request->hasFile('images')) {
            $files = is_array($request->file('images')) ? $request->file('images') : [$request->file('images')];
            $videoCount = 0;

            foreach ($files as $file) {
                $mime = (string) $file->getMimeType();
                $isImage = str_starts_with($mime, 'image/');
                $isVideo = str_starts_with($mime, 'video/');

                if (! $isImage && ! $isVideo) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'images' => 'Tipe file tidak valid. Hanya foto (JPEG, PNG, WebP) dan video (MP4, MOV) yang diizinkan.',
                    ]);
                }

                // Foto maksimal 2MB (2048 KB)
                if ($isImage && $file->getSize() > 2048 * 1024) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'images' => "Ukuran foto '{$file->getClientOriginalName()}' melebihi batas maksimal 2MB.",
                    ]);
                }

                // Video maksimal 1 file dan ukuran maksimal 5MB (5120 KB)
                if ($isVideo) {
                    $videoCount++;
                    if ($videoCount > 1) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'images' => 'Maksimal hanya diperbolehkan mengunggah 1 file video per ulasan.',
                        ]);
                    }
                    if ($file->getSize() > 5120 * 1024) {
                        throw \Illuminate\Validation\ValidationException::withMessages([
                            'images' => "Ukuran video '{$file->getClientOriginalName()}' melebihi batas maksimal 5MB.",
                        ]);
                    }
                }
            }

            // Hapus file review lama di disk jika diganti baru
            if ($orderItem->review && is_array($orderItem->review->images)) {
                foreach ($orderItem->review->images as $oldPath) {
                    $relativeOldPath = str_replace('/storage/', '', (string) $oldPath);
                    if (Storage::disk('public')->exists($relativeOldPath)) {
                        Storage::disk('public')->delete($relativeOldPath);
                    }
                }
            }

            $imagePaths = [];
            foreach ($files as $file) {
                $path = $file->store('reviews', 'public');
                $imagePaths[] = '/storage/'.$path;
            }
        }

        $sanitizedComment = isset($validated['comment']) ? strip_tags(trim($validated['comment'])) : null;

        $reviewData = [
            'rating' => $validated['rating'],
            'comment' => $sanitizedComment,
            'is_anonymous' => $validated['is_anonymous'] ?? false,
            'seller_rating' => $validated['seller_rating'] ?? null,
            'shipping_rating' => $validated['shipping_rating'] ?? null,
            'courier_rating' => $validated['courier_rating'] ?? null,
            'images' => count($imagePaths) > 0 ? $imagePaths : null,
        ];

        if (! $request->hasFile('images')) {
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

            // Notify Store Owner
            try {
                $store = $orderItem->order?->store;
                $storeOwner = $store?->user;
                if ($storeOwner) {
                    $merchantSettings = $storeOwner->notification_settings ?? [];
                    $isAllowed = $merchantSettings['ulasan_baru'] ?? true;
                    if ($isAllowed) {
                        $productName = $orderItem->product?->name ?? 'Produk';
                        $ratingStars = str_repeat('⭐', (int) ($reviewData['rating'] ?? 5));
                        $title = "Ulasan Baru ({$ratingStars})";
                        $message = "Pelanggan memberikan ulasan pada {$productName}: \"" . Str::limit($reviewData['comment'] ?? '', 60) . "\"";
                        $storeOwner->notify(new PushNotification($title, $message, 'review', '/pedagang/products'));
                    }
                }
            } catch (\Throwable $e) {
                Log::warning('Review notification error: ' . $e->getMessage());
            }
        }

        return redirect()->route('history.index', ['status' => 'rating'])
            ->with('success', 'Penilaian berhasil disimpan!');
    }
}
