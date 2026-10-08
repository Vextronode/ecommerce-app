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
