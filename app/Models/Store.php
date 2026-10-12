<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'user_id',
    'name',
    'slug',
    'logo_path',
    'description',
    'has_completed_tour',
    'support_email',
    'address',
    'latitude',
    'longitude',
    'subdistrict',
    'bank_name',
    'bank_account_number',
    'bank_account_holder',
])]
#[Hidden([
    'available_balance',
    'pending_balance',
    'bank_name',
    'bank_account_number',
    'bank_account_holder',
    'has_completed_tour',
])]
class Store extends Model
{
    use HasFactory;

    protected $casts = [
        'has_completed_tour' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function getLogoPathAttribute($value)
    {
        if ($value) {
            return $value;
        }

        // Jika logo_path null, ambil dari profile_photo_path milik user
        return $this->user ? $this->user->profile_photo_path : null;
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function reviews()
    {
        return $this->hasMany(ProductReview::class);
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'store_followers');
    }

    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class);
    }
}
