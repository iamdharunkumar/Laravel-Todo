<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Get a list of all users.
     */
    public function users(): JsonResponse
    {
        $users = User::orderBy('name')->get();

        return response()->json(['users' => UserResource::collection($users)]);
    }
}
