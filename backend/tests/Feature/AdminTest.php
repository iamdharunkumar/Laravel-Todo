<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('unauthenticated user cannot retrieve users list', function () {
    $this->getJson('/api/admin/users')->assertStatus(401);
});

test('regular user cannot retrieve users list', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user, 'sanctum')->getJson('/api/admin/users');

    $response->assertStatus(403);
});

test('admin user can retrieve users list', function () {
    $admin = User::factory()->create(['role' => 'admin']);
    $user1 = User::factory()->create(['name' => 'Alice', 'role' => 'user']);
    $user2 = User::factory()->create(['name' => 'Bob', 'role' => 'user']);

    $response = $this->actingAs($admin, 'sanctum')->getJson('/api/admin/users');

    $response->assertStatus(200)
        ->assertJsonStructure([
            'users' => [
                '*' => ['id', 'name', 'email', 'role', 'created_at', 'updated_at']
            ]
        ])
        ->assertJsonCount(3, 'users');
});
