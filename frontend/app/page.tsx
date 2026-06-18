"use client";

import { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api";

interface Todo {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("todo_api_token");
}

function saveToken(token: string | null) {
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("todo_api_token", token);
    } else {
      localStorage.removeItem("todo_api_token");
    }
  }
}

async function apiFetch(path: string, token: string | null, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...options.headers,
  } as Record<string, string>;

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw json || { message: response.statusText };
  }

  return json;
}

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  useEffect(() => {
    const stored = getStoredToken();
    if (stored) {
      setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setTodos([]);
      return;
    }

    apiFetch("/me", token)
      .then((data) => setUser(data.user))
      .catch(() => {
        setMessage("Session expired, please log in again.");
        saveToken(null);
        setToken(null);
      });

    apiFetch("/todos", token)
      .then((data) => setTodos(data.todos || []))
      .catch(() => {
        setTodos([]);
      });
  }, [token]);

  const isAuthenticated = Boolean(token && user);

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    try {
      const endpoint = authMode === "login" ? "/login" : "/register";
      const body: Record<string, string> = { email, password };
      if (authMode === "register") {
        body.name = name;
      }

      const data = await apiFetch(endpoint, null, {
        method: "POST",
        body: JSON.stringify(body),
      });

      saveToken(data.token);
      setToken(data.token);
      setUser(data.user);
      setMessage(`${authMode === "login" ? "Logged in" : "Registered"} successfully.`);
    } catch (error: any) {
      setMessage(error?.message || "Authentication failed.");
    }
  };

  const loadTodos = async () => {
    if (!token) {
      return;
    }

    try {
      const data = await apiFetch("/todos", token);
      setTodos(data.todos || []);
    } catch (error) {
      setMessage("Unable to load todos.");
    }
  };

  const handleCreateTodo = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    if (!newTitle.trim()) {
      setMessage("Todo title is required.");
      return;
    }

    try {
      await apiFetch("/todos", token, {
        method: "POST",
        body: JSON.stringify({ title: newTitle, description: newDescription }),
      });
      setNewTitle("");
      setNewDescription("");
      await loadTodos();
    } catch (error: any) {
      setMessage(error?.message || "Unable to create todo.");
    }
  };

  const toggleComplete = async (todo: Todo) => {
    await apiFetch(`/todos/${todo.id}`, token, {
      method: "PUT",
      body: JSON.stringify({ completed: !todo.completed }),
    });
    await loadTodos();
  };

  const deleteTodo = async (id: number) => {
    await apiFetch(`/todos/${id}`, token, { method: "DELETE" });
    await loadTodos();
  };

  const handleLogout = async () => {
    try {
      if (token) {
        await apiFetch("/logout", token, { method: "POST" });
      }
    } catch {
      // ignore
    }
    saveToken(null);
    setToken(null);
    setUser(null);
    setTodos([]);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-slate-900 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
              Todo App
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
              {isAuthenticated ? `Hello, ${user?.name}` : "Sign in to manage your todos"}
            </h1>
          </div>
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Logout
            </button>
          )}
        </header>

        {message && (
          <div className="mb-6 rounded-2xl bg-amber-100 px-4 py-3 text-sm text-amber-900">
            {message}
          </div>
        )}

        {!isAuthenticated ? (
          <form onSubmit={handleAuth} className="grid gap-4">
            {authMode === "register" && (
              <label className="grid gap-2 text-sm text-slate-700">
                Name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-slate-900"
                  placeholder="Your name"
                />
              </label>
            )}
            <label className="grid gap-2 text-sm text-slate-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="you@example.com"
              />
            </label>
            <label className="grid gap-2 text-sm text-slate-700">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-slate-900"
                placeholder="Password"
              />
            </label>
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              {authMode === "login" ? "Login" : "Register"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "login" ? "register" : "login");
                setMessage(null);
              }}
              className="text-sm font-medium text-slate-600 underline-offset-4 transition hover:text-slate-900"
            >
              {authMode === "login" ? "Create an account" : "Already have an account? Log in"}
            </button>
          </form>
        ) : (
          <section className="grid gap-8">
            <form onSubmit={handleCreateTodo} className="grid gap-4 rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
              <h2 className="text-xl font-semibold text-slate-900">Create new todo</h2>
              <label className="grid gap-2 text-sm text-slate-700">
                Title
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  placeholder="Todo title"
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm text-slate-700">
                Description
                <textarea
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="Optional details"
                  rows={3}
                  className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 outline-none transition focus:border-slate-900"
                />
              </label>
              <button
                type="submit"
                className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Add todo
              </button>
            </form>

            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-slate-900">Your todos</h2>
                <button
                  type="button"
                  onClick={loadTodos}
                  className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-900"
                >
                  Refresh
                </button>
              </div>

              <div className="space-y-4">
                {todos.length === 0 ? (
                  <p className="rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-slate-600">
                    No todos yet. Add one to get started.
                  </p>
                ) : (
                  todos.map((todo) => (
                    <div key={todo.id} className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {todo.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleComplete(todo)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${todo.completed ? "bg-emerald-500 text-white" : "border border-slate-200 bg-white text-slate-900 hover:border-slate-900"}`}
                          >
                            {todo.completed ? "Completed" : "Mark complete"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteTodo(todo.id)}
                            className="rounded-full border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
