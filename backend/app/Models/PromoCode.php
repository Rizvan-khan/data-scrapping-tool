<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code',
        'description',
        'discount_type',
        'discount_value',
        'max_uses',
        'used_count',
        'min_order_amount',
        'applicable_plans',
        'valid_from',
        'valid_until',
        'is_active',
    ];

    protected $casts = [
        'discount_value'   => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'applicable_plans' => 'array',
        'valid_from'       => 'datetime',
        'valid_until'      => 'datetime',
        'is_active'        => 'boolean',
        'max_uses'         => 'integer',
        'used_count'       => 'integer',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function usages()
    {
        return $this->hasMany(PromoCodeUsage::class);
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->valid_until && $this->valid_until->isPast()) return false;
        if ($this->max_uses && $this->used_count >= $this->max_uses) return false;
        return true;
    }

    public function isUsedByUser(int $userId): bool
    {
        return $this->usages()->where('user_id', $userId)->exists();
    }

    public function hasRemainingUses(): bool
    {
        if (!$this->max_uses) return true;
        return $this->used_count < $this->max_uses;
    }

    public function isApplicableToPlan(string $planSlug): bool
    {
        if (!$this->applicable_plans) return true;
        return in_array($planSlug, $this->applicable_plans);
    }
}