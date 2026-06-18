<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

abstract class ApiController extends Controller
{
    protected function createJson(mixed $data, int $status = 200): JsonResponse
    {
        return response()->json($data, $status)->withHeaders($this->corsHeaders());
    }

    protected function noContent(): JsonResponse
    {
        return response()->json(null, 204)->withHeaders($this->corsHeaders());
    }

    protected function corsHeaders(): array
    {
        return [
            'Access-Control-Allow-Origin' => '*',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers' => 'Accept, Authorization, Content-Type, X-Requested-With',
        ];
    }

    protected function userFromRequest(Request $request): ?User
    {
        $token = $request->bearerToken() ?? $request->input('api_token');

        if (! $token) {
            return null;
        }

        return User::where('api_token', $token)->first();
    }

    protected function requireAuth(Request $request): User|JsonResponse
    {
        $user = $this->userFromRequest($request);

        if (! $user) {
            return $this->createJson(['message' => 'Unauthenticated'], 401);
        }

        return $user;
    }
}
