<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CreditTransaction extends Model
{
    public $timestamps = false; // only created_at

    protected $fillable = [
        'user_id',
        'credit_id',
        'type',
        'amount',
        'balance_before',
        'balance_after',
        'source',
        'reference_id',
        'feature_key',
        'notes',
    ];

    protected $casts = [
        'amount'         => 'decimal:4',
        'balance_before' => 'decimal:4',
        'balance_after'  => 'decimal:4',
        'created_at'     => 'datetime',
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

    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------

    public function isCredit(): bool
    {
        return $this->type === 'credit';
    }

    public function isDebit(): bool
    {
        return $this->type === 'debit';
    }
}