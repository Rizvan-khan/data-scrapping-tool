<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'country',
        'timezone',
        'currency',
        'language',
        'address_line1',
        'address_line2',
        'city',
        'state',
        'postal_code',
        'gstin',
    ];

    // -------------------------------------------------------
    // RELATIONSHIPS
    // -------------------------------------------------------

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}