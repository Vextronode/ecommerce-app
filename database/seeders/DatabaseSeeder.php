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

    public function run(): void
    {
        $this->seedCategories();
        $this->call(PlatformSettingSeeder::class);

        if (! app()->environment('local')) {
            $this->command?->info('Lingkungan non-lokal (' . app()->environment() . ') terdeteksi: Data dummy (Admin sampel, Pedagang demo, Katalog produk) dilewati secara aman.');

            return;
        }

        $this->seedAdminDevelopment();

        if ((bool) env('SEED_SKIP_MERCHANTS', false)) {
            $this->command?->warn('Data pedagang & katalog dilewati (SEED_SKIP_MERCHANTS).');

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

    private function seedAdminDevelopment(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@cibendamart.com'],
            [
                'name' => 'Admin CibendaMart (Dev)',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'is_password_changed' => true,
                'email_verified_at' => now(),
            ]
        );
    }
}
