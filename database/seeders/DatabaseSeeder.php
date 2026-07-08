<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::create([
            'name' => 'Warung Sembako Kang Asep',
            'email' => 'asep@pedagang.com',
            'password' => Hash::make('password123'),
        ]);


        User::create([
            'name' => 'Toko Baju Bu Euis',
            'email' => 'euis@pedagang.com',
            'password' => Hash::make('password123'),
            'role' => 'pedagang',
            'is_password_changed' => false,
        ]);


        User::create([
            'name' => 'Admin CibendaMart',
            'email' => 'admin@cibendamart.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
            'is_password_changed' => true,
        ]);
    }
}
