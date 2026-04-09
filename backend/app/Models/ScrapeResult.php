<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapeResult extends Model
{


 use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'phone',
        'address',
        'website',
        'rating',
        'search_keyword',
        'search_location'
    ];

    public function user()
{
    return $this->belongsTo(User::class);
}
}
