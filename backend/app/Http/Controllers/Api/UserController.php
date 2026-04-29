<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\ChangePasswordRequest;
use App\Http\Requests\User\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Http\Resources\UserSessionResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class UserController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────
    // GET PROFILE
    // ─────────────────────────────────────────────

    public function getProfile(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile');

        return $this->success(
            new UserResource($user),
            'Profile fetched successfully.'
        );
    }

    // ─────────────────────────────────────────────
    // UPDATE PROFILE
    // ─────────────────────────────────────────────

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        // User table fields
        if ($request->has('name')) {
            $user->update(['name' => $request->name]);
        }

        // UserProfile table fields
        $profileFields = [
            'company_name', 'country', 'timezone',
            'currency', 'language', 'address_line1',
            'address_line2', 'city', 'state',
            'postal_code', 'gstin',
        ];

        $profileData = $request->only($profileFields);

        if (!empty($profileData)) {
            // Profile exist kare ya na kare, dono handle hoga
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                $profileData
            );
        }

        $user->load('profile');

        return $this->success(
            new UserResource($user),
            'Profile updated successfully.'
        );
    }

    // ─────────────────────────────────────────────
    // CHANGE PASSWORD
    // ─────────────────────────────────────────────

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        // Current password verify karo
        if (!Hash::check($request->current_password, $user->password)) {
            return $this->badRequest('Current password is incorrect.');
        }

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Security: password change hone ke baad sare purane tokens delete karo
        // Current token ko rehne do taaki user logged in rahe
        $currentTokenId = $user->currentAccessToken()->id;
        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return $this->message('Password changed successfully.');
    }

    // ─────────────────────────────────────────────
    // UPDATE AVATAR
    // ─────────────────────────────────────────────

    public function updateAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'], // max 2MB
        ]);

        $user = $request->user();

        // Purana avatar delete karo agar hai
        if ($user->avatar && Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        // Naya avatar store karo
        $path = $request->file('avatar')->store('avatars', 'public');

        $user->update(['avatar' => $path]);

        return $this->success([
            'avatar_url' => Storage::disk('public')->url($path),
        ], 'Avatar updated successfully.');
    }

    // ─────────────────────────────────────────────
    // DELETE AVATAR
    // ─────────────────────────────────────────────

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->avatar) {
            return $this->notFound('No avatar found.');
        }

        if (Storage::disk('public')->exists($user->avatar)) {
            Storage::disk('public')->delete($user->avatar);
        }

        $user->update(['avatar' => null]);

        return $this->message('Avatar removed successfully.');
    }

    // ─────────────────────────────────────────────
    // GET SESSIONS (Active devices)
    // ─────────────────────────────────────────────

    public function getSessions(Request $request): JsonResponse
    {
        $sessions = $request->user()
            ->tokens()
            ->latest()
            ->get();

        return $this->success(
            UserSessionResource::collection($sessions),
            'Sessions fetched successfully.'
        );
    }

    // ─────────────────────────────────────────────
    // REVOKE SPECIFIC SESSION
    // ─────────────────────────────────────────────

    public function revokeSession(Request $request, int $id): JsonResponse
    {
        $token = $request->user()->tokens()->find($id);

        if (!$token) {
            return $this->notFound('Session not found.');
        }

        // Current session ko delete nahi kar sakte is route se
        if ($token->id === $request->user()->currentAccessToken()->id) {
            return $this->badRequest('Cannot revoke current session. Use logout instead.');
        }

        $token->delete();

        return $this->message('Session revoked successfully.');
    }

    // ─────────────────────────────────────────────
    // REVOKE ALL SESSIONS (Except current)
    // ─────────────────────────────────────────────

    public function revokeAllSessions(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $request->user()
            ->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();

        return $this->message('All other sessions revoked successfully.');
    }
}