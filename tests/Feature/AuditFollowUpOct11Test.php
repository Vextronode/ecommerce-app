<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ChatMessage;
use App\Models\ChatRoom;
use App\Models\Product;
use App\Models\Store;
use App\Models\User;
use App\Models\Withdrawal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class AuditFollowUpOct11Test extends TestCase
{
    use RefreshDatabase;

    private function buatPedagang(string $sidStatus = 'verified'): array
    {
        $merchant = User::forceCreate([
            'name' => 'Pedagang Uji',
            'email' => 'pedagang-'.uniqid().'@example.test',
            'password' => bcrypt('password123'),
            'role' => 'pedagang',
            'status' => 'active',
            'is_password_changed' => true,
            'email_verified_at' => now(),
        ]);

        $store = Store::forceCreate([
            'user_id' => $merchant->id,
            'name' => 'Toko Uji',
            'slug' => 'toko-uji-'.uniqid(),
            'address' => 'Jl. Pangandaran No. 1',
            'bank_name' => 'BCA',
            'bank_account_number' => '1234567890',
            'bank_account_holder' => 'Sho Jaya',
            'sid_status' => $sidStatus,
        ]);

        return [$merchant, $store];
    }

    private function buatAdmin(): User
    {
        return User::forceCreate([
            'name' => 'Admin Uji',
            'email' => 'admin-'.uniqid().'@example.test',
            'password' => bcrypt('password123'),
            'role' => 'admin',
            'status' => 'active',
            'is_password_changed' => true,
            'email_verified_at' => now(),
        ]);
    }

    private function buatPembeli(): User
    {
        return User::forceCreate([
            'name' => 'Pembeli Uji',
            'email' => 'pembeli-'.uniqid().'@example.test',
            'password' => bcrypt('password123'),
            'role' => 'user',
            'status' => 'active',
            'email_verified_at' => now(),
        ]);
    }

    private function buatWithdrawal(Store $store, string $status, float $amount, bool $reconciliation = false): Withdrawal
    {
        return Withdrawal::forceCreate([
            'store_id' => $store->id,
            'reference_no' => 'WD-'.uniqid(),
            'amount' => $amount,
            'status' => $status,
            'needs_reconciliation' => $reconciliation,
            'bank_name' => 'BCA',
            'account_number' => '1234567890',
            'account_holder' => 'Sho Jaya',
        ]);
    }

    public function test_hapus_pedagang_ditolak_saat_ada_withdrawal_processing(): void
    {
        $admin = $this->buatAdmin();
        [$merchant, $store] = $this->buatPedagang();

        // saldo nol dan tidak ada order aktif, tapi ada penarikan yang sedang diproses gateway.
        // sebelum tambalan, guard hanya cek status 'pending' sehingga ini lolos dan pedagang terhapus.
        $this->buatWithdrawal($store, 'processing', 50000);

        $this->actingAs($admin)->delete("/cibenda-portal/pedagang/{$merchant->id}");

        $this->assertDatabaseHas('users', ['id' => $merchant->id]);
        $this->assertDatabaseHas('stores', ['id' => $store->id]);
    }

    public function test_hapus_pedagang_ditolak_saat_needs_reconciliation(): void
    {
        $admin = $this->buatAdmin();
        [$merchant, $store] = $this->buatPedagang();

        $this->buatWithdrawal($store, 'failed', 75000, true);

        $this->actingAs($admin)->delete("/cibenda-portal/pedagang/{$merchant->id}");

        $this->assertDatabaseHas('users', ['id' => $merchant->id]);
    }

    public function test_hapus_pedagang_tetap_jalan_saat_tidak_ada_beban(): void
    {
        $admin = $this->buatAdmin();
        [$merchant, $store] = $this->buatPedagang();

        $this->actingAs($admin)->delete("/cibenda-portal/pedagang/{$merchant->id}");

        $this->assertDatabaseMissing('users', ['id' => $merchant->id]);
        $this->assertDatabaseMissing('stores', ['id' => $store->id]);
    }

    public function test_chat_pedagang_diblokir_saat_toko_belum_terverifikasi(): void
    {
        [$merchant, $store] = $this->buatPedagang('pending');
        $buyer = $this->buatPembeli();

        $room = ChatRoom::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($merchant)->postJson("/pedagang/chat/{$room->id}/send", [
            'message' => 'halo pembeli',
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('chat_messages', 0);
    }

    public function test_chat_pedagang_jalan_saat_toko_terverifikasi(): void
    {
        [$merchant, $store] = $this->buatPedagang('verified');
        $buyer = $this->buatPembeli();

        $room = ChatRoom::create([
            'store_id' => $store->id,
            'user_id' => $buyer->id,
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($merchant)->postJson("/pedagang/chat/{$room->id}/send", [
            'message' => 'halo pembeli',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseCount('chat_messages', 1);
    }

    public function test_unggahan_foto_produk_lewat_pemrosesan_media(): void
    {
        Storage::fake('public');

        [$merchant, $store] = $this->buatPedagang('verified');
        $category = Category::firstOrCreate(['slug' => 'kategori-uji'], ['name' => 'Kategori Uji']);

        $file = UploadedFile::fake()->image('produk.jpg', 100, 100);

        $response = $this->actingAs($merchant)->post('/pedagang/products', [
            'name' => 'Produk Berfoto',
            'category_id' => $category->id,
            'price' => 15000,
            'stock' => 5,
            'images' => [$file],
        ]);

        $response->assertRedirect();

        $product = Product::where('store_id', $store->id)->first();
        $this->assertNotNull($product, 'produk harus tersimpan');

        $stored = $product->images()->first();
        $this->assertNotNull($stored, 'gambar produk harus tersimpan');
        // ChatMediaProcessor menyimpan nama acak (40 karakter) di folder products.
        $this->assertStringStartsWith('/storage/products/', $stored->image_path);
    }
}
