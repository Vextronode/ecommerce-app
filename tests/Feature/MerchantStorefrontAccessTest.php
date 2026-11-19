<?php

namespace Tests\Feature;

use App\Models\ChatRoom;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MerchantStorefrontAccessTest extends TestCase
{
    use RefreshDatabase;

    private function createMerchantWithStore(string $name = 'Pedagang Satu'): array
    {
        $merchant = User::factory()->create([
            'name' => $name,
            'role' => 'pedagang',
            'status' => 'active',
        ]);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko '.$name,
            'slug' => Str::slug('Toko '.$name.'-'.Str::random(6)),
            'sid_status' => 'verified',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => $name,
        ]);

        return [$merchant, $store];
    }

    private function createActiveProduct(Store $store, string $name = 'Produk Uji', float $price = 25000): Product
    {
        $category = \App\Models\Category::firstOrCreate(
            ['name' => 'Kategori Uji'],
            ['slug' => 'kategori-uji']
        );

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => $name,
            'slug' => Str::slug($name.'-'.Str::random(6)),
            'price' => $price,
            'stock' => 50,
            'is_active' => true,
        ]);
    }

    public function test_merchant_can_access_storefront_pages_without_being_redirected_to_merchant_dashboard(): void
    {
        [$merchant] = $this->createMerchantWithStore();

        $this->actingAs($merchant)
            ->get('/dashboard')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/shop')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/about')
            ->assertOk();
    }

    public function test_merchant_can_access_legal_pages_including_prohibited_products(): void
    {
        [$merchant] = $this->createMerchantWithStore();

        $this->actingAs($merchant)
            ->get('/kebijakan/produk-terlarang')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/kebijakan/syarat-ketentuan')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/kebijakan/perjanjian-mitra')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/kebijakan/refund')
            ->assertOk();
    }

    public function test_merchant_can_access_cart_history_and_buyer_profile(): void
    {
        [$merchant] = $this->createMerchantWithStore();

        $this->actingAs($merchant)
            ->get('/cart')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/history')
            ->assertOk();

        $this->actingAs($merchant)
            ->get('/profile')
            ->assertOk();
    }

    public function test_merchant_cannot_add_own_product_to_cart(): void
    {
        [$merchant, $store] = $this->createMerchantWithStore();
        $ownProduct = $this->createActiveProduct($store, 'Produk Toko Sendiri');

        $response = $this->actingAs($merchant)
            ->postJson('/cart', [
                'product_id' => $ownProduct->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['product_id']);
    }

    public function test_merchant_can_add_another_store_product_to_cart(): void
    {
        [$merchantA] = $this->createMerchantWithStore('Pedagang A');
        [, $storeB] = $this->createMerchantWithStore('Pedagang B');
        $productB = $this->createActiveProduct($storeB, 'Produk Toko B');

        $response = $this->actingAs($merchantA)
            ->post('/cart', [
                'product_id' => $productB->id,
                'quantity' => 2,
            ]);

        $response->assertRedirect();

        $this->assertDatabaseHas('carts', [
            'user_id' => $merchantA->id,
            'product_id' => $productB->id,
            'quantity' => 2,
        ]);
    }

    public function test_merchant_cannot_checkout_own_product(): void
    {
        [$merchant, $store] = $this->createMerchantWithStore();
        $ownProduct = $this->createActiveProduct($store, 'Produk Saya');

        $cart = \App\Models\Cart::create([
            'user_id' => $merchant->id,
            'product_id' => $ownProduct->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($merchant)
            ->get(route('checkout', ['items' => [$cart->id]]));

        $response->assertRedirect(route('cart'))
            ->assertSessionHas('error', 'Anda tidak dapat membeli produk dari toko Anda sendiri.');
    }

    public function test_merchant_cannot_review_own_store_product(): void
    {
        [$merchant, $store] = $this->createMerchantWithStore();
        $product = $this->createActiveProduct($store);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $merchant->id,
            'invoice_number' => 'INV-TEST-'.strtoupper(Str::random(8)),
            'customer_name' => $merchant->name,
            'customer_phone' => '08123456789',
            'shipping_address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'subtotal' => $product->price,
            'shipping_cost' => 0,
            'total_amount' => $product->price,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => $product->price,
            'quantity' => 1,
            'subtotal' => $product->price,
        ]);

        $this->actingAs($merchant)
            ->get(route('history.rating.create', ['order_item' => $orderItem->id]))
            ->assertRedirect(route('history.index', ['status' => 'rating']))
            ->assertSessionHas('error', 'Anda tidak dapat memberikan ulasan untuk toko milik Anda sendiri.');

        $this->actingAs($merchant)
            ->post(route('history.rating.store', ['order_item_id' => $orderItem->id]), [
                'rating' => 5,
                'comment' => 'Ulasan palsu',
            ])
            ->assertForbidden();
    }

    public function test_merchant_cannot_chat_or_negotiate_with_own_store(): void
    {
        [$merchant, $store] = $this->createMerchantWithStore();
        $product = $this->createActiveProduct($store);

        $responseChat = $this->actingAs($merchant)
            ->postJson(route('chat.room.create'), [
                'store_id' => $store->id,
            ]);

        $responseChat->assertStatus(422)
            ->assertJson(['message' => 'Anda tidak dapat mengirim pesan ke toko Anda sendiri.']);

        $room = ChatRoom::create([
            'user_id' => $merchant->id,
            'store_id' => $store->id,
        ]);

        $responseNegotiate = $this->actingAs($merchant)
            ->postJson(route('chat.negotiate', ['room' => $room->id]), [
                'product_id' => $product->id,
                'offered_price' => 20000,
                'quantity' => 1,
            ]);

        $responseNegotiate->assertStatus(422);
    }
}
