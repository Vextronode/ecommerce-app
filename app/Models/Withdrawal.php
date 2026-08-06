<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Withdrawal extends Model
{
    use HasFactory;

    protected $fillable = [
        'store_id',
        'reference_no',
        'amount',
        'bank_name',
        'account_number',
        'account_holder',
        'status',
        'notes',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
