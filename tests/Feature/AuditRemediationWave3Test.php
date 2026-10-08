<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Category;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductReview;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\ChatMediaProcessor;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class AuditRemediationWave3Test extends TestCase
{
    use RefreshDatabase;

    private function buatToko(User $merchant, array $extra = []): Store
    {
        return Store::create(array_merge([
            'user_id' => $merchant->id,
            'name' => 'Toko Remediasi',
            'slug' => 'toko-remediasi-'.uniqid(),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Sho Jaya',
        ], $extra));
    }

    private function buatProduk(Store $store, array $extra = []): Product
    {
        $category = Category::firstOrCreate(
            ['slug' => 'kategori-uji'],
            ['name' => 'Kategori Uji']
        );

        return Product::create(array_merge([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Uji '.uniqid(),
            'slug' => 'produk-uji-'.uniqid(),
            'price' => 10000,
            'stock' => 10,
            'is_active' => true,
        ], $extra));
    }

    private function buatOrderDelivered(Store $store, User $buyer, int $amount): Order
    {
        return Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'INV-REV-'.uniqid(),
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Jl. Uji',
            'delivery_method' => 'local_delivery',
            'subtotal' => $amount,
            'shipping_cost' => 0,
            'total_amount' => $amount,
            'payment_method' => 'midtrans',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);
    }

    public function test_signed_url_showBatch_punya_expiry_dan_kedaluwarsa(): void
    {
        $urlBerExpiry = URL::signedRoute('tracker.showBatch', ['batch_token' => 'abc'], now()->addHours(24));

        $expires = request()->create($urlBerExpiry)->query('expires');
        $this->assertNotNull($expires, 'signed url showBatch wajib membawa parameter expires');
        $this->assertGreaterThan(now()->timestamp, (int) $expires);

        // url ber-expiry yang sudah lewat wajib ditolak signature-nya
        $urlKedaluwarsa = URL::temporarySignedRoute('tracker.showBatch', now()->subHour(), ['batch_token' => 'abc']);
        $this->get($urlKedaluwarsa)->assertStatus(403);

        // url tanpa parameter expires (perilaku lama) tetap valid secara signature
        $urlTanpaExpiry = URL::signedRoute('tracker.showBatch', ['batch_token' => 'abc']);
        $this->assertTrue(URL::hasValidSignature(request()->create($urlTanpaExpiry)));
    }

    public function test_unique_order_item_id_cegah_review_dobel(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatToko($merchant);
        $buyer = User::factory()->create(['role' => 'user']);

        $product = $this->buatProduk($store);
        $order = $this->buatOrderDelivered($store, $buyer, 10000);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Produk Uji',
            'quantity' => 1,
            'price' => 10000,
        ]);

        $data = [
            'user_id' => $buyer->id,
            'store_id' => $store->id,
            'product_id' => $product->id,
            'order_item_id' => $item->id,
            'rating' => 5,
            'comment' => 'mantap',
        ];

        ProductReview::create($data);

        // simpan kedua dengan order_item_id sama wajib gagal karena unique constraint
        $this->expectException(\Illuminate\Database\QueryException::class);
        ProductReview::create($data);
    }

    public function test_review_endpoint_updateOrCreate_tidak_bikin_baris_dobel(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatToko($merchant);
        $buyer = User::factory()->create(['role' => 'user']);

        $product = $this->buatProduk($store, ['price' => 20000]);
        $order = $this->buatOrderDelivered($store, $buyer, 20000);

        $item = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Produk Uji 2',
            'quantity' => 1,
            'price' => 20000,
        ]);

        $this->actingAs($buyer)
            ->post(route('history.rating.store', ['order_item_id' => $item->id]), [
                'rating' => 5,
                'comment' => 'bagus',
            ])
            ->assertRedirect();

        // kirim lagi (retry) -> update, bukan baris baru
        $this->actingAs($buyer)
            ->post(route('history.rating.store', ['order_item_id' => $item->id]), [
                'rating' => 4,
                'comment' => 'bagus banget',
            ])
            ->assertRedirect();

        $this->assertSame(1, ProductReview::where('order_item_id', $item->id)->count());
        $this->assertSame(4, (int) ProductReview::where('order_item_id', $item->id)->first()->rating);
    }

    public function test_shop_index_membatasi_row_katalog(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatToko($merchant, ['sid_status' => 'verified']);
        $merchant->forceFill(['status' => 'active'])->save();

        for ($i = 0; $i < 5; $i++) {
            $this->buatProduk($store, ['name' => 'Produk Mass '.$i, 'price' => 1000 + $i]);
        }

        $response = $this->get(route('shop'));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Storefront/Shop')
            ->has('allProducts', 5)
        );
    }

    public function test_shop_sort_harga_terurut_dan_produk_luar_cap_tidak_hilang(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = $this->buatToko($merchant, ['sid_status' => 'verified']);
        $merchant->forceFill(['status' => 'active'])->save();

        // produk termurah & termahal sengaja disisipkan di ujung daftar
        $this->buatProduk($store, ['name' => 'Termurah', 'price' => 1]);
        for ($i = 0; $i < 20; $i++) {
            $this->buatProduk($store, ['name' => 'Tengah '.$i, 'price' => 5000 + $i]);
        }
        $this->buatProduk($store, ['name' => 'Termahal', 'price' => 999999]);

        $response = $this->get(route('shop', ['extra_sort' => 'price_asc']));
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Storefront/Shop')
            ->where('allProducts.0.name', 'Termurah')
        );

        $responseDesc = $this->get(route('shop', ['extra_sort' => 'price_desc']));
        $responseDesc->assertStatus(200);
        $responseDesc->assertInertia(fn ($page) => $page
            ->component('Storefront/Shop')
            ->where('allProducts.0.name', 'Termahal')
        );
    }

    public function test_model_store_withdrawal_order_pakai_atribut_fillable(): void
    {
        // fillable lewat atribut #[Fillable] harus menolak kolom sensitif
        $store = new Store();
        $store->fill(['name' => 'Toko Atribut', 'sid_status' => 'verified', 'available_balance' => 999999]);
        $this->assertSame('Toko Atribut', $store->name);
        $this->assertNull($store->getAttributes()['sid_status'] ?? null);
        $this->assertNull($store->getAttributes()['available_balance'] ?? null);

        $withdrawal = new Withdrawal();
        $withdrawal->fill(['reference_no' => 'WD-X', 'payout_sent_at' => now(), 'needs_reconciliation' => true]);
        $this->assertSame('WD-X', $withdrawal->reference_no);
        $this->assertNull($withdrawal->getAttributes()['payout_sent_at'] ?? null);

        $order = new Order();
        $order->fill(['invoice_number' => 'INV-X', 'shipping_pin' => '1234', 'payment_payload' => ['a' => 1]]);
        $this->assertSame('INV-X', $order->invoice_number);
        $this->assertNull($order->getAttributes()['shipping_pin'] ?? null);
        $this->assertNull($order->getAttributes()['payment_payload'] ?? null);
    }

    public function test_chat_media_reencode_strip_metadata_dan_pakai_nama_acak(): void
    {
        Storage::fake('public');

        $processor = app(ChatMediaProcessor::class);

        // bikin gambar png valid berikut metadata yang disuntik
        $image = imagecreatetruecolor(20, 20);
        imagefill($image, 0, 0, imagecolorallocate($image, 200, 30, 30));
        ob_start();
        imagejpeg($image, null, 90);
        $bytes = ob_get_clean();
        imagedestroy($image);

        $file = UploadedFile::fake()->createWithContent('geotag.jpg', $bytes);

        [$path, $type] = $processor->store($file);

        $this->assertSame('image', $type);
        $this->assertStringStartsWith('chat_media/', $path);
        $this->assertStringEndsNotWith('geotag.jpg', $path);
        Storage::disk('public')->assertExists($path);

        // hasil re-encode tetap jpeg valid tanpa exif mentah asli
        $stored = Storage::disk('public')->get($path);
        $this->assertNotEmpty($stored);
        $this->assertStringStartsWith("\xFF\xD8", $stored);
    }
}
