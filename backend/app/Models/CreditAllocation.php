<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditAllocation extends Model
{
    public $timestamps = false; // only created_at

    protected $fillable = [
        'user_id',
        'credit_id',
        'source',
        'amount',
        'notes',
        'promo_code',
        'expires_at',
    ];

    protected $casts = [
        'amount'     => 'decimal:4',
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

    public function freeCredit()
    {
        return $this->belongsTo(FreeCredit::class, 'credit_id');
    }
}