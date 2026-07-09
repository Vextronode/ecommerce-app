<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

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
            Category::create([
                'name' => $category,
                'slug' => Str::slug($category),
            ]);
        }

        $asep = User::create([
            'name' => 'Kang Asep', // Nama orangnya
            'email' => 'asep@pedagang.com',
            'password' => Hash::make('password123'),
            'role' => 'pedagang',
            'is_password_changed' => true,
        ]);

        $storeAsep = Store::create([
            'user_id' => $asep->id,
            'name' => 'Warung Sembako Kang Asep',
            'slug' => Str::slug('Warung Sembako Kang Asep-' . uniqid()),
        ]);

        $euis = User::create([
            'name' => 'Bu Euis',
            'email' => 'euis@pedagang.com',
            'password' => Hash::make('password123'),
            'role' => 'pedagang',
            'is_password_changed' => true,
        ]);

        $storeEuis = Store::create([
            'user_id' => $euis->id,
            'name' => 'Toko Baju Euis',
            'slug' => Str::slug('Toko Baju Brandy Bu Euis' . uniqid()),
        ]);

        User::create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_password_changed' => true,
        ]);

        $sembakoId = Category::where('name', 'Sembako')->first()->id;
        $seafoodId = Category::where('name', 'Seafood')->first()->id;

        Product::create([
            'store_id' => $storeAsep->id,
            'category_id' => $sembakoId,
            'name' => 'Beras Pandan Wangi 5kg',
            'slug' => Str::slug('Beras Pandan Wangi 5kg-' . uniqid()),
            'description' => 'Beras pulen kualitas premium dari petani lokal.',
            'price' => 75000,
            'stock' => 20,
            'is_active' => true,
        ]);

        Product::create([
            'store_id' => $storeAsep->id,
            'category_id' => $seafoodId,
            'name' => 'Udang Tiger Segar 1kg',
            'slug' => Str::slug('Udang Tiger Segar 1kg-' . uniqid()),
            'description' => 'Udang tangkapan nelayan hari ini.',
            'price' => 120000,
            'stock' => 10,
            'is_active' => true,
        ]);
    }
}
