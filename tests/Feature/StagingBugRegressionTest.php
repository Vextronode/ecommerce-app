<?php

namespace Tests\Feature;

use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PlatformSetting;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Tests\TestCase;

class StagingBugRegressionTest extends TestCase
{
    use RefreshDatabase;

    private function inertiaHeaders(): array
    {
        return [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => (string) app(HandleInertiaRequests::class)->version(request()),
            'X-Requested-With' => 'XMLHttpRequest',
        ];
    }

    public function test_inertia_navigation_updates_previous_url_and_fetch_does_not_pollute_back_redirect(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Test',
            'slug' => 'toko-test-'.Str::random(5),
        ]);
        $store->forceFill(['sid_status' => 'verified'])->save();

        // 1. Simulasi buka halaman profil via Inertia GET (tanpa Referer, seperti di proxy no-referrer)
        $this->actingAs($buyer)
            ->get('/profile', $this->inertiaHeaders())
            ->assertOk();

        // 2. Simulasi background fetch calculate-fee dengan X-Requested-With: XMLHttpRequest
        $this->actingAs($buyer)
            ->get('/checkout/calculate-fee?delivery_method=local_delivery', [
                'Accept' => 'application/json',
                'X-Requested-With' => 'XMLHttpRequest',
            ])
            ->assertOk();

        // 3. Submit tambah alamat TANPA header Referer -> harus kembali ke /profile, BUKAN /checkout/calculate-fee atau /
        $response = $this->actingAs($buyer)
            ->post('/profile/address', [
                'recipient_name' => 'Budi Santoso',
                'phone' => '81234567890',
                'full_address' => 'Jl. Pantai Barat No. 10, Pangandaran',
                'label' => 'Rumah',
                'is_primary' => true,
                'latitude' => -7.6876,
                'longitude' => 108.6506,
            ], $this->inertiaHeaders());

        $response->assertRedirect(url('/profile'));
    }

    public function test_destroy_address_is_idempotent_and_does_not_404_on_double_delete(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $address = $buyer->addresses()->create([
            'recipient_name' => 'Siti',
            'phone' => '081234567890',
            'full_address' => 'Cibenda',
            'label' => 'Rumah',
            'is_primary' => false,
            'latitude' => -7.6876,
            'longitude' => 108.6506,
        ]);

        // Hapus pertama
        $this->actingAs($buyer)
            ->from('/profile')
            ->delete("/profile/address/{$address->id}")
            ->assertRedirect('/profile');

        $this->assertDatabaseMissing($address->getTable(), ['id' => $address->id]);

        // Hapus kedua (double-tap) -> tidak boleh 404
        $this->actingAs($buyer)
            ->from('/profile')
            ->delete("/profile/address/{$address->id}")
            ->assertRedirect('/profile');
    }

    public function test_product_review_with_emoji_and_exclamation_returns_redirect_to_rating_page_not_json(): void
    {
        $buyer = User::factory()->create(['role' => 'user']);
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Review',
            'slug' => 'toko-review-'.Str::random(5),
        ]);
        $category = Category::create(['name' => 'Ikan', 'slug' => 'ikan-'.Str::random(4)]);
        $product = Product::create([
            'store_id' => $store->id,
            'category_id' => $category->id,
            'name' => 'Ikan Segar',
            'slug' => 'ikan-segar-'.Str::random(4),
            'price' => 25000,
            'stock' => 10,
            'is_active' => true,
        ]);
        $order = Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-REV-'.Str::random(6),
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'shipping_address' => 'Cibenda',
            'delivery_method' => 'local_delivery',
            'subtotal' => 25000,
            'shipping_cost' => 0,
            'total_amount' => 25000,
            'payment_method' => 'cod',
            'payment_status' => 'paid',
            'shipping_status' => 'delivered',
        ]);
        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'quantity' => 1,
            'price' => 25000,
        ]);

        // Simulasi buka halaman rating via Inertia GET (tanpa Referer)
        $this->actingAs($buyer)
            ->get("/history/rating/{$orderItem->id}", $this->inertiaHeaders())
            ->assertOk();

        // Submit ulasan dengan emotikon & tanda seru (tanpa Referer)
        $response = $this->actingAs($buyer)
            ->post("/history/rating/{$orderItem->id}", [
                'rating' => 5,
                'comment' => 'Mantap banget ikannya segar!! 😍🐟',
                'is_anonymous' => false,
            ], $this->inertiaHeaders());

        $response->assertRedirect(route('history.index', ['status' => 'rating']));
    }

    public function test_merchant_password_update_failure_redirects_back_to_settings_without_405(): void
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
            'password' => Hash::make('PasswordLama123!'),
            'is_password_changed' => true,
        ]);
        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Sandi',
            'slug' => 'toko-sandi-'.Str::random(5),
        ]);
        $store->forceFill(['sid_status' => 'verified'])->save();

        // Simulasi buka /pedagang/settings via Inertia GET tanpa Referer
        $this->actingAs($merchant)
            ->get('/pedagang/settings', $this->inertiaHeaders())
            ->assertOk();

        // Kirim password asal (salah) TANPA Referer -> harus kembali ke /pedagang/settings, bukan 405
        $this->actingAs($merchant)
            ->put('/password', [
                'current_password' => 'salah',
                'password' => 'baru',
                'password_confirmation' => 'tidakcocok',
            ], $this->inertiaHeaders())
            ->assertRedirect(url('/pedagang/settings'));
    }

    public function test_admin_settings_update_succeeds_even_when_reverb_broadcast_fails(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        PlatformSetting::set('enable_tax', '0');
        PlatformSetting::set('tax_percentage', '0');

        // Paksa broadcaster reverb dengan host tidak terjangkau agar broadcast() melempar error
        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.options.host' => '127.0.0.1',
            'broadcasting.connections.reverb.options.port' => 59999,
        ]);

        $adminPrefix = config('admin.prefix', 'cibenda-portal');

        $response = $this->actingAs($admin)
            ->from("/{$adminPrefix}/pengaturan")
            ->put("/{$adminPrefix}/pengaturan", [
                'settings' => [
                    ['key' => 'enable_tax', 'value' => true],
                    ['key' => 'tax_percentage', 'value' => 11],
                ],
            ]);

        $response->assertRedirect("/{$adminPrefix}/pengaturan");
        $response->assertSessionHas('success');
        $this->assertEquals('1', PlatformSetting::where('key', 'enable_tax')->value('value'));
        $this->assertEquals('11', PlatformSetting::where('key', 'tax_percentage')->value('value'));
    }
}
