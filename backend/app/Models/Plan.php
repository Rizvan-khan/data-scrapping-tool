<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'description',
        'billing_cycle',
        'price',
        'currency',
        'trial_days',
        'sort_order',
        'is_active',
        'is_popular',
    ];

    protected $casts = [
        'price'      => 'decimal:2',
        'trial_days' => 'integer',
        'sort_order' => 'integer',
        'is_active'  => 'boolean',
        'is_popular' => 'boolean',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function features()
    {
        return $this->hasMany(PlanFeature::class);
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function getFeatureValue(string $key, $default = null)
    {
        $feature = $this->features->firstWhere('feature_key', $key);
        if (!$feature) return $default;

        return match($feature->value_type) {
            'integer' => (int) $feature->feature_value,
            'decimal' => (float) $feature->feature_value,
            'boolean' => $feature->feature_value === 'true',
            default   => $feature->feature_value,
        };
    }

    public function isFree(): bool
    {
        return $this->price == 0;
    }

    public function isMonthly(): bool
    {
        return $this->billing_cycle === 'monthly';
    }

    public function isYearly(): bool
    {
        return $this->billing_cycle === 'yearly';
    }
}