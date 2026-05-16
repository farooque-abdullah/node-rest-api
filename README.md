# 🔗 NodeAPI — RESTful Blog API

A production-ready **REST API** built with Node.js, Express, and JWT authentication. Includes complete CRUD operations, middleware, error handling, and route protection.

## ✨ Features

- 🔐 **JWT Authentication** — register, login, protected routes
- 🔑 **Password hashing** with bcryptjs
- 📝 **Full CRUD** — Create, Read, Update, Delete posts
- 🔍 **Search & Filter** — by tag, keyword, pagination
- ❤️ **Like system** — authenticated post likes
- 🛡️ **Middleware** — auth guard, input validation
- 📋 **Self-documenting** — `GET /` returns all endpoints
- ✅ **Health check** — `GET /api/health`

## 🛠️ Tech Stack

- **Node.js** + **Express 4**
- **JWT** (jsonwebtoken) — stateless auth
- **bcryptjs** — password hashing
- **UUID** — unique IDs

## 🚀 Quick Start

```bash
git clone https://github.com/yourusername/node-rest-api.git
cd node-rest-api
npm install
npm run dev
```

Server runs on `http://localhost:3000`

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login & get JWT token |
| GET | `/api/auth/me` | ✅ | Get current user |

### Posts
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/posts` | ❌ | Get all posts (paginated) |
| GET | `/api/posts/:id` | ❌ | Get single post |
| POST | `/api/posts` | ✅ | Create post |
| PUT | `/api/posts/:id` | ✅ | Update own post |
| DELETE | `/api/posts/:id` | ✅ | Delete own post |
| POST | `/api/posts/:id/like` | ✅ | Like a post |

### Example Requests

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"farooque","email":"f@example.com","password":"secret123"}'

# Create post (use token from register/login)
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"My Post","content":"Hello world","tags":["react"]}'
```

## 🙋 Author

**Farooque** · [LinkedIn](https://www.linkedin.com/in/farooque-abdullah-21a024183)

---
⭐ Star if this helped you!
