<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * API response mein user ka sirf zaroori data jaayega
     * Password, remember_token, internal fields kabhi expose nahi honge
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'name'              => $this->name,
            'email'             => $this->email,
            'role'              => $this->role,
            'status'            => $this->status,
            'email_verified'    => !is_null($this->email_verified_at),
            'avatar'            => $this->avatar_url ?? null,
            'profile'           => $this->whenLoaded('profile', fn() => [
                'company_name'  => $this->profile->company_name,
                'country'       => $this->profile->country,
                'timezone'      => $this->profile->timezone,
                'currency'      => $this->profile->currency,
                'language'      => $this->profile->language,
            ]),
            'created_at'        => $this->created_at?->toDateTimeString(),
        ];
    }
}