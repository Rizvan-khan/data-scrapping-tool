<?php

namespace App\Services;

use App\Models\FreeCredit;
use App\Models\Invoice;
use App\Models\Plan;
use App\Models\Subscription;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Razorpay\Api\Api;

class SubscriptionService
{
    protected Api $razorpay;

    public function __construct()
    {
        $this->razorpay = new Api(
            config('services.razorpay.key_id'),
            config('services.razorpay.key_secret')
        );
    }

    // ─────────────────────────────────────────────────────────
    // STEP 1: Create Razorpay Order
    // ─────────────────────────────────────────────────────────
    public function createOrder(User $user, Plan $plan): array
    {
        $amountInPaise = (int) ($plan->price * 100); // Razorpay paise mein leta hai

        $order = $this->razorpay->order->create([
            'amount'          => $amountInPaise,
            'currency'        => $plan->currency ?? 'INR',
            'receipt'         => 'rcpt_' . Str::random(10),
            'notes'           => [
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plan'    => $plan->name,
            ],
        ]);

        return [
            'razorpay_order_id' => $order->id,
            'amount'            => $amountInPaise,
            'currency'          => $plan->currency ?? 'INR',
            'plan'              => [
                'id'            => $plan->id,
                'name'          => $plan->name,
                'billing_cycle' => $plan->billing_cycle,
            ],
            'user' => [
                'name'  => $user->name ?? $user->first_name . ' ' . $user->last_name,
                'email' => $user->email,
                'phone' => $user->phone ?? '',
            ],
            'razorpay_key' => config('services.razorpay.key_id'),
        ];
    }

    // ─────────────────────────────────────────────────────────
    // STEP 2: Verify Payment & Activate Subscription
    // ─────────────────────────────────────────────────────────
    public function verifyAndActivate(
        User $user,
        Plan $plan,
        string $orderId,
        string $paymentId,
        string $signature
    ): Subscription {
        // Verify signature
        $this->verifySignature($orderId, $paymentId, $signature);

        DB::beginTransaction();

        try {
            // Cancel any existing active subscription
            Subscription::where('user_id', $user->id)
                ->whereIn('status', ['active', 'trialing'])
                ->update([
                    'status'       => 'cancelled',
                    'cancelled_at' => now(),
                    'auto_renew'   => false,
                ]);

            // Calculate period
            [$startsAt, $endsAt] = $this->calculatePeriod($plan);

            // Create new subscription
            $subscription = Subscription::create([
                'user_id'                  => $user->id,
                'plan_id'                  => $plan->id,
                'status'                   => $plan->trial_days > 0 ? 'trialing' : 'active',
                'starts_at'                => $startsAt,
                'ends_at'                  => $endsAt,
                'trial_ends_at'            => $plan->trial_days > 0
                                                ? now()->addDays($plan->trial_days)
                                                : null,
                'auto_renew'               => true,
                'payment_gateway'          => 'razorpay',
                'gateway_subscription_id'  => $paymentId,
                'current_period_start'     => $startsAt,
                'current_period_end'       => $endsAt,
            ]);

            // Create invoice
            $this->createInvoice($user, $subscription, $plan, $paymentId);

            // Add credits to wallet
            $this->addCreditsToWallet($user, $plan);

            DB::commit();

            return $subscription->load('plan');

        } catch (\Throwable $e) {
            DB::rollBack();
            throw $e;
        }
    }

    // ─────────────────────────────────────────────────────────
    // Cancel Subscription
    // ─────────────────────────────────────────────────────────
    public function cancel(Subscription $subscription, ?string $reason = null): Subscription
    {
        $subscription->update([
            'status'              => 'cancelled',
            'cancelled_at'        => now(),
            'cancellation_reason' => $reason,
            'auto_renew'          => false,
        ]);

        return $subscription->fresh();
    }

    // ─────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────

    private function verifySignature(string $orderId, string $paymentId, string $signature): void
    {
        $expectedSignature = hash_hmac(
            'sha256',
            $orderId . '|' . $paymentId,
            config('services.razorpay.key_secret')
        );

        if (!hash_equals($expectedSignature, $signature)) {
            throw new \Exception('Invalid payment signature. Payment verification failed.');
        }
    }

    private function calculatePeriod(Plan $plan): array
    {
        $startsAt = now();
        $endsAt   = match ($plan->billing_cycle) {
            'monthly'  => now()->addMonth(),
            'yearly'   => now()->addYear(),
            'lifetime' => now()->addYears(100),
            default    => now()->addMonth(),
        };

        return [$startsAt, $endsAt];
    }

    private function createInvoice(User $user, Subscription $subscription, Plan $plan, string $paymentId): void
    {
        $subtotal       = $plan->price;
        $taxPercent     = 18.00; // GST 18%
        $taxAmount      = round($subtotal * $taxPercent / 100, 2);
        $discountAmount = 0;
        $totalAmount    = $subtotal + $taxAmount - $discountAmount;

        Invoice::create([
            'user_id'            => $user->id,
            'subscription_id'    => $subscription->id,
            'invoice_number'     => 'INV-' . strtoupper(Str::random(8)),
            'subtotal'           => $subtotal,
            'discount_amount'    => $discountAmount,
            'tax_percent'        => $taxPercent,
            'tax_amount'         => $taxAmount,
            'total_amount'       => $totalAmount,
            'currency'           => $plan->currency ?? 'INR',
            'status'             => 'paid',
            'payment_method'     => 'razorpay',
            'gateway_payment_id' => $paymentId,
            'paid_at'            => now(),
            'due_at'             => now(),
        ]);
    }

    private function addCreditsToWallet(User $user, Plan $plan): void
    {
        if ($plan->credits_per_cycle <= 0) return;

        $wallet = FreeCredit::firstOrCreate(
            ['user_id' => $user->id],
            [
                'total_credits'    => 0,
                'used_credits'     => 0,
                'reserved_credits' => 0,
                'lifetime_earned'  => 0,
            ]
        );

        $wallet->add($plan->credits_per_cycle);
    }
}