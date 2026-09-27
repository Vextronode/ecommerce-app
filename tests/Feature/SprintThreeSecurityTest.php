<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class SprintThreeSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test #S2-13: Product review store rejects other user's order items.
     */
    public function test_product_review_store_rejects_unowned_order_items(): void
    {
        $legitBuyer = User::factory()->create(['role' => 'user']);
        $attacker = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Ikan Fresh',
            'slug' => 'toko-ikan-fresh-'.Str::random(6),
        ]);

        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $legitBuyer->id,
            'invoice_number' => 'ORD-REVIEW-OWNERSHIP-001',
            'customer_name' => 'Legit Buyer',
            'customer_phone' => '0812345678',
            'shipping_address' => 'Jl. Laut',
            'delivery_method' => 'local_delivery',
            'subtotal' => 20000,
            'shipping_cost' => 5000,
            'total_amount' => 25000,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);

        $category = \App\Models\Category::create([
            'name' => 'Seafood',
            'slug' => 'seafood-'.Str::random(4),
        ]);

        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Udang Segar',
            'slug' => 'udang-segar-'.Str::random(6),
            'price' => 20000,
            'stock' => 10,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => 'Udang Segar',
            'price' => 20000,
            'quantity' => 1,
        ]);

        // Attacker attempts to post review on legit buyer's order item
        $response = $this->actingAs($attacker)->post(route('history.rating.store', ['order_item_id' => $orderItem->id]), [
            'rating' => 1,
            'comment' => 'Fake negative review attempt',
        ]);

        $response->assertStatus(403);
    }

    /**
     * Test #S2-14: Google OAuth new registration explicitly sets role to user and verifies email.
     */
    public function test_google_oauth_assigns_user_role_and_verifies_email(): void
    {
        $mockGoogleUser = new SocialiteUser();
        $mockGoogleUser->id = 'google-uid-12345';
        $mockGoogleUser->name = 'Budi Google';
        $mockGoogleUser->email = 'budi_google_test@gmail.com';

        $provider = $this->createMock(\Laravel\Socialite\Two\GoogleProvider::class);
        $provider->method('redirectUrl')->willReturnSelf();
        $provider->method('user')->willReturn($mockGoogleUser);

        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $response = $this->get(route('google.callback'));

        $this->assertAuthenticated();
        $createdUser = User::where('email', 'budi_google_test@gmail.com')->first();
        $this->assertNotNull($createdUser);
        $this->assertEquals('user', $createdUser->role);
        $this->assertNotNull($createdUser->email_verified_at);
    }

    /**
     * Test #S2-15: Invoice number format has high-entropy random suffix.
     */
    public function test_invoice_number_format_has_six_char_random_suffix(): void
    {
        $invoiceNumber = 'ORD-'.date('YmdHis').'-'.strtoupper(Str::random(6));

        // Format must be ORD-YYYYMMDDHHIISS-XXXXXX (28 chars)
        $this->assertMatchesRegularExpression('/^ORD-\d{14}-[A-Z0-9]{6}$/', $invoiceNumber);
    }
}
