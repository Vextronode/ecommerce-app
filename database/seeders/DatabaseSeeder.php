<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * seed basis data aplikasi.
     *
     * urutan penting: kategori dasar dan admin dulu (selalu ada), lalu pedagang
     * beserta katalog produknya. pengendalian lewat env:
     * SEED_SKIP_MERCHANTS=true melewati data demo pedagang.
     * SEED_SKIP_PHOTOS=true melewati unduhan foto produk.
     */
    public function run(): void
    {
        $this->seedCategories();
        $this->seedAdmin();

        // opsi custom tidak tersedia di signature db:seed, jadi pengendalian
        // lewat env agar tetap kompatibel tanpa mengubah command inti.
        if ((bool) env('SEED_SKIP_MERCHANTS', false)) {
            $this->command?->warn('data pedagang & katalog dilewati (SEED_SKIP_MERCHANTS).');

            return;
        }

        $this->call(MerchantSeeder::class);
        $this->call(CatalogSeeder::class);
    }

    private function seedCategories(): void
    {
        $categories = [
            'Seafood',
            'Sayuran',
            'Daging',
            'Sembako',
            'Bumbu Dapur',
            'Pakaian',
            'Lainnya',
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category],
                ['slug' => Str::slug($category)]
            );
        }
    }

    private function seedAdmin(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@cibendamart.com'],
            [
                'name' => 'Admin CibendaMart',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'is_password_changed' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
