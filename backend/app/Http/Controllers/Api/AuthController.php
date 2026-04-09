<?php

namespace App\Http\Controllers\Api;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        // Token create
        $token = $user->createToken('mytoken')->plainTextToken;

        return response()->json([
            'message' => 'User Registered',
            'token' => $token
        ]);
    }


        public function login(Request $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid Credentials'], 401);
        }

        $token = $user->createToken('logintoken')->plainTextToken;

        return response()->json([
            'message' => 'Login Success',
            'token' => $token
        ]);
    }



        public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out'
        ]);
    }

    
}
