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

function statusLabel(status) {
  if (status === "in-progress") return "In Progress";
  if (status === "done") return "Done";
  return "Pending";
}

export default function Page() {
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

  async function onComplete(task) {
    if (task.status === "done") return;

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
          status: "done",
          due_date: task.due_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Complete failed");
      }

      await loadTasks();
    } catch (err) {
      setError("Could not mark task as complete. Please try again.");
    }
  }

  const activeTasks = tasks.filter((task) => task.status !== "done");
  const completedCount = tasks.filter((task) => task.status === "done").length;

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Task Workspace</p>
        <h1>Strategize Swiftly, Execute Sharply</h1>
        <p>Waste no time on the start; leave no flaws at the finish.</p>
        <div className="pageNav">
          <Link href="/create" className="navLink">
            Create Task
          </Link>
          <Link href="/" className="navLink active">
            Active Tasks
          </Link>
          <Link href="/completed" className="navLink">
            Completed Tasks ({completedCount})
          </Link>
        </div>
      </section>

      <section className="card">
        <div className="listHeader">
          <h2>Active Tasks</h2>
          <span>
            {activeTasks.length} {activeTasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="muted">Loading tasks...</p>
        ) : activeTasks.length === 0 ? (
          <p className="muted">No active tasks. Check the completed page.</p>
        ) : (
          <ul className="list">
            {activeTasks.map((task) => (
              <li key={task.id} className="item">
                <div>
                  <h3>{task.title}</h3>
                  <p className="meta">
                    <span className={`pill pill-${task.status}`}>
                      {statusLabel(task.status)}
                    </span>
                    Due: {formatDate(task.due_date)}
                  </p>
                  <p className="desc">{task.description || "No description"}</p>
                </div>

                <div className="itemActions">
                  <button
                    type="button"
                    className="small complete"
                    onClick={() => onComplete(task)}
                    disabled={task.status === "done"}
                  >
                    {task.status === "done" ? "Completed" : "Complete"}
                  </button>
                  <button
                    type="button"
                    className="small"
                    onClick={() => onEdit(task)}
                  >
                    Edit
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
