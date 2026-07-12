<?php

namespace Tests\Feature;

use App\Models\Cart;
use App\Models\Address;
use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class CheckoutSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_cannot_checkout_another_users_cart(): void
    {
        [$attacker, $victimCart] = $this->makeCartForAnotherUser();

        $response = $this->actingAs($attacker)->post(route('checkout.store'), [
            'cart_ids' => [$victimCart->id],
            'name' => 'Attacker',
            'phone' => '08123456789',
            'address' => 'Jl. Uji',
            'delivery_method' => 'coastal',
            'payment_method' => 'card',
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
            'delivery_method' => 'standard',
            'payment_method' => 'va',
            'total_amount' => 1,
        ]);

        $response->assertRedirect(route('shop'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'total_amount' => 37000,
        ]);
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
            'delivery_method' => 'standard',
            'payment_method' => 'va',
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
            'delivery_method' => 'standard',
            'payment_method' => 'va',
        ]);

        $response->assertRedirect(route('shop'));
        $this->assertDatabaseHas('orders', [
            'user_id' => $user->id,
            'shipping_name' => 'Pembeli Aman',
            'shipping_phone' => '+6281234567890',
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
            'delivery_method' => 'standard',
            'payment_method' => 'va',
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
            'name' => 'Toko Test ' . Str::random(6),
            'slug' => 'toko-test-' . Str::random(10),
        ]);
        $category = Category::create([
            'name' => 'Kategori Test ' . Str::random(6),
            'slug' => 'kategori-test-' . Str::random(10),
        ]);

        return Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Produk Test ' . Str::random(6),
            'slug' => 'produk-test-' . Str::random(10),
            'price' => $price,
            'stock' => $stock,
            'is_active' => true,
        ]);
    }
}
