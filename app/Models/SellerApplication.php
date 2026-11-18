<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SellerApplication extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'pending';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_CANCELLED = 'cancelled';

    public const CATEGORY_KELONTONG = 'kelontong';
    public const CATEGORY_KULINER = 'kuliner';
    public const CATEGORY_NON_KULINER = 'non_kuliner';

    protected $fillable = [
        'business_ref',
        'status',
        'requested_at',
        'decided_at',
        'note',
        'nik',
        'name',
        'business_name',
        'business_activity',
        'category',
        'category_label',
        'email',
        'phone',
        'address',
        'letter_number',
        'issued_at',
        'expires_at',
        'store_id',
        'user_id',
        'raw_payload',
    ];

    protected $casts = [
        'requested_at' => 'datetime',
        'decided_at' => 'datetime',
        'issued_at' => 'datetime',
        'expires_at' => 'datetime',
        'raw_payload' => 'array',
    ];

    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_PENDING);
    }

    public function scopeAccepted(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_ACCEPTED);
    }

    public function scopeRejected(Builder $query): Builder
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    /**
     * Anonymize personally identifiable information (PII) upon applicant cancellation
     * in accordance with Section 7.4 of the SID integration contract.
     */
    public function anonymizeCancelled(): void
    {
        $this->update([
            'status' => self::STATUS_CANCELLED,
            'nik' => null,
            'name' => null,
            'email' => null,
            'phone' => null,
            'address' => null,
            'raw_payload' => null,
        ]);
    }
}
