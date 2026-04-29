<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UsageLog extends Model
{
    public $timestamps = false; // only created_at

    protected $fillable = [
        'user_id',
        'subscription_id',
        'feature_key',
        'credits_consumed',
        'billing_source',
        'request_id',
        'ip_address',
        'metadata',
    ];

    protected $casts = [
        'credits_consumed' => 'decimal:4',
        'metadata'         => 'array',
        'created_at'       => 'datetime',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function subscription()
    {
        return $this->belongsTo(Subscription::class);
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function billedFromSubscription(): bool
    {
        return $this->billing_source === 'subscription';
    }

    public function billedFromCredits(): bool
    {
        return $this->billing_source === 'free_credits';
    }
}