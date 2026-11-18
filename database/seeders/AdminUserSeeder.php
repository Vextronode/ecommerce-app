<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('AdminUserSeeder diblokir: Kredensial default tidak diizinkan di lingkungan produksi.');

            return;
        }

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
