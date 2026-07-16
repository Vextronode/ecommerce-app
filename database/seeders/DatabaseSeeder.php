<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Store;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\OrderItem;
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
            'name' => 'Kang Asep',
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
            'slug' => Str::slug('Toko Baju Euis-' . uniqid()),
        ]);

        User::create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_password_changed' => true,
        ]);

        $budi = User::create([
            'name' => 'Budi Pelanggan',
            'email' => 'budi@pembeli.com',
            'password' => Hash::make('password123'),
            'role' => 'user', // Asumsi role pembeli lu namanya 'user'
            'is_password_changed' => true,
        ]);

        // --- BIKIN PRODUK KANG ASEP ---
        $sembakoId = Category::where('name', 'Sembako')->first()->id;
        $seafoodId = Category::where('name', 'Seafood')->first()->id;

        $beras = Product::create([
            'store_id' => $storeAsep->id,
            'category_id' => $sembakoId,
            'name' => 'Beras Pandan Wangi 5kg',
            'slug' => Str::slug('Beras Pandan Wangi 5kg-' . uniqid()),
            'description' => 'Beras pulen kualitas premium dari petani lokal.',
            'price' => 75000,
            'stock' => 20,
            'is_active' => true,
        ]);

        $udang = Product::create([
            'store_id' => $storeAsep->id,
            'category_id' => $seafoodId,
            'name' => 'Udang Tiger Segar 1kg',
            'slug' => Str::slug('Udang Tiger Segar 1kg-' . uniqid()),
            'description' => 'Udang tangkapan nelayan hari ini.',
            'price' => 120000,
            'stock' => 10,
            'is_active' => true,
        ]);


        // ORDER 1: Udah Lunas & Dikirim (Isinya Beras & Udang)
        $order1 = Order::create([
            'store_id' => $storeAsep->id,
            'user_id' => $budi->id,
            'invoice_number' => '#ORD-' . strtoupper(Str::random(8)),
            'customer_name' => $budi->name,
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Cibenda Raya No. 1, Pangandaran',
            'delivery_method' => 'Standard',
            'subtotal' => 195000, // 75k + 120k
            'shipping_cost' => 15000,
            'total_amount' => 210000,
            'payment_method' => 'BANK_TRANSFER',
            'payment_status' => 'paid',
            'shipping_status' => 'shipped',
            'created_at' => now()->subDays(2), // Dipesan 2 hari lalu
        ]);

        OrderItem::create(['order_id' => $order1->id, 'product_id' => $beras->id, 'product_name' => $beras->name, 'price' => $beras->price, 'quantity' => 1, 'unit' => 'pcs']);
        OrderItem::create(['order_id' => $order1->id, 'product_id' => $udang->id, 'product_name' => $udang->name, 'price' => $udang->price, 'quantity' => 1, 'unit' => 'kg']);

        // ORDER 2: Nunggu Pembayaran (Isinya Udang aja)
        $order2 = Order::create([
            'store_id' => $storeAsep->id,
            'user_id' => $budi->id,
            'invoice_number' => '#ORD-' . strtoupper(Str::random(8)),
            'customer_name' => 'Asep Surasep (Teman Budi)',
            'customer_phone' => '089876543210',
            'shipping_address' => 'Desa Parigi Blok C No. 12',
            'delivery_method' => 'COD',
            'subtotal' => 240000, // 2kg udang
            'shipping_cost' => 10000,
            'total_amount' => 250000,
            'payment_method' => 'COD',
            'payment_status' => 'pending',
            'shipping_status' => 'pending',
            'created_at' => now()->subHours(5), // Dipesan 5 jam lalu
        ]);

        OrderItem::create(['order_id' => $order2->id, 'product_id' => $udang->id, 'product_name' => $udang->name, 'price' => $udang->price, 'quantity' => 2, 'unit' => 'kg']);

        // ORDER 3: Udah Lunas, Tapi Belum Dikirim (Processing - Isinya Beras)
        $order3 = Order::create([
            'store_id' => $storeAsep->id,
            'user_id' => $budi->id,
            'invoice_number' => '#ORD-' . strtoupper(Str::random(8)),
            'customer_name' => $budi->name,
            'customer_phone' => '081234567890',
            'shipping_address' => 'Jl. Cibenda Raya No. 1, Pangandaran',
            'delivery_method' => 'Standard',
            'subtotal' => 75000,
            'shipping_cost' => 15000,
            'total_amount' => 90000,
            'payment_method' => 'MIDTRANS',
            'payment_status' => 'paid',
            'shipping_status' => 'processing',
            'created_at' => now()->subMinutes(30), // Dipesan 30 menit lalu
        ]);

        OrderItem::create(['order_id' => $order3->id, 'product_id' => $beras->id, 'product_name' => $beras->name, 'price' => $beras->price, 'quantity' => 1, 'unit' => 'pcs']);
    }
}
