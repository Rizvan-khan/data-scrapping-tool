<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Subscription;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    // ─────────────────────────────────────────────────────────
    // POST /api/webhooks/razorpay  (public — no auth)
    // ─────────────────────────────────────────────────────────
    public function razorpay(Request $request): JsonResponse
    {
        // Verify webhook signature
        $webhookSecret    = config('services.razorpay.webhook_secret');
        $webhookSignature = $request->header('X-Razorpay-Signature');
        $payload          = $request->getContent();

        $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);

        if (!hash_equals($expectedSignature, $webhookSignature ?? '')) {
            Log::warning('Razorpay webhook: invalid signature');
            return response()->json(['message' => 'Invalid signature.'], 400);
        }

        $event = $request->input('event');
        $data  = $request->input('payload.payment.entity', []);

        Log::info('Razorpay webhook received', ['event' => $event]);

        match ($event) {
            'payment.captured'           => $this->handlePaymentCaptured($data),
            'payment.failed'             => $this->handlePaymentFailed($data),
            'subscription.activated'     => $this->handleSubscriptionActivated($data),
            'subscription.charged'       => $this->handleSubscriptionCharged($data),
            'subscription.cancelled'     => $this->handleSubscriptionCancelled($data),
            'subscription.completed'     => $this->handleSubscriptionExpired($data),
            default                      => Log::info('Razorpay webhook: unhandled event', ['event' => $event]),
        };

        return response()->json(['message' => 'Webhook processed.'], 200);
    }

    // ─────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────

    private function handlePaymentCaptured(array $data): void
    {
        // Payment successful — subscription verify-payment API already handle karti hai
        // Yahan sirf log karo
        Log::info('Payment captured', ['payment_id' => $data['id'] ?? null]);
    }

    private function handlePaymentFailed(array $data): void
    {
        $paymentId = $data['id'] ?? null;
        if (!$paymentId) return;

        Subscription::where('gateway_subscription_id', $paymentId)
            ->whereIn('status', ['active', 'trialing'])
            ->update(['status' => 'past_due']);

        Log::warning('Payment failed — subscription set to past_due', ['payment_id' => $paymentId]);
    }

    private function handleSubscriptionActivated(array $data): void
    {
        $gatewayId = $data['id'] ?? null;
        if (!$gatewayId) return;

        Subscription::where('gateway_subscription_id', $gatewayId)
            ->update(['status' => 'active']);

        Log::info('Subscription activated via webhook', ['gateway_id' => $gatewayId]);
    }

    private function handleSubscriptionCharged(array $data): void
    {
        // Auto-renew successful — period extend karo
        $gatewayId = $data['subscription_id'] ?? null;
        if (!$gatewayId) return;

        $subscription = Subscription::where('gateway_subscription_id', $gatewayId)->first();
        if (!$subscription) return;

        $plan    = $subscription->plan;
        $newEnd  = match ($plan->billing_cycle) {
            'monthly' => now()->addMonth(),
            'yearly'  => now()->addYear(),
            default   => now()->addMonth(),
        };

        $subscription->update([
            'status'               => 'active',
            'ends_at'              => $newEnd,
            'current_period_start' => now(),
            'current_period_end'   => $newEnd,
        ]);

        // Credits reset on renewal
        $wallet = $subscription->user->freeCredit;
        if ($wallet && $plan->credits_per_cycle > 0) {
            $wallet->add($plan->credits_per_cycle);
        }

        Log::info('Subscription renewed via webhook', ['subscription_id' => $subscription->id]);
    }

    private function handleSubscriptionCancelled(array $data): void
    {
        $gatewayId = $data['id'] ?? null;
        if (!$gatewayId) return;

        Subscription::where('gateway_subscription_id', $gatewayId)
            ->update([
                'status'       => 'cancelled',
                'cancelled_at' => now(),
                'auto_renew'   => false,
            ]);

        Log::info('Subscription cancelled via webhook', ['gateway_id' => $gatewayId]);
    }

    private function handleSubscriptionExpired(array $data): void
    {
        $gatewayId = $data['id'] ?? null;
        if (!$gatewayId) return;

        Subscription::where('gateway_subscription_id', $gatewayId)
            ->update(['status' => 'expired']);

        Log::info('Subscription expired via webhook', ['gateway_id' => $gatewayId]);
    }
}