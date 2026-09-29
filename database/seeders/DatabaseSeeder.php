<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\User;
use App\Models\Store;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
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
