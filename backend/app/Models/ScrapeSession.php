<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ScrapeSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'keyword',
        'location',
        'requested_limit',
        'result_count',
        'status',
        'error_message',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function results()
    {
        return $this->hasMany(ScrapeResult::class);
    }

    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function markProcessing(): void
    {
        $this->update(['status' => 'processing']);
    }

    public function markCompleted(int $count): void
    {
        $this->update([
            'status'       => 'completed',
            'result_count' => $count,
            'completed_at' => now(),
        ]);
    }

    public function markFailed(string $error): void
    {
        $this->update([
            'status'        => 'failed',
            'error_message' => $error,
        ]);
    }
}