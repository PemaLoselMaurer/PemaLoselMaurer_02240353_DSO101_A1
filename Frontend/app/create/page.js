"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/tasks";

const initialForm = {
  title: "",
  description: "",
  status: "pending",
  due_date: "",
};

export default function CreateTaskPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function onChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          status: form.status,
          due_date: form.due_date || null,
        }),
      });

      if (!response.ok) {
        throw new Error("Create failed");
      }

      setForm(initialForm);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError("Could not create task. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Task Workspace</p>
        <h1>Create Task</h1>
        <p>Add a new task here, then review it on the Active Tasks page.</p>
        <div className="pageNav">
          <Link href="/create" className="navLink active">
            Create Task
          </Link>
          <Link href="/" className="navLink">
            Active Tasks
          </Link>
          <Link href="/completed" className="navLink">
            Completed Tasks
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>New Task</h2>

        {error && <p className="error">{error}</p>}

        <form onSubmit={onSubmit} className="form">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Write task title"
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={onChange}
            rows={3}
            placeholder="Add details"
          />

          <div className="grid">
            <div>
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={onChange}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label htmlFor="due_date">Due Date</label>
              <input
                id="due_date"
                name="due_date"
                type="date"
                value={form.due_date}
                onChange={onChange}
              />
            </div>
          </div>

          <div className="actions">
            <button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Task"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
