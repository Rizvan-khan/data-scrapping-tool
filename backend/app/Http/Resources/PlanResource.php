<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'slug'             => $this->slug,
            'description'      => $this->description,
            'billing_cycle'    => $this->billing_cycle,
            'price'            => (float) $this->price,
            'currency'         => $this->currency,
            'is_free'          => $this->isFree(),
            'is_featured'      => $this->is_featured,
            'trial_days'       => $this->trial_days,
            'credits_per_cycle'=> $this->credits_per_cycle,
            'sort_order'       => $this->sort_order,
            'features'         => $this->whenLoaded('features', function () {
                return $this->features->map(fn ($f) => [
                    'key'        => $f->feature_key,
                    'label'      => $f->display_label,
                    'value'      => $f->casted_value,
                    'value_type' => $f->value_type,
                ]);
            }),
        ];
    }
}