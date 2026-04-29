<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FreeCredit extends Model
{
    protected $fillable = [
        'user_id',
        'total_credits',
        'used_credits',
        'reserved_credits',
        'lifetime_earned',
        'expires_at',
        'last_reset_at',
    ];

    protected $casts = [
        'total_credits'    => 'decimal:4',
        'used_credits'     => 'decimal:4',
        'reserved_credits' => 'decimal:4',
        'lifetime_earned'  => 'decimal:4',
        'expires_at'       => 'datetime',
        'last_reset_at'    => 'datetime',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function allocations()
    {
        return $this->hasMany(CreditAllocation::class, 'credit_id');
    }

    public function transactions()
    {
        return $this->hasMany(CreditTransaction::class, 'credit_id');
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function getRemainingCredits(): float
    {
        return $this->total_credits - $this->used_credits - $this->reserved_credits;
    }

    public function hasEnough(float $amount): bool
    {
        return $this->getRemainingCredits() >= $amount;
    }

    public function deduct(float $amount): bool
    {
        if (!$this->hasEnough($amount)) return false;

        $this->increment('used_credits', $amount);
        return true;
    }

    public function add(float $amount): void
    {
        $this->increment('total_credits', $amount);
        $this->increment('lifetime_earned', $amount);
    }
}