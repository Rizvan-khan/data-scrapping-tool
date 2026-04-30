<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Plan\StorePlanRequest;
use App\Http\Resources\PlanResource;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    // ─────────────────────────────────────────────────────────
    // PUBLIC — GET /api/plans
    // ─────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $plans = Plan::active()
            ->ordered()
            ->with('features')
            ->get();

        return response()->json([
            'success' => true,
            'data'    => PlanResource::collection($plans),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // PUBLIC — GET /api/plans/{slug}
    // ─────────────────────────────────────────────────────────
    public function show(string $slug): JsonResponse
    {
        $plan = Plan::active()
            ->where('slug', $slug)
            ->with('features')
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data'    => new PlanResource($plan),
        ]);
    }

    // ─────────────────────────────────────────────────────────
    // ADMIN — POST /api/admin/plans
    // ─────────────────────────────────────────────────────────
    public function store(StorePlanRequest $request): JsonResponse
    {
        DB::beginTransaction();

        try {
            $plan = Plan::create([
                'name'               => $request->name,
                'slug'               => $request->slug,
                'description'        => $request->description,
                'billing_cycle'      => $request->billing_cycle,
                'price'              => $request->price,
                'currency'           => $request->currency ?? 'INR',
                'trial_days'         => $request->trial_days ?? 0,
                'credits_per_cycle'  => $request->credits_per_cycle,
                'is_active'          => $request->is_active ?? true,
                'is_featured'        => $request->is_featured ?? false,
                'sort_order'         => $request->sort_order ?? 0,
            ]);

            if ($request->has('features') && is_array($request->features)) {
                $features = array_map(fn ($f) => [
                    'plan_id'       => $plan->id,
                    'feature_key'   => $f['feature_key'],
                    'display_label' => $f['display_label'],
                    'feature_value' => $f['feature_value'],
                    'value_type'    => $f['value_type'],
                    'created_at'    => now(),
                ], $request->features);

                $plan->features()->insert($features);
            }

            DB::commit();

            $plan->load('features');

            return response()->json([
                'success' => true,
                'message' => 'Plan created successfully.',
                'data'    => new PlanResource($plan),
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Failed to create plan. Please try again.',
                'error'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }
}