<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class OrderFillableHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_order_fillable_tidak_memuat_kolom_sensitif(): void
    {
        $fillable = (new Order)->getFillable();

        $this->assertNotContains('shipping_pin', $fillable);
        $this->assertNotContains('payment_payload', $fillable);
    }

    public function test_withdrawal_fillable_tidak_memuat_payout_sent_at(): void
    {
        $fillable = (new Withdrawal)->getFillable();

        $this->assertNotContains('payout_sent_at', $fillable);
    }

    public function test_order_create_tidak_menyimpan_shipping_pin_lewat_mass_assignment(): void
    {
        $order = $this->buatOrder();

        $order->refresh();

        // mass-assignment harus diabaikan total, ga tersimpan
        $this->assertNull($order->shipping_pin);
    }

    public function test_force_fill_tetap_menyimpan_shipping_pin(): void
    {
        $order = $this->buatOrder();

        $order->forceFill(['shipping_pin' => '4821'])->save();
        $order->refresh();

        $this->assertEquals('4821', $order->shipping_pin);
    }

    public function test_order_create_tidak_menyimpan_payment_payload_lewat_mass_assignment(): void
    {
        $order = $this->buatOrder();

        $order->refresh();

        $this->assertNull($order->payment_payload);
    }

    public function test_withdrawal_create_tidak_menyimpan_payout_sent_at_lewat_mass_assignment(): void
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Hardening '.Str::random(4),
            'slug' => 'toko-hard-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Hardening Jaya',
        ]);

        $withdrawal = Withdrawal::create([
            'store_id' => $store->id,
            'reference_no' => 'WD-HARD-'.Str::upper(Str::random(8)),
            'amount' => 10000,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Hardening Jaya',
            'status' => 'processing',
            'notes' => 'test hardening',
            // sengaja coba inject lewat mass-assignment, harus ditolak
            'payout_sent_at' => now(),
        ]);

        $this->assertNull($withdrawal->fresh()->payout_sent_at);
    }

    /**
     * bikin order via create yang mencoba nyuntik shipping_pin & payment_payload
     * di dalam payload mass-assignment
     */
    private function buatOrder(): Order
    {
        $merchant = User::factory()->create(['role' => 'pedagang']);
        $buyer = User::factory()->create(['role' => 'user']);

        $store = Store::create([
            'user_id' => $merchant->id,
            'name' => 'Toko Order '.Str::random(4),
            'slug' => 'toko-order-'.Str::random(8),
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Order Jaya',
        ]);

        return Order::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'invoice_number' => 'INV-HARD-'.Str::upper(Str::random(8)),
            'customer_name' => 'Pembeli Uji',
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Uji Coba No. 1',
            'subtotal' => 20000,
            'shipping_cost' => 0,
            'total_amount' => 20000,
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            // dua kolom sensitif ini harus diabaikan mass-assignment
            'shipping_pin' => '9999',
            'payment_payload' => ['fraud' => 'fake', 'amount' => 1],
        ]);
    }
}
