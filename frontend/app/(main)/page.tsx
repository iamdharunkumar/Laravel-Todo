"use client";

import React, { useMemo, useState } from "react";
import { useTodos } from "@/hooks/use-todos";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const { todos, loading, error, refresh, createTodo, toggleComplete, deleteTodo } =
    useTodos();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, rate };
  }, [todos]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setCreateLoading(true);
    setCreateError(null);
    try {
      await createTodo(title, description);
      setTitle("");
      setDescription("");
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create task");
    } finally {
      setCreateLoading(false);
    }
  };

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch =
        todo.title.toLowerCase().includes(search.toLowerCase()) ||
        (todo.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && !todo.completed) ||
        (filter === "completed" && todo.completed);

      return matchesSearch && matchesFilter;
    });
  }, [todos, search, filter]);

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      {/* Sidebar: Form Creator */}
      <div className="lg:col-span-1 space-y-6">
        <form
          onSubmit={handleCreate}
          className="rounded-[2rem] border border-zinc-850 bg-zinc-950/60 backdrop-blur-xl p-6 shadow-xl"
        >
          <h2 className="text-lg font-semibold text-zinc-100 mb-4.5 flex items-center gap-2">
            <svg
              className="w-5 h-5 text-violet-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Task
          </h2>

          {createError && (
            <div className="mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-xs text-rose-300">
              {createError}
            </div>
          )}

          <div className="grid gap-4.5">
            <Input
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createLoading}
            />
            <Textarea
              placeholder="Optional description details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createLoading}
              rows={3}
            />
            <Button type="submit" loading={createLoading} className="w-full mt-1">
              Add Task
            </Button>
          </div>
        </form>

        {/* Stats Widget */}
        <div className="rounded-[2rem] border border-zinc-855 bg-zinc-950/45 p-6 shadow-xl space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
            Metrics Analytics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-900">
              <span className="text-xs text-zinc-400 font-medium">Completed</span>
              <p className="text-2xl font-semibold text-emerald-400 mt-1">
                {stats.completed}/{stats.total}
              </p>
            </div>
            <div className="bg-zinc-900/30 rounded-2xl p-4 border border-zinc-900">
              <span className="text-xs text-zinc-400 font-medium">Rate</span>
              <p className="text-2xl font-semibold text-violet-400 mt-1">
                {stats.rate}%
              </p>
            </div>
          </div>
          <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Section: Todo Lists, Search and Filter Tabs */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
          {/* Search bar */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-4 flex items-center text-zinc-500">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl bg-zinc-950/45 border border-zinc-800/80 pl-11 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-violet-500 transition duration-300"
            />
          </div>

          <Button variant="outline" onClick={refresh} className="self-end sm:self-auto py-2.5">
            <svg
              className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17"
              />
            </svg>
            Sync
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-zinc-900 pb-px gap-6">
          {(["all", "active", "completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`pb-3 text-sm font-semibold capitalize relative transition duration-300 outline-none ${
                filter === t ? "text-violet-400" : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {t}
              {filter === t && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-400 rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Todo List Cards */}
        {error && (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-4.5 py-4 text-sm text-rose-400">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <div className="text-center rounded-[2rem] border border-dashed border-zinc-800/80 bg-zinc-950/20 py-16 px-4">
              <svg
                className="mx-auto h-10 w-10 text-zinc-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h3 className="text-base font-semibold text-zinc-400">
                {search ? "No matches found" : "All clean!"}
              </h3>
              <p className="mt-1 text-sm text-zinc-500 max-w-xs mx-auto">
                {search
                  ? "Try refining your keyword search terms."
                  : "Enjoy your day! Or create a new todo to start planning."}
              </p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="group rounded-[2rem] border border-zinc-850 bg-zinc-950/45 p-5 shadow-sm hover:border-zinc-800 hover:bg-zinc-950/80 transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="space-y-1">
                    <h3
                      className={`text-base font-semibold text-zinc-100 transition-all duration-300 ${
                        todo.completed ? "line-through text-zinc-500" : ""
                      }`}
                    >
                      {todo.title}
                    </h3>
                    {todo.description && (
                      <p
                        className={`text-sm text-zinc-400 leading-relaxed ${
                          todo.completed ? "line-through text-zinc-600" : ""
                        }`}
                      >
                        {todo.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => toggleComplete(todo)}
                      className={`rounded-full px-4.5 py-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                        todo.completed
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25"
                          : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600 hover:text-zinc-200"
                      }`}
                    >
                      {todo.completed ? "Completed" : "Complete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTodo(todo.id)}
                      className="rounded-full bg-zinc-900 border border-zinc-800 p-2.5 text-zinc-500 hover:text-rose-400 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all duration-300 cursor-pointer"
                      title="Delete Task"
                    >
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
