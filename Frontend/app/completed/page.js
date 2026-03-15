"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/tasks";

function formatDate(dateValue) {
  if (!dateValue) return "No due date";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "No due date";
  return date.toLocaleDateString();
}

export default function CompletedPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTasks() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL, { cache: "no-store" });
      if (!response.ok) throw new Error("Failed to load tasks");
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError("Could not load tasks. Please ensure backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function onDelete(id) {
    const confirmed = window.confirm("Delete this task?");
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        throw new Error("Delete failed");
      }

      await loadTasks();
    } catch (err) {
      setError("Could not delete task. Please try again.");
    }
  }

  async function onReopen(task) {
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/${task.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: task.title,
          description: task.description || "",
          status: "pending",
          due_date: task.due_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Reopen failed");
      }

      await loadTasks();
    } catch (err) {
      setError("Could not reopen task. Please try again.");
    }
  }

  const completedTasks = tasks.filter((task) => task.status === "done");

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Task Workspace</p>
        <h1>Completed Tasks</h1>
        <p>Review finished work and reopen tasks when needed.</p>
        <div className="pageNav">
          <Link href="/create" className="navLink">
            Create Task
          </Link>
          <Link href="/" className="navLink">
            Active Tasks
          </Link>
          <Link href="/completed" className="navLink active">
            Completed Tasks ({completedTasks.length})
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="listHeader">
          <h2>Completed</h2>
          <span>
            {completedTasks.length}{" "}
            {completedTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : completedTasks.length === 0 ? (
          <p className="muted">No completed tasks yet.</p>
        ) : (
          <ul className="list">
            {completedTasks.map((task) => (
              <li key={task.id} className="item">
                <div>
                  <h3>{task.title}</h3>
                  <p className="meta">Due: {formatDate(task.due_date)}</p>
                  <p className="desc">{task.description || "No description"}</p>
                </div>

                <div className="itemActions">
                  <button
                    type="button"
                    className="small ghost"
                    onClick={() => onReopen(task)}
                  >
                    Reopen
                  </button>
                  <button
                    type="button"
                    className="small danger"
                    onClick={() => onDelete(task.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
