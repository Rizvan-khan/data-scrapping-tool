<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'device'     => $this->name,             // Sanctum token name
            'ip_address' => $this->ip_address ?? null,
            'last_used'  => $this->last_used_at?->diffForHumans(),  // "2 hours ago"
            'created_at' => $this->created_at?->toDateTimeString(),
            'is_current' => $this->id === $request->user()->currentAccessToken()->id,
        ];
    }
}