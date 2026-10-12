<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

/**
 * regresi jalur revenue trend di dashboard analitik pedagang.
 *
 * sebelum patch, blok revenue trend memakai selectRaw('SUM(...) as revenue, created_at')
 * lalu groupBy di collection php tanpa GROUP BY SQL. di sqlite (test runner) query itu
 * lolos, tetapi di mysql strict (ONLY_FULL_GROUP_BY) ditolak sqlstate 42000 sehingga
 * halaman /pedagang/analytics 500. test ini mengunci angka revenue per bulan dan
 * memastikan endpoint tidak lagi gagal.
 *
 * catatan jujur: test berjalan di sqlite, jadi ia mengunci kebenaran angka dan
 * tidak-500, bukan perilaku strict mysql. verifikasi mysql strict ada di PoC terminal
 * terpisah dan dicatat di SESSION.md.
 */
class MerchantAnalyticsTrendTest extends TestCase
{
    use RefreshDatabase;

    private function buatPedagangDenganToko(): array
    {
        $merchant = User::factory()->create([
            'role' => 'pedagang',
            'is_password_changed' => true,
            'email_verified_at' => now(),
        ]);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Analitik',
            'slug' => 'toko-analitik-'.Str::random(6),
            'has_completed_tour' => true,
        ]);
        $store->forceFill(['pending_balance' => 0, 'available_balance' => 0, 'sid_status' => 'verified'])->save();

        return [$merchant, $store];
    }

    private function buatOrder(Store $store, User $buyer, string $createdAt, float $subtotal, float $shippingCost, string $status = 'paid', ?float $totalAmount = null): void
    {
        $order = new Order([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'ORD-AN-'.strtoupper(Str::random(8)),
            'customer_name' => 'Buyer Analitik',
            'customer_phone' => '08123456789',
            'shipping_address' => 'Pangandaran',
            'delivery_method' => 'self_pickup',
            'subtotal' => $subtotal,
            'shipping_cost' => $shippingCost,
            'total_amount' => $totalAmount ?? ($subtotal + $shippingCost),
            'payment_method' => 'va',
            'payment_channel' => 'bca_va',
            'payment_status' => $status,
            'shipping_status' => 'delivered',
        ]);
        $order->created_at = $createdAt;
        $order->updated_at = $createdAt;
        $order->save();
    }

    public function test_revenue_trend_menghitung_per_bulan_dengan_benar_tanpa_500(): void
    {
        [$merchant, $store] = $this->buatPedagangDenganToko();
        $buyer = User::factory()->create(['role' => 'user']);

        $year = now()->year;

        // maret: subtotal > 0 pakai subtotal + shipping (60000 + 5000 = 65000)
        $this->buatOrder($store, $buyer, "{$year}-03-10 10:00:00", 60000, 5000);
        // maret kedua: subtotal > 0 (20000 + 0 = 20000) -> total maret 85000
        $this->buatOrder($store, $buyer, "{$year}-03-20 10:00:00", 20000, 0);
        // juli: subtotal == 0 pakai total_amount (40000)
        $this->buatOrder($store, $buyer, "{$year}-07-05 10:00:00", 0, 0, 'paid', 40000);
        // order cancelled tidak boleh masuk hitungan
        $this->buatOrder($store, $buyer, "{$year}-03-25 10:00:00", 99999, 0, 'paid');
        Order::where('invoice_number', 'like', 'ORD-AN-%')
            ->latest('id')->first()
            ->forceFill(['shipping_status' => 'cancelled'])->save();

        $response = $this->actingAs($merchant)->get('/pedagang/analytics?period=12m');

        $response->assertOk();

        $response->assertInertia(fn ($page) => $page
            ->component('Merchant/Analytics/Index')
            ->where('revenueTrend.2.'.(string) $year, 85000)
            ->where('revenueTrend.6.'.(string) $year, 40000)
        );
    }

    public function test_revenue_trend_kosong_saat_nol_order_tidak_error(): void
    {
        [$merchant, $store] = $this->buatPedagangDenganToko();

        $response = $this->actingAs($merchant)->get('/pedagang/analytics');

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Merchant/Analytics/Index')
            ->where('metrics.total_revenue', 0)
        );
    }
}
