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
    'category',
    'email',
    'phone',
    'address',
    'city',
    'country',
    'website',
    'rating',
    'review_count',
    'working_hours',
    'instagram',
    'facebook',
    'search_keyword',
    'search_location',
    'link'
];

// protected $guarded = [];

    public function user()
{
    return $this->belongsTo(User::class);
}
}
