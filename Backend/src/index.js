require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { pool, initDatabase } = require("./db");

const app = express();
const PORT = Number(process.env.PORT || 5000);
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";
const VALID_STATUSES = new Set(["pending", "in-progress", "done"]);

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/tasks", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, title, description, status, due_date, created_at, updated_at FROM tasks ORDER BY id DESC",
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch tasks." });
  }
});

app.get("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const result = await pool.query(
      "SELECT id, title, description, status, due_date, created_at, updated_at FROM tasks WHERE id = $1",
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch task." });
  }
});

app.post("/api/tasks", async (req, res) => {
  try {
    const {
      title,
      description = "",
      status = "pending",
      due_date = null,
    } = req.body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ message: "Title is required." });
    }

    if (!VALID_STATUSES.has(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks (title, description, status, due_date)
      VALUES ($1, $2, $3, $4)
      RETURNING id, title, description, status, due_date, created_at, updated_at
      `,
      [title.trim(), String(description).trim(), status, due_date || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create task." });
  }
});

app.put("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const current = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);
    if (current.rowCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    const existingTask = current.rows[0];
    const nextTitle = req.body.title ?? existingTask.title;
    const nextDescription = req.body.description ?? existingTask.description;
    const nextStatus = req.body.status ?? existingTask.status;
    const nextDueDate =
      req.body.due_date !== undefined
        ? req.body.due_date
        : existingTask.due_date;

    if (!nextTitle || typeof nextTitle !== "string" || !nextTitle.trim()) {
      return res
        .status(400)
        .json({ message: "Title must be a non-empty string." });
    }

    if (!VALID_STATUSES.has(nextStatus)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const result = await pool.query(
      `
      UPDATE tasks
      SET title = $1,
          description = $2,
          status = $3,
          due_date = $4,
          updated_at = NOW()
      WHERE id = $5
      RETURNING id, title, description, status, due_date, created_at, updated_at
      `,
      [
        nextTitle.trim(),
        String(nextDescription).trim(),
        nextStatus,
        nextDueDate || null,
        id,
      ],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update task." });
  }
});

app.delete("/api/tasks/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid task id." });
    }

    const result = await pool.query("DELETE FROM tasks WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete task." });
  }
});

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database initialization failed:", error.message);
    process.exit(1);
  });
