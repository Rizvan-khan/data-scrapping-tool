<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserSession extends Model
{
    public $timestamps = false; // only created_at hai, no updated_at

    protected $fillable = [
        'user_id',
        'token_hash',
        'device_info',
        'ip_address',
        'user_agent',
        'is_active',
        'expires_at',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return $this->is_active && !$this->isExpired();
    }
}