<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'store_id',
    'reference_no',
    'amount',
    'bank_name',
    'account_number',
    'account_holder',
    'status',
    'notes',
])]
class Withdrawal extends Model
{
    use HasFactory;

    protected $casts = [
        'payout_sent_at' => 'datetime',
        'needs_reconciliation' => 'boolean',
    ];

    public function store()
    {
        return $this->belongsTo(Store::class);
    }
}
