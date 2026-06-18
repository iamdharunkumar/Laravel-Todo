<?php

namespace App\Http\Controllers;

use App\Models\Todo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TodoController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        return $this->createJson(['todos' => $user->todos()->orderByDesc('created_at')->get()]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $data = Validator::make($request->all(), [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ])->validate();

        $todo = $user->todos()->create([
            'title' => $data['title'],
            'description' => $data['description'] ?? '',
            'completed' => false,
        ]);

        return $this->createJson(['todo' => $todo], 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $todo = $user->todos()->find($id);
        if (! $todo) {
            return $this->createJson(['message' => 'Todo not found'], 404);
        }

        return $this->createJson(['todo' => $todo]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $todo = $user->todos()->find($id);
        if (! $todo) {
            return $this->createJson(['message' => 'Todo not found'], 404);
        }

        $data = Validator::make($request->all(), [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'completed' => ['sometimes', 'boolean'],
        ])->validate();

        $todo->update($data);

        return $this->createJson(['todo' => $todo]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $this->requireAuth($request);
        if ($user instanceof JsonResponse) {
            return $user;
        }

        $todo = $user->todos()->find($id);
        if (! $todo) {
            return $this->createJson(['message' => 'Todo not found'], 404);
        }

        $todo->delete();

        return $this->noContent();
    }
}
