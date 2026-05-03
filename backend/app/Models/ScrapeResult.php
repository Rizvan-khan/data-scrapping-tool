<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapeResult extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'scrape_session_id',
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
        'link',
    ];

    protected $casts = [
        'rating'       => 'float',
        'review_count' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ← Yeh add kiya
    public function session()
    {
        return $this->belongsTo(ScrapeSession::class, 'scrape_session_id');
    }

public function scopeOfSession($query, $sessionId)
{
    return $query->where('scrape_session_id', $sessionId);
}

}