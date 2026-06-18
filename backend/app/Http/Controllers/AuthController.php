<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends ApiController
{
    public function register(Request $request): JsonResponse
    {
        $data = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
        ])->validate();

        $token = Str::random(60);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'api_token' => $token,
        ]);

        return $this->createJson([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $data = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ])->validate();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return $this->createJson(['message' => 'Invalid credentials'], 401);
        }

        $token = Str::random(60);
        $user->update(['api_token' => $token]);

        return $this->createJson([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $user->update(['api_token' => null]);

        return $this->noContent();
    }

    public function current(Request $request): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        return $this->createJson(['user' => $user]);
    }
}
