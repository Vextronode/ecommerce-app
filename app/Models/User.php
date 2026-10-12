<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'is_password_changed', 'google_id', 'profile_photo_path', 'phone', 'last_seen_at', 'nik', 'gender', 'dob', 'notification_settings'])]
#[Hidden([
    'password',
    'remember_token',
    'fcm_token',
    'google_id',
    'nik',
    'email',
    'phone',
    'dob',
    'gender',
    'notification_settings',
    'is_password_changed',
    'email_verified_at',
])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
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
            'last_seen_at' => 'datetime',
        ];
    }

    public function isOnline(): bool
    {
        if (!$this->last_seen_at) {
            return false;
        }

        $date = $this->last_seen_at instanceof \Carbon\Carbon
            ? $this->last_seen_at
            : \Carbon\Carbon::parse($this->last_seen_at);

        return $date->gt(now()->subMinutes(3));
    }

    public function lastSeenFormatted(): string
    {
        if (!$this->last_seen_at) {
            return 'Tidak aktif';
        }

        if ($this->isOnline()) {
            return 'Online';
        }

        $date = $this->last_seen_at instanceof \Carbon\Carbon
            ? $this->last_seen_at
            : \Carbon\Carbon::parse($this->last_seen_at);

        return 'Aktif ' . $date->diffForHumans();
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
     * @return HasMany<Address, User>
     */
    public function addresses(): HasMany
    {
        return $this->hasMany(Address::class);
    }

    public function carts(): HasMany
    {
        return $this->hasMany(Cart::class);
    }

    public function followingStores()
    {
        return $this->belongsToMany(Store::class, 'store_followers');
    }

    public function store()
    {
        return $this->hasOne(Store::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
