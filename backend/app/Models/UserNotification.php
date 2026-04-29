<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserNotification extends Model
{
    public $timestamps = false; // only created_at

    protected $table = 'notifications'; // table name

    protected $fillable = [
        'user_id',
        'type',
        'title',
        'body',
        'is_read',
        'reference_id',
        'reference_type',
        'sent_at',
        'read_at',
    ];

    protected $casts = [
        'is_read'    => 'boolean',
        'sent_at'    => 'datetime',
        'read_at'    => 'datetime',
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

    public function markAsRead(): void
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public function isUnread(): bool
    {
        return !$this->is_read;
    }
}