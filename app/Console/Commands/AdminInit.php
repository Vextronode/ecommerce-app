<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminInit extends Command
{
    protected $signature = 'admin:init
        {--name= : Nama lengkap administrator}
        {--email= : Alamat email resmi administrator}
        {--password= : Password akun administrator (minimal 8 karakter)}
        {--force : Buat atau perbarui akun admin meskipun akun admin sudah ada}';

    protected $description = 'Inisialisasi akun Super Administrator Desa Cibenda untuk lingkungan produksi';

    public function handle(): int
    {
        $this->components->info('Inisialisasi Akun Super Administrator Cibenda Mart');

        $existingAdminCount = User::where('role', 'admin')->count();
        if ($existingAdminCount > 0 && ! $this->option('force')) {
            $this->components->warn("Sudah ada {$existingAdminCount} akun administrator terdaftar di sistem.");
            $this->components->info('Gunakan flag --force jika Anda sengaja ingin menambahkan administrator baru atau memperbarui akun.');

            return self::FAILURE;
        }

        $name = $this->option('name');
        if (! $name) {
            $name = $this->ask('Nama Lengkap Administrator', 'Administrator Desa Cibenda');
        }

        if (empty(trim($name))) {
            $this->components->error('Nama administrator tidak boleh kosong.');

            return self::FAILURE;
        }

        $email = $this->option('email');
        if ($email) {
            $validator = Validator::make(['email' => $email], [
                'email' => ['required', 'string', 'email:rfc,dns,filter', 'max:255'],
            ]);

            if ($validator->fails()) {
                $this->components->error('Format email yang diberikan pada opsi --email tidak valid.');

                return self::FAILURE;
            }
        } else {
            while (true) {
                $email = $this->ask('Alamat Email Resmi (cth: admin@cibenda.desa.id)');
                $validator = Validator::make(['email' => $email], [
                    'email' => ['required', 'string', 'email:rfc,filter', 'max:255'],
                ]);

                if ($validator->fails()) {
                    $this->components->error('Format email tidak valid. Silakan coba lagi.');
                    continue;
                }

                break;
            }
        }

        $existingUser = User::where('email', $email)->first();
        if ($existingUser && $existingUser->role !== 'admin' && ! $this->option('force')) {
            $this->components->error("Email '{$email}' sudah digunakan oleh pengguna dengan peran '{$existingUser->role}'.");
            $this->components->info('Gunakan flag --force jika Anda ingin mengubah peran pengguna tersebut menjadi administrator.');

            return self::FAILURE;
        }

        $password = $this->option('password');
        if ($password) {
            if (strlen($password) < 8) {
                $this->components->error('Password minimal 8 karakter.');

                return self::FAILURE;
            }
        } else {
            while (true) {
                $password = $this->secret('Password Administrator (minimal 8 karakter)');

                if (strlen($password) < 8) {
                    $this->components->error('Password minimal 8 karakter. Silakan coba lagi.');
                    continue;
                }

                $passwordConfirm = $this->secret('Konfirmasi Password');
                if ($password !== $passwordConfirm) {
                    $this->components->error('Konfirmasi password tidak cocok. Silakan coba lagi.');
                    continue;
                }

                break;
            }
        }

        $user = $existingUser ?? new User();
        $user->forceFill([
            'name' => trim($name),
            'email' => trim($email),
            'password' => Hash::make($password),
            'role' => 'admin',
            'status' => 'active',
            'is_password_changed' => true,
            'email_verified_at' => now(),
        ])->save();

        $actionText = $existingUser ? 'diperbarui' : 'dibuat';
        $this->components->info("Akun Super Administrator Desa Cibenda berhasil {$actionText}!");

        $this->table(
            ['Atribut', 'Nilai'],
            [
                ['Nama', $user->name],
                ['Email', $user->email],
                ['Role', $user->role],
                ['Status', $user->status],
                ['Email Terverifikasi', $user->email_verified_at?->toDateTimeString() ?? 'Ya'],
            ]
        );

        $this->newLine();
        $this->components->info('Kredensial disimpan dengan aman. Anda kini dapat login ke panel admin.');

        return self::SUCCESS;
    }
}
