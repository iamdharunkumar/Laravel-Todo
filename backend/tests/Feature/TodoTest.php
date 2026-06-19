<?php

use App\Models\Todo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated user cannot perform todo actions', function () {
    $this->getJson('/api/todos')->assertStatus(401);
    $this->postJson('/api/todos', ['title' => 'Test'])->assertStatus(401);
    $this->getJson('/api/todos/1')->assertStatus(401);
    $this->putJson('/api/todos/1', ['title' => 'Updated'])->assertStatus(401);
    $this->deleteJson('/api/todos/1')->assertStatus(401);
});

test('user can list their own todos', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    Todo::factory()->count(3)->create(['user_id' => $user->id]);
    Todo::factory()->count(2)->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/todos');

    $response->assertStatus(200)
        ->assertJsonCount(3, 'todos')
        ->assertJsonStructure([
            'todos' => [
                '*' => ['id', 'title', 'description', 'completed', 'created_at', 'updated_at']
            ]
        ]);
});

test('user can create a todo', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user, 'sanctum')->postJson('/api/todos', [
        'title' => 'Buy milk',
        'description' => 'Remember to buy organic milk.',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'todo' => ['id', 'title', 'description', 'completed', 'created_at', 'updated_at']
        ])
        ->assertJson([
            'todo' => [
                'title' => 'Buy milk',
                'description' => 'Remember to buy organic milk.',
                'completed' => false,
            ]
        ]);

    $this->assertDatabaseHas('todos', [
        'user_id' => $user->id,
        'title' => 'Buy milk',
    ]);
});

test('user can view their own todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson("/api/todos/{$todo->id}");

    $response->assertStatus(200)
        ->assertJsonPath('todo.id', $todo->id);
});

test('user cannot view another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user, 'sanctum')->getJson("/api/todos/{$todo->id}");

    $response->assertStatus(403);
});

test('user can update their own todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->create([
        'user_id' => $user->id,
        'title' => 'Original Title',
        'completed' => false,
    ]);

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/todos/{$todo->id}", [
        'title' => 'New Title',
        'completed' => true,
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('todo.title', 'New Title')
        ->assertJsonPath('todo.completed', true);

    $this->assertDatabaseHas('todos', [
        'id' => $todo->id,
        'title' => 'New Title',
        'completed' => true,
    ]);
});

test('user cannot update another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->create(['user_id' => $otherUser->id, 'title' => 'Original']);

    $response = $this->actingAs($user, 'sanctum')->putJson("/api/todos/{$todo->id}", [
        'title' => 'New Title',
    ]);

    $response->assertStatus(403);
});

test('user can delete their own todo', function () {
    $user = User::factory()->create();
    $todo = Todo::factory()->create(['user_id' => $user->id]);

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/todos/{$todo->id}");

    $response->assertStatus(204);

    $this->assertDatabaseMissing('todos', [
        'id' => $todo->id,
    ]);
});

test('user cannot delete another users todo', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $todo = Todo::factory()->create(['user_id' => $otherUser->id]);

    $response = $this->actingAs($user, 'sanctum')->deleteJson("/api/todos/{$todo->id}");

    $response->assertStatus(403);

    $this->assertDatabaseHas('todos', [
        'id' => $todo->id,
    ]);
});
