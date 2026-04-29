<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'email', 'password','avatar_url',
        'status',
        'role',
        'email_verified_at',
        'last_login_at',
        'last_login_ip',])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use  HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at'     => 'datetime',
            'password' => 'hashed',
        ];
    }

public function scrapeResults()
{
    return $this->hasMany(ScrapeResult::class);
}

  public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }
 
    public function sessions()
    {
        return $this->hasMany(UserSession::class);
    }
 
    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }
 
    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)
                    ->whereIn('status', ['active', 'trialing'])
                    ->latest();
    }
 
    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }
 
    public function freeCredits()
    {
        return $this->hasOne(FreeCredit::class);
    }
 
    public function creditAllocations()
    {
        return $this->hasMany(CreditAllocation::class);
    }
 
    public function creditTransactions()
    {
        return $this->hasMany(CreditTransaction::class);
    }
 
    public function usageLogs()
    {
        return $this->hasMany(UsageLog::class);
    }
 
    public function promoCodeUsages()
    {
        return $this->hasMany(PromoCodeUsage::class);
    }
 
    public function notifications()
    {
        return $this->hasMany(UserNotification::class);
    }
 
    // -------------------------------------------------------
    // HELPERS
    // -------------------------------------------------------
 
    public function isAdmin(): bool
    {
        return in_array($this->role, ['admin', 'superadmin']);
    }
 
    public function isSuspended(): bool
    {
        return $this->status === 'suspended';
    }
 
    public function getRemainingCredits(): float
    {
        $wallet = $this->freeCredits;
        if (!$wallet) return 0;
        return $wallet->total_credits - $wallet->used_credits - $wallet->reserved_credits;
    }


}
