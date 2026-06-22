<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTodoRequest;
use App\Http\Requests\UpdateTodoRequest;
use App\Http\Resources\TodoResource;
use App\Models\Todo;
use App\Notifications\TodoCreated;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;

class TodoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $todos = $request->user()->todos()->orderByDesc('created_at')->get();

        return response()->json(['todos' => TodoResource::collection($todos)]);
    }

    public function store(StoreTodoRequest $request): JsonResponse
    {
        Gate::authorize('create', Todo::class);

        $todo = $request->user()->todos()->create($request->validated());

        // Dispatch notification to queue for async email delivery
        Notification::send($request->user(), new TodoCreated($todo));

        return response()->json(['todo' => new TodoResource($todo)], 201);
    }

    public function show(Todo $todo): JsonResponse
    {
        Gate::authorize('view', $todo);

        return response()->json(['todo' => new TodoResource($todo)]);
    }

    public function update(UpdateTodoRequest $request, Todo $todo): JsonResponse
    {
        Gate::authorize('update', $todo);

        $todo->update($request->validated());

        return response()->json(['todo' => new TodoResource($todo)]);
    }

    public function destroy(Todo $todo): JsonResponse
    {
        Gate::authorize('delete', $todo);

        $todo->delete();

        return response()->json(null, 204);
    }
}

