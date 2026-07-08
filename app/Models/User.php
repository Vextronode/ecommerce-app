<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password','role','is_password_changed','google_id', 'profile_photo_path', 'phone', 'gender', 'dob','notification_settings'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory;
    use Notifiable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_settings' => 'array',
            'is_password_changed' => 'boolean',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPedagang(): bool
    {
        return $this->role === 'pedagang';
    }

    public function isUser(): bool
    {
        return $this->role === 'user';
    }
    /**
     * @return \Illuminate\Database\Eloquent\Relations\HasMany<Address, User>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }
}
