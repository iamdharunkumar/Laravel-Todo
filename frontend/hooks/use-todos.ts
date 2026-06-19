"use client";

import { useCallback, useEffect, useState } from "react";
import { Todo } from "@/types";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/context/auth-context";

export function useTodos() {
  const { isAuthenticated } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ todos: Todo[] }>("/todos");
      setTodos(res.todos || []);
    } catch (err: any) {
      setError(err?.message || "Failed to load todos");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTodos();
    } else {
      setTodos([]);
    }
  }, [isAuthenticated, fetchTodos]);

  const createTodo = async (title: string, description?: string) => {
    setError(null);
    try {
      const res = await apiFetch<{ todo: Todo }>("/todos", {
        method: "POST",
        body: JSON.stringify({ title, description }),
      });
      setTodos((prev) => [res.todo, ...prev]);
    } catch (err: any) {
      setError(err?.message || "Failed to create todo");
      throw err;
    }
  };

  const toggleComplete = async (todo: Todo) => {
    setError(null);
    try {
      const res = await apiFetch<{ todo: Todo }>(`/todos/${todo.id}`, {
        method: "PUT",
        body: JSON.stringify({ completed: !todo.completed }),
      });
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? res.todo : t))
      );
    } catch (err: any) {
      setError(err?.message || "Failed to update todo");
      throw err;
    }
  };

  const deleteTodo = async (id: number) => {
    setError(null);
    try {
      await apiFetch(`/todos/${id}`, { method: "DELETE" });
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err?.message || "Failed to delete todo");
      throw err;
    }
  };

  return {
    todos,
    loading,
    error,
    refresh: fetchTodos,
    createTodo,
    toggleComplete,
    deleteTodo,
  };
}
