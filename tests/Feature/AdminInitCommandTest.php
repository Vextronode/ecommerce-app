<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminInitCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_admin_interactively_when_no_admin_exists(): void
    {
        $this->artisan('admin:init')
            ->expectsQuestion('Nama Lengkap Administrator', 'Kepala Desa Cibenda')
            ->expectsQuestion('Alamat Email Resmi (cth: admin@cibenda.desa.id)', 'kades@cibenda.desa.id')
            ->expectsQuestion('Password Administrator (minimal 8 karakter)', 'Rahasia123!')
            ->expectsQuestion('Konfirmasi Password', 'Rahasia123!')
            ->assertSuccessful();

        $this->assertDatabaseHas('users', [
            'name' => 'Kepala Desa Cibenda',
            'email' => 'kades@cibenda.desa.id',
            'role' => 'admin',
            'status' => 'active',
            'is_password_changed' => 1,
        ]);

        $admin = User::where('email', 'kades@cibenda.desa.id')->first();
        $this->assertNotNull($admin);
        $this->assertTrue(Hash::check('Rahasia123!', $admin->password));
        $this->assertNotNull($admin->email_verified_at);
    }

    public function test_creates_admin_using_cli_options(): void
    {
        $this->artisan('admin:init', [
            '--name' => 'Admin CLI Desa',
            '--email' => 'admin.cli@cibenda.desa.id',
            '--password' => 'SandiKuat999',
        ])->assertSuccessful();

        $this->assertDatabaseHas('users', [
            'name' => 'Admin CLI Desa',
            'email' => 'admin.cli@cibenda.desa.id',
            'role' => 'admin',
        ]);
    }

    public function test_blocks_duplicate_admin_without_force_flag(): void
    {
        User::factory()->create([
            'email' => 'existing.admin@cibenda.desa.id',
            'role' => 'admin',
        ]);

        $this->artisan('admin:init')
            ->assertFailed();
    }

    public function test_allows_admin_creation_when_admin_exists_if_force_flag_provided(): void
    {
        User::factory()->create([
            'email' => 'existing.admin@cibenda.desa.id',
            'role' => 'admin',
        ]);

        $this->artisan('admin:init', [
            '--name' => 'Admin Kedua',
            '--email' => 'admin2@cibenda.desa.id',
            '--password' => 'PasswordBaru123',
            '--force' => true,
        ])->assertSuccessful();

        $this->assertDatabaseHas('users', [
            'email' => 'admin2@cibenda.desa.id',
            'role' => 'admin',
        ]);
    }

    public function test_rejects_password_shorter_than_8_chars_in_options(): void
    {
        $this->artisan('admin:init', [
            '--name' => 'Admin Pendek',
            '--email' => 'pendek@cibenda.desa.id',
            '--password' => '1234567',
        ])->assertFailed();

        $this->assertDatabaseMissing('users', [
            'email' => 'pendek@cibenda.desa.id',
        ]);
    }

    public function test_updates_existing_admin_when_force_flag_provided(): void
    {
        $existing = User::factory()->create([
            'name' => 'Admin Lama',
            'email' => 'update.admin@cibenda.desa.id',
            'role' => 'admin',
        ]);

        $this->artisan('admin:init', [
            '--name' => 'Admin Diperbarui',
            '--email' => 'update.admin@cibenda.desa.id',
            '--password' => 'PasswordBaru999',
            '--force' => true,
        ])->assertSuccessful();

        $existing->refresh();
        $this->assertEquals('Admin Diperbarui', $existing->name);
        $this->assertTrue(Hash::check('PasswordBaru999', $existing->password));
    }
}
