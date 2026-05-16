const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "chatwave_super_secret_key_2024";

// ── In-memory DB ─────────────────────────────
let users = [];
let posts = [
  { id: uuidv4(), title: "Getting Started with React", content: "React is a JavaScript library for building user interfaces...", author: "admin", tags: ["react", "javascript"], createdAt: new Date().toISOString(), likes: 12 },
  { id: uuidv4(), title: "Node.js Best Practices", content: "Here are the top practices every Node.js developer should follow...", author: "admin", tags: ["nodejs", "backend"], createdAt: new Date().toISOString(), likes: 8 },
];

// ── Middleware ────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Access denied. No token provided." });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token." });
  }
};

const validate = (fields) => (req, res, next) => {
  for (const field of fields) {
    if (!req.body[field]) return res.status(400).json({ error: `'${field}' is required.` });
  }
  next();
};

// ── Auth Routes ───────────────────────────────
app.post("/api/auth/register", validate(["username", "email", "password"]), async (req, res) => {
  const { username, email, password } = req.body;
  if (users.find(u => u.email === email)) return res.status(409).json({ error: "Email already registered." });
  const hashed = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), username, email, password: hashed, createdAt: new Date().toISOString() };
  users.push(user);
  const token = jwt.sign({ id: user.id, username, email }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({ message: "Registration successful!", token, user: { id: user.id, username, email } });
});

app.post("/api/auth/login", validate(["email", "password"]), async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: "Invalid email or password." });
  const token = jwt.sign({ id: user.id, username: user.username, email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ message: "Login successful!", token, user: { id: user.id, username: user.username, email } });
});

app.get("/api/auth/me", auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({ id: user.id, username: user.username, email: user.email, createdAt: user.createdAt });
});

// ── Posts Routes (CRUD) ───────────────────────
app.get("/api/posts", (req, res) => {
  const { tag, search, page = 1, limit = 10 } = req.query;
  let result = [...posts];
  if (tag) result = result.filter(p => p.tags.includes(tag));
  if (search) result = result.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.content.toLowerCase().includes(search.toLowerCase()));
  const start = (page - 1) * limit;
  res.json({ posts: result.slice(start, start + Number(limit)), total: result.length, page: Number(page), pages: Math.ceil(result.length / limit) });
});

app.get("/api/posts/:id", (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  res.json(post);
});

app.post("/api/posts", auth, validate(["title", "content"]), (req, res) => {
  const { title, content, tags = [] } = req.body;
  const post = { id: uuidv4(), title, content, tags, author: req.user.username, createdAt: new Date().toISOString(), likes: 0 };
  posts.unshift(post);
  res.status(201).json({ message: "Post created!", post });
});

app.put("/api/posts/:id", auth, (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found." });
  if (posts[index].author !== req.user.username) return res.status(403).json({ error: "You can only edit your own posts." });
  posts[index] = { ...posts[index], ...req.body, id: posts[index].id, author: posts[index].author, updatedAt: new Date().toISOString() };
  res.json({ message: "Post updated!", post: posts[index] });
});

app.delete("/api/posts/:id", auth, (req, res) => {
  const index = posts.findIndex(p => p.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Post not found." });
  if (posts[index].author !== req.user.username) return res.status(403).json({ error: "You can only delete your own posts." });
  posts.splice(index, 1);
  res.json({ message: "Post deleted." });
});

app.post("/api/posts/:id/like", auth, (req, res) => {
  const post = posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found." });
  post.likes += 1;
  res.json({ likes: post.likes });
});

// ── Health & Docs ─────────────────────────────
app.get("/", (_, res) => res.json({
  name: "NodeAPI — RESTful Blog API",
  version: "1.0.0",
  endpoints: {
    auth: ["POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me"],
    posts: ["GET /api/posts", "GET /api/posts/:id", "POST /api/posts", "PUT /api/posts/:id", "DELETE /api/posts/:id", "POST /api/posts/:id/like"],
  },
}));

app.get("/api/health", (_, res) => res.json({ status: "ok", uptime: process.uptime(), users: users.length, posts: posts.length }));

// 404 handler
app.use((_, res) => res.status(404).json({ error: "Route not found." }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 NodeAPI running on http://localhost:${PORT}`));

module.exports = app;
