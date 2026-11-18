<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\PlatformSetting;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        PlatformSetting::set('enable_service_fee', true);
        PlatformSetting::set('service_fee_amount', 2000);
        PlatformSetting::set('enable_tax', false);
        PlatformSetting::set('tax_percentage', 0);
        PlatformSetting::set('enable_online_payment', true);
        PlatformSetting::set('enable_local_delivery', true);

        $mockMidtrans = $this->createMock(MidtransService::class);
        $mockMidtrans->method('chargeCoreApi')->willReturn([
            'status_code' => '201',
            'transaction_status' => 'pending',
            'payment_type' => 'bank_transfer',
            'payment_channel' => 'bca_va',
            'order_id' => 'TRX-TEST-001',
            'transaction_id' => 'trx-123456',
            'va_number' => '12345678901',
            'bill_key' => null,
            'biller_code' => null,
            'qr_code_url' => null,
            'deeplink_url' => null,
            'expiry_time' => now()->addHours(24),
            'raw_payload' => [],
        ]);
        $this->app->instance(MidtransService::class, $mockMidtrans);
    }

    public function test_user_cannot_checkout_another_users_cart(): void
    {
        [$attacker, $victimCart] = $this->makeCartForAnotherUser();

        $response = $this->actingAs($attacker)->post(route('checkout.store'), [
            'cart_ids' => [$victimCart->id],
            'name' => 'Attacker',
            'phone' => '08123456789',
            'address' => 'Jl. Uji',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
        ]);

        $response->assertSessionHasErrors('cart_ids');
        $this->assertDatabaseHas('carts', ['id' => $victimCart->id]);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_ignores_client_supplied_total_amount(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 10000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Pembeli',
            'phone' => '08123456789',
            'address' => 'Jl. Aman',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'total_amount' => 1,
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $this->assertNotNull($order);
        $response->assertRedirect(route('payment.show', ['order' => $order->id]));
        // total dihitung server: 2 x 10000 + admin fee 2000, self_pickup gratis ongkir
        $this->assertEquals(22000, (int) $order->total_amount);
    }

    public function test_checkout_rejects_quantity_above_stock(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 10000, stock: 1);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Pembeli',
            'phone' => '08123456789',
            'address' => 'Jl. Aman',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
        ]);

        $response->assertSessionHasErrors('cart_ids');
        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'stock' => 1,
        ]);
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_can_use_authenticated_users_saved_address(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Rumah',
            'is_primary' => true,
            'recipient_name' => 'Pembeli Aman',
            'phone' => '+6281234567890',
            'full_address' => 'Jl. Aman No. 1, Pangandaran',
            'latitude' => -7.6800,
            'longitude' => 108.6500,
        ]);
        $product = $this->makeProduct(price: 10000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'address_id' => $address->id,
            'delivery_method' => 'local_delivery',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
        ]);

        $order = Order::where('user_id', $user->id)->first();
        $this->assertNotNull($order);
        $response->assertRedirect(route('payment.show', ['order' => $order->id]));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'customer_name' => 'Pembeli Aman',
            'customer_phone' => '+6281234567890',
            'shipping_address' => 'Jl. Aman No. 1, Pangandaran',
        ]);
    }

    public function test_checkout_rejects_another_users_saved_address(): void
    {
        $attacker = User::factory()->create(['role' => 'user']);
        $victim = User::factory()->create(['role' => 'user']);
        $victimAddress = Address::create([
            'user_id' => $victim->id,
            'label' => 'Rumah',
            'is_primary' => true,
            'recipient_name' => 'Korban',
            'phone' => '+6281111111111',
            'full_address' => 'Alamat Rahasia Korban',
            'latitude' => -7.6800,
            'longitude' => 108.6500,
        ]);
        $product = $this->makeProduct(price: 10000, stock: 5);
        $cart = Cart::create([
            'user_id' => $attacker->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($attacker)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'address_id' => $victimAddress->id,
            'delivery_method' => 'local_delivery',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
        ]);

        $response->assertNotFound();
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_cart_rejects_quantity_above_stock(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 10000, stock: 1);

        $response = $this->actingAs($user)->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseCount('carts', 0);
    }

    public function test_checkout_rejects_online_payment_when_killswitch_is_off(): void
    {
        PlatformSetting::set('enable_online_payment', false);

        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 15000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Pembeli',
            'phone' => '08123456789',
            'address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
        ]);

        $response->assertSessionHasErrors('payment_method');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_checkout_allows_cod_when_online_payment_killswitch_is_off(): void
    {
        PlatformSetting::set('enable_online_payment', false);

        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 15000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Pembeli',
            'phone' => '08123456789',
            'address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
        ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseCount('orders', 1);

        $order = Order::first();
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals('cod', $order->payment_channel);
    }

    public function test_checkout_with_dynamic_tax_and_service_fee(): void
    {
        PlatformSetting::set('enable_tax', true);
        PlatformSetting::set('tax_percentage', 10);
        PlatformSetting::set('enable_service_fee', true);
        PlatformSetting::set('service_fee_amount', 3000);

        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 20000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 2,
            'preparation_option' => '',
        ]);

        // Subtotal = 2 * 20000 = 40000
        // Service fee = 3000
        // Tax (10%) = 4000
        // Delivery (self_pickup) = 0
        // Total = 40000 + 0 + 3000 + 4000 = 47000
        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Pembeli',
            'phone' => '08123456789',
            'address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
        ]);

        $response->assertSessionHasNoErrors();
        $order = Order::first();
        $this->assertEquals(40000, (int) $order->subtotal);
        $this->assertEquals(3000, (int) $order->service_fee);
        $this->assertEquals(4000, (int) $order->tax_amount);
        $this->assertEquals(47000, (int) $order->total_amount);
    }

    public function test_checkout_rejects_local_delivery_when_killswitch_is_off(): void
    {
        PlatformSetting::set('enable_local_delivery', false);

        $user = User::factory()->create(['role' => 'user']);
        $address = Address::create([
            'user_id' => $user->id,
            'label' => 'Rumah',
            'recipient_name' => 'Budi',
            'phone' => '08123456789',
            'full_address' => 'Jl. Pantai',
            'latitude' => -7.701,
            'longitude' => 108.491,
            'is_primary' => true,
        ]);
        $product = $this->makeProduct(price: 15000, stock: 5);
        $cart = Cart::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        $response = $this->actingAs($user)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'address_id' => $address->id,
            'delivery_method' => 'local_delivery',
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
        ]);

        $response->assertSessionHasErrors('delivery_method');
        $this->assertDatabaseCount('orders', 0);
    }

    public function test_user_can_switch_pending_online_order_to_cod(): void
    {
        $user = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 20000, stock: 5);
        $order = Order::create([
            'store_id' => $product->store_id,
            'user_id' => $user->id,
            'invoice_number' => 'ORD-TEST-SWITCH-01',
            'customer_name' => 'Pembeli',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'subtotal' => 20000,
            'shipping_cost' => 0,
            'service_fee' => 0,
            'tax_amount' => 0,
            'total_amount' => 20000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        $response = $this->actingAs($user)->post(route('payment.switch-to-cod', ['order' => $order->id]));

        $response->assertRedirect(route('checkout.success', ['order_id' => $order->id]));
        $order->refresh();
        $this->assertEquals('cod', $order->payment_method);
        $this->assertEquals('cod', $order->payment_channel);
    }

    public function test_cannot_switch_other_users_order_to_cod(): void
    {
        $owner = User::factory()->create(['role' => 'user']);
        $stranger = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 20000, stock: 5);
        $order = Order::create([
            'store_id' => $product->store_id,
            'user_id' => $owner->id,
            'invoice_number' => 'ORD-TEST-SWITCH-02',
            'customer_name' => 'Pemilik',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Jl. Cibenda',
            'delivery_method' => 'self_pickup',
            'subtotal' => 20000,
            'shipping_cost' => 0,
            'service_fee' => 0,
            'tax_amount' => 0,
            'total_amount' => 20000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        $response = $this->actingAs($stranger)->post(route('payment.switch-to-cod', ['order' => $order->id]));
        $response->assertNotFound();
    }

    private function makeCartForAnotherUser(): array
    {
        $attacker = User::factory()->create(['role' => 'user']);
        $victim = User::factory()->create(['role' => 'user']);
        $product = $this->makeProduct(price: 10000, stock: 5);
        $cart = Cart::create([
            'user_id' => $victim->id,
            'product_id' => $product->id,
            'quantity' => 1,
            'preparation_option' => '',
        ]);

        return [$attacker, $cart];
    }

    private function makeProduct(int $price, int $stock): Product
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Test '.Str::random(6),
            'slug' => 'toko-test-'.Str::random(10),
        ]);
        $category = Category::create([
            'name' => 'Kategori Test '.Str::random(6),
            'slug' => 'kategori-test-'.Str::random(10),
        ]);

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Test '.Str::random(6),
            'slug' => 'produk-test-'.Str::random(10),
            'price' => $price,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }
}
