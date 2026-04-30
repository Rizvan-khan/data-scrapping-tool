<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\SubscriptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionController extends Controller
{
    public function __construct(protected SubscriptionService $service) {}

    // ─────────────────────────────────────────────────────────
    // POST /api/subscriptions/create-order
    // ─────────────────────────────────────────────────────────
    public function createOrder(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id'       => ['required', 'exists:plans,id'],
            'billing_cycle' => ['required', 'in:monthly,yearly,lifetime'],
        ]);

        $plan = Plan::active()
            ->where('id', $request->plan_id)
            ->where('billing_cycle', $request->billing_cycle)
            ->firstOrFail();

        // Free plan ke liye Razorpay order nahi chahiye
        if ($plan->isFree()) {
            return response()->json([
                'success' => false,
                'message' => 'No payment need to required for free plan.',
            ], 422);
        }

        try {
            $orderData = $this->service->createOrder($request->user(), $plan);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully.',
                'data'    => $orderData,
            ]);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/subscriptions/verify-payment
    // ─────────────────────────────────────────────────────────
    public function verifyPayment(Request $request): JsonResponse
    {
        $request->validate([
            'plan_id'              => ['required', 'exists:plans,id'],
            'billing_cycle'        => ['required', 'in:monthly,yearly,lifetime'],
            'razorpay_order_id'    => ['required', 'string'],
            'razorpay_payment_id'  => ['required', 'string'],
            'razorpay_signature'   => ['required', 'string'],
        ]);

        $plan = Plan::where('id', $request->plan_id)
            ->where('billing_cycle', $request->billing_cycle)
            ->firstOrFail();

        try {
            $subscription = $this->service->verifyAndActivate(
                $request->user(),
                $plan,
                $request->razorpay_order_id,
                $request->razorpay_payment_id,
                $request->razorpay_signature
            );

            return response()->json([
                'success' => true,
                'message' => 'Payment verified. Subscription activated successfully.',
                'data'    => [
                    'subscription_id' => $subscription->id,
                    'plan'            => $subscription->plan->name,
                    'status'          => $subscription->status,
                    'starts_at'       => $subscription->starts_at,
                    'ends_at'         => $subscription->ends_at,
                    'credits_added'   => $plan->credits_per_cycle,
                ],
            ]);

        } catch (\Exception $e) {
            if (str_contains($e->getMessage(), 'signature')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed. Invalid signature.',
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed. Please contact support.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/subscriptions/current
    // ─────────────────────────────────────────────────────────
    public function current(Request $request): JsonResponse
    {
        $subscription = Subscription::where('user_id', $request->user()->id)
            ->whereIn('status', ['active', 'trialing'])
            ->with('plan.features')
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => true,
                'data'    => null,
                'message' => 'No active subscription found.',
            ]);
        }

        return response()->json([
            'success' => true,
            'data'    => [
                'id'             => $subscription->id,
                'status'         => $subscription->status,
                'plan'           => [
                    'id'               => $subscription->plan->id,
                    'name'             => $subscription->plan->name,
                    'slug'             => $subscription->plan->slug,
                    'billing_cycle'    => $subscription->plan->billing_cycle,
                    'price'            => (float) $subscription->plan->price,
                    'credits_per_cycle'=> $subscription->plan->credits_per_cycle,
                    'features'         => $subscription->plan->features->map(fn($f) => [
                        'key'   => $f->feature_key,
                        'label' => $f->display_label,
                        'value' => $f->casted_value,
                    ]),
                ],
                'starts_at'            => $subscription->starts_at,
                'ends_at'              => $subscription->ends_at,
                'trial_ends_at'        => $subscription->trial_ends_at,
                'days_remaining'       => $subscription->daysRemaining(),
                'auto_renew'           => $subscription->auto_renew,
                'current_period_start' => $subscription->current_period_start,
                'current_period_end'   => $subscription->current_period_end,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // POST /api/subscriptions/cancel
    // ─────────────────────────────────────────────────────────
    public function cancel(Request $request): JsonResponse
    {
        $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $subscription = Subscription::where('user_id', $request->user()->id)
            ->whereIn('status', ['active', 'trialing'])
            ->latest()
            ->first();

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found to cancel.',
            ], 404);
        }

        $subscription = $this->service->cancel($subscription, $request->reason);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled successfully. Access will continue until ' .
                         $subscription->ends_at?->format('d M Y') . '.',
            'data'    => [
                'status'       => $subscription->status,
                'cancelled_at' => $subscription->cancelled_at,
                'ends_at'      => $subscription->ends_at,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // GET /api/subscriptions/invoices
    // ─────────────────────────────────────────────────────────
    public function invoices(Request $request): JsonResponse
    {
        $invoices = \App\Models\Invoice::where('user_id', $request->user()->id)
            ->with('subscription.plan')
            ->latest()
            ->paginate(10);


        $data = $invoices->map(fn($inv) => [
            'id'                 => $inv->id,
            'invoice_number'     => $inv->invoice_number,
            'plan'               => $inv->subscription?->plan?->name,
            'subtotal'           => (float) $inv->subtotal,
            'tax_percent'        => (float) $inv->tax_percent,
            'tax_amount'         => (float) $inv->tax_amount,
            'discount_amount'    => (float) $inv->discount_amount,
            'total_amount'       => (float) $inv->total_amount,
            'currency'           => $inv->currency,
            'status'             => $inv->status,
            'payment_method'     => $inv->payment_method,
            'gateway_payment_id' => $inv->gateway_payment_id,
            'paid_at'            => $inv->paid_at,
            'created_at'         => $inv->created_at,
        ]);

        return response()->json([
            'success' => true,
            'data'    => $data,
            'meta'    => [
                'current_page' => $invoices->currentPage(),
                'last_page'    => $invoices->lastPage(),
                'total'        => $invoices->total(),
            ],
        ]);
    }
}