<?php

namespace App\Http\Requests\User;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'          => ['sometimes', 'string', 'min:2', 'max:100'],
            'company_name'  => ['sometimes', 'nullable', 'string', 'max:150'],
            'country'       => ['sometimes', 'nullable', 'string', 'max:100'],
            'timezone'      => ['sometimes', 'nullable', 'string', 'max:100'],
            'currency'      => ['sometimes', 'nullable', 'string', 'size:3'],   // e.g. INR, USD
            'language'      => ['sometimes', 'nullable', 'string', 'max:10'],   // e.g. en, hi
            'address_line1' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address_line2' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city'          => ['sometimes', 'nullable', 'string', 'max:100'],
            'state'         => ['sometimes', 'nullable', 'string', 'max:100'],
            'postal_code'   => ['sometimes', 'nullable', 'string', 'max:20'],
            'gstin'         => ['sometimes', 'nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.min'         => 'Name must be at least 2 characters.',
            'currency.size'    => 'Currency must be a 3-letter code (e.g. INR, USD).',
        ];
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}