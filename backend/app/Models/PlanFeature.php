<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlanFeature extends Model
{
    public $timestamps = false; // only created_at hai

    protected $fillable = [
        'plan_id',
        'feature_key',
        'feature_value',
        'value_type',
        'display_label',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function getCastedValue()
    {
        return match($this->value_type) {
            'integer' => (int) $this->feature_value,
            'decimal' => (float) $this->feature_value,
            'boolean' => $this->feature_value === 'true',
            default   => $this->feature_value,
        };
    }
}