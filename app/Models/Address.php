<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Address extends Model
{
    protected $fillable = [
        'user_id', 'label', 'is_primary', 'recipient_name', 'phone', 'full_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
