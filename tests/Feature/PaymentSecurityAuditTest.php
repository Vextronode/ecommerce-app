<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\Cart;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductSku;
use App\Models\ProductVariant;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\MidtransIrisService;
use App\Services\MidtransService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PaymentSecurityAuditTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test Vuln 1: Withdrawal Concurrency & Balance Lock
     */
    public function test_withdrawal_prevents_withdrawing_more_than_available_balance(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Nelayan',
            'slug' => 'toko-nelayan-' . Str::random(6),
            'balance' => 50000,
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Nelayan Jaya',
        ]);

        // Mock Iris service
        $mockIris = $this->createMock(MidtransIrisService::class);
        $mockIris->method('createPayout')->willReturn(['status' => 'queued']);
        $this->app->instance(MidtransIrisService::class, $mockIris);

        // Attempting to withdraw more than available balance should fail
        $response = $this->actingAs($merchant)->post(route('merchant.withdrawals.store'), [
            'amount' => 100000, // Balance is only 50000
        ]);

        $response->assertSessionHasErrors('amount');
        $this->assertEquals(50000, $store->fresh()->balance);
        $this->assertDatabaseCount('withdrawals', 0);
    }

    /**
     * Test Vuln 2: Double Balance Crediting Prevention (Idempotency)
     */
    public function test_order_completion_credits_store_balance_only_once(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Segar',
            'slug' => 'toko-segar-' . Str::random(6),
            'balance' => 0,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-TEST-001',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 100000,
            'shipping_cost' => 15000,
            'total_amount' => 117000, // 100k + 15k ongkir + 2k admin fee
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
            'payment_status' => 'pending',
            'shipping_status' => 'shipped',
        ]);

        // First completion credits subtotal (Rp 100.000)
        $creditedFirst = $order->creditStoreBalance();
        $this->assertTrue($creditedFirst);
        $this->assertEquals(100000, $store->fresh()->balance);
        $this->assertNotNull($order->fresh()->balance_credited_at);

        // Second attempt to credit MUST return false and NOT increase balance again
        $creditedSecond = $order->creditStoreBalance();
        $this->assertFalse($creditedSecond);
        $this->assertEquals(100000, $store->fresh()->balance); // Balance remains 100000, not 200000!
    }

    /**
     * Test Vuln 3: Stock Multi-Restoration Exploit Prevention
     */
    public function test_order_stock_restoration_is_idempotent(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan',
            'slug' => 'toko-ikan-' . Str::random(6),
        ]);
        $category = Category::create([
            'name' => 'Ikan Laut',
            'slug' => 'ikan-laut-' . Str::random(6),
        ]);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Ikan Cakalang',
            'slug' => 'ikan-cakalang-' . Str::random(6),
            'price' => 50000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-TEST-002',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 100000,
            'shipping_cost' => 15000,
            'total_amount' => 117000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 50000,
            'quantity' => 2,
        ]);

        // First restore stock (stock goes from 10 to 12)
        $restoredFirst = $order->restoreStock();
        $this->assertTrue($restoredFirst);
        $this->assertEquals(12, $product->fresh()->stock);

        // Second restore stock must NOT increment stock again (must remain 12, not 14)
        $restoredSecond = $order->restoreStock();
        $this->assertFalse($restoredSecond);
        $this->assertEquals(12, $product->fresh()->stock);
    }

    /**
     * Test Vuln 4: Webhook Gross Amount Mismatch Rejection
     */
    public function test_midtrans_webhook_rejects_gross_amount_mismatch(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Udang',
            'slug' => 'toko-udang-' . Str::random(6),
        ]);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-EXPENSIVE-123',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 500000,
            'shipping_cost' => 15000,
            'total_amount' => 517000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        // Mock MidtransService to accept signature
        $mockMidtrans = $this->createMock(MidtransService::class);
        $mockMidtrans->method('verifySignatureKey')->willReturn(true);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        // Attacker sends webhook notification with tampered gross amount (1000 instead of 517000)
        $response = $this->postJson(route('midtrans.callback'), [
            'order_id' => 'ORD-EXPENSIVE-123',
            'status_code' => '200',
            'gross_amount' => '1000.00', // Tampered low amount!
            'transaction_status' => 'settlement',
            'signature_key' => 'valid-mock-signature',
        ]);

        $response->assertStatus(400);
        $response->assertJson(['message' => 'Gross amount mismatch']);
        $this->assertEquals('pending', $order->fresh()->payment_status);
    }

    /**
     * Test Vuln 5: Multi-Store Order Sibling Synchronization
     */
    public function test_multi_store_sibling_orders_sync_to_paid(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $store1 = Store::create([
            'user_id' => User::factory()->create(['role' => 'pedagang'])->id,
            'name' => 'Store 1',
            'slug' => 'store-1-' . Str::random(6),
        ]);
        $store2 = Store::create([
            'user_id' => User::factory()->create(['role' => 'pedagang'])->id,
            'name' => 'Store 2',
            'slug' => 'store-2-' . Str::random(6),
        ]);

        $parentTrxId = 'TRX-MULTI-STORE-999';

        $order1 = Order::create([
            'store_id' => $store1->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-S1-001',
            'parent_transaction_id' => $parentTrxId,
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 50000,
            'shipping_cost' => 15000,
            'total_amount' => 67000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        $order2 = Order::create([
            'store_id' => $store2->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-S2-002',
            'parent_transaction_id' => $parentTrxId,
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 80000,
            'shipping_cost' => 15000,
            'total_amount' => 97000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
        ]);

        $mockMidtrans = $this->createMock(MidtransService::class);
        $mockMidtrans->method('verifySignatureKey')->willReturn(true);
        $this->app->instance(MidtransService::class, $mockMidtrans);

        // Webhook arrives for parent transaction with total combined gross amount (67000 + 97000 = 164000)
        $response = $this->postJson(route('midtrans.callback'), [
            'order_id' => $parentTrxId,
            'status_code' => '200',
            'gross_amount' => '164000.00',
            'transaction_status' => 'settlement',
            'signature_key' => 'valid-mock-signature',
        ]);

        $response->assertStatus(200);
        $this->assertEquals('paid', $order1->fresh()->payment_status);
        $this->assertEquals('paid', $order2->fresh()->payment_status);
    }

    /**
     * Test Vuln 7: Buyer Cannot Cancel Processing or Paid Orders
     */
    public function test_buyer_cannot_cancel_processing_or_paid_order(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $store = Store::create([
            'user_id' => User::factory()->create(['role' => 'pedagang'])->id,
            'name' => 'Store Nelayan',
            'slug' => 'store-nelayan-' . Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PROCESSING-001',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 50000,
            'shipping_cost' => 15000,
            'total_amount' => 67000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid',
            'shipping_status' => 'processing', // Seller already packing!
        ]);

        $response = $this->actingAs($buyer)->post(route('history.cancel', ['order' => $order->id]));

        $response->assertSessionHas('error');
        $this->assertEquals('processing', $order->fresh()->shipping_status);
        $this->assertEquals('paid', $order->fresh()->payment_status);
    }

    /**
     * Test Vuln 8: Merchant cannot mark unpaid non-COD order as delivered or generate fake balance
     */
    public function test_merchant_cannot_deliver_unpaid_non_cod_order(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Nelayan Jujur',
            'slug' => 'toko-nelayan-jujur',
            'balance' => 0,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-UNPAID-VA-999',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 10000000, // Rp 10.000.000 fake order
            'shipping_cost' => 15000,
            'total_amount' => 10017000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending', // NOT PAID YET!
            'shipping_status' => 'pending',
        ]);

        // Attempt to move status directly to delivered while unpaid
        $response = $this->actingAs($merchant)->put(route('merchant.orders.update-status', ['id' => $order->id]), [
            'shipping_status' => 'delivered',
        ]);

        $response->assertSessionHas('error');
        $this->assertEquals('pending', $order->fresh()->shipping_status);
        $this->assertEquals('pending', $order->fresh()->payment_status);
        $this->assertEquals(0, $store->fresh()->balance); // Balance remains 0!
    }

    /**
     * Test Vuln 9: Product creation rejects negative SKU price & stock
     */
    public function test_product_creation_rejects_negative_sku_price_and_stock(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan Hias',
            'slug' => 'toko-ikan-hias',
        ]);
        $category = Category::create([
            'name' => 'Ikan Hias',
            'slug' => 'ikan-hias',
        ]);

        $response = $this->actingAs($merchant)->post(route('merchant.products.store'), [
            'name' => 'Cupang Giant',
            'category_id' => $category->id,
            'skus' => [
                [
                    'variant_name' => 'Blue Rim',
                    'price' => -50000, // Negative price exploit!
                    'stock' => -10,   // Negative stock!
                ]
            ]
        ]);

        $response->assertSessionHasErrors(['skus.0.price', 'skus.0.stock']);
        $this->assertDatabaseCount('products', 0);
    }

    /**
     * Test Vuln 10: Merchant settings rejects SVG upload to prevent Stored XSS
     */
    public function test_merchant_settings_rejects_svg_upload(): void
    {
        Storage::fake('public');

        $merchant = User::factory()->create(['role' => 'pedagang', 'is_password_changed' => true]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Kerajinan',
            'slug' => 'toko-kerajinan',
        ]);

        $svgFile = UploadedFile::fake()->createWithContent('avatar.svg', '<svg onload="alert(1)"></svg>');

        $response = $this->actingAs($merchant)->post(route('merchant.settings.update'), [
            'name' => 'Merchant Test',
            'email' => $merchant->email,
            'store_name' => 'Toko Kerajinan Baru',
            'photo' => $svgFile,
        ]);

        $response->assertSessionHasErrors('photo');
    }

    /**
     * Test Vuln 11: Buyer cannot review undelivered orders
     */
    public function test_buyer_cannot_review_undelivered_order(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Seafood',
            'slug' => 'toko-seafood',
        ]);
        $category = Category::create(['name' => 'Seafood', 'slug' => 'seafood']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Kepiting Bakau',
            'slug' => 'kepiting-bakau',
            'price' => 100000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-PENDING-REVIEW',
            'customer_name' => 'Buyer',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 100000,
            'shipping_cost' => 15000,
            'total_amount' => 117000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'pending',
            'shipping_status' => 'pending', // NOT DELIVERED!
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'price' => 100000,
            'quantity' => 1,
        ]);

        $response = $this->actingAs($buyer)->post(route('history.rating.store', ['order_item_id' => $orderItem->id]), [
            'rating' => 5,
            'comment' => 'Bagus banget padahal belum bayar & belum nyampe!',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseCount('product_reviews', 0);
    }

    /**
     * Test Vuln 12: Cart enforces variant/SKU stock limit
     */
    public function test_cart_respects_variant_sku_stock_limits(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Kaos Pantai',
            'slug' => 'toko-kaos-pantai',
        ]);
        $category = Category::create(['name' => 'Pakaian', 'slug' => 'pakaian']);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Kaos Pangandaran',
            'slug' => 'kaos-pangandaran',
            'price' => 50000,
            'stock' => 100, // Master stock is 100
            'is_active' => true,
        ]);

        ProductSku::create([
            'product_id' => $product->id,
            'variant_name' => 'Ukuran XL',
            'price' => 55000,
            'stock' => 2, // Variant stock is ONLY 2!
        ]);

        // Attempt to add 5 units of 'Ukuran XL' to cart (should fail because SKU stock is only 2)
        $response = $this->actingAs($buyer)->post(route('cart.store'), [
            'product_id' => $product->id,
            'preparation_option' => 'Ukuran XL',
            'quantity' => 5,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseCount('carts', 0);
    }

    /**
     * Test Vuln 13: Merchant setup store route works without 500 class not found error
     */
    public function test_merchant_setup_store_route_works(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
            'is_password_changed' => false,
        ]);

        $response = $this->actingAs($merchant)->post(route('merchant.store.store'), [
            'store_name' => 'Toko Nelayan Baru',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);

        $response->assertRedirect(route('merchant.dashboard'));
        $this->assertDatabaseHas('stores', [
            'user_id' => $merchant->id,
            'name' => 'Toko Nelayan Baru',
        ]);
        $this->assertTrue($merchant->fresh()->is_password_changed);
    }

    /**
     * Test State Machine: Late expire webhook cannot cancel an already paid order
     */
    public function test_late_expire_webhook_does_not_cancel_already_paid_order(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Aman',
            'slug' => 'toko-aman-' . Str::random(6),
        ]);
        $buyer = User::factory()->create(['role' => 'user']);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-ALREADY-PAID',
            'customer_name' => 'John Doe',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'standard',
            'subtotal' => 100000,
            'shipping_cost' => 10000,
            'total_amount' => 110000,
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => 'paid', // Order is ALREADY PAID
            'shipping_status' => 'processing',
        ]);

        $serverKey = config('services.midtrans.server_key', 'dummy_server_key');
        $rawSignature = 'ORD-ALREADY-PAID200110000.00' . $serverKey;
        $signatureKey = hash('sha512', $rawSignature);

        // Send a late 'expire' notification
        $response = $this->postJson(route('midtrans.callback'), [
            'order_id' => 'ORD-ALREADY-PAID',
            'status_code' => '200',
            'gross_amount' => '110000.00',
            'transaction_status' => 'expire',
            'signature_key' => $signatureKey,
        ]);

        $response->assertStatus(200);
        // Order MUST remain 'paid', not degraded to 'failed'
        $this->assertEquals('paid', $order->fresh()->payment_status);
    }

    /**
     * Test Stock Synchronization: Both SKU and master product stocks remain strictly synced
     */
    public function test_sku_and_parent_stock_remain_strictly_synchronized(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Seafood',
            'slug' => 'toko-seafood-' . Str::random(6),
        ]);
        $category = Category::create([
            'name' => 'Udang',
            'slug' => 'udang-' . Str::random(6),
        ]);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Udang Vaname',
            'slug' => 'udang-vaname-' . Str::random(6),
            'price' => 70000,
            'stock' => 10,
            'is_active' => true,
        ]);

        $sku = ProductSku::create([
            'product_id' => $product->id,
            'variant_name' => 'Grade A',
            'price' => 70000,
            'stock' => 10,
        ]);

        $buyer = User::factory()->create(['role' => 'user']);
        $cart = Cart::create([
            'user_id' => $buyer->id,
            'product_id' => $product->id,
            'preparation_option' => 'Grade A',
            'quantity' => 3,
        ]);

        // Checkout
        $response = $this->actingAs($buyer)->post(route('checkout.store'), [
            'cart_ids' => [$cart->id],
            'name' => 'Budi',
            'phone' => '08123456789',
            'address' => 'Jl. Pantai No. 5',
            'delivery_method' => 'standard',
            'payment_method' => 'cod',
            'payment_channel' => 'cod',
        ]);

        $response->assertRedirect();
        $this->assertEquals(7, $sku->fresh()->stock);
        $this->assertEquals(7, $product->fresh()->stock);

        // Cancel order -> both stocks must restore back to 10
        $order = Order::where('user_id', $buyer->id)->first();
        $this->actingAs($buyer)->post(route('history.cancel', $order->id));

        $this->assertEquals(10, $sku->fresh()->stock);
        $this->assertEquals(10, $product->fresh()->stock);
    }
}
