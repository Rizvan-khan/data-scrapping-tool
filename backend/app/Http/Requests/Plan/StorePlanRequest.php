<?php

namespace App\Http\Requests\Plan;

use Illuminate\Foundation\Http\FormRequest;

class StorePlanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name'              => ['required', 'string', 'max:100'],
            'slug'              => ['required', 'string', 'max:100', 'unique:plans,slug', 'regex:/^[a-z0-9\-]+$/'],
            'description'       => ['nullable', 'string', 'max:500'],
            'billing_cycle'     => ['required', 'in:monthly,yearly,lifetime'],
            'price'             => ['required', 'numeric', 'min:0'],
            'currency'          => ['sometimes', 'string', 'size:3'],
            'trial_days'        => ['sometimes', 'integer', 'min:0', 'max:365'],
            'credits_per_cycle' => ['required', 'integer', 'min:0'],
            'is_active'         => ['sometimes', 'boolean'],
            'is_featured'       => ['sometimes', 'boolean'],
            'sort_order'        => ['sometimes', 'integer', 'min:0'],

            'features'                     => ['sometimes', 'array'],
            'features.*.feature_key'       => ['required_with:features', 'string', 'max:100'],
            'features.*.display_label'     => ['required_with:features', 'string', 'max:150'],
            'features.*.feature_value'     => ['required_with:features', 'string', 'max:255'],
            'features.*.value_type'        => ['required_with:features', 'in:integer,boolean,decimal,string'],
        ];
    }

    public function messages(): array
    {
        return [
            'slug.regex'       => 'Slug can only contain lowercase letters, numbers and hyphens.',
            'slug.unique'      => 'This slug is already taken.',
            'billing_cycle.in' => 'Billing cycle must be monthly, yearly or lifetime.',
        ];
    }
}