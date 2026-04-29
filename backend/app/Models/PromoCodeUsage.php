<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCodeUsage extends Model
{
    public $timestamps = false; // only used_at

    protected $fillable = [
        'promo_code_id',
        'user_id',
        'invoice_id',
        'discount_given',
    ];

    protected $casts = [
        'discount_given' => 'decimal:2',
        'used_at'        => 'datetime',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}