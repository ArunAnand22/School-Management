# Quick Start Guide - Backend Setup

## 🚀 Getting Started

### Step 1: Start the Backend Server

Open a terminal and run:

```bash
npm run server
```

You should see:
```
JSON Server is running on http://localhost:3000
API endpoints available at http://localhost:3000/api
```

### Step 2: Start the Frontend

Open a **new terminal** and run:

```bash
npm start
```

The Angular app will start on `http://localhost:4200`

## 📝 Available Endpoints

Your backend is now running with these endpoints:

- **Authentication**
  - `POST http://localhost:3000/api/auth/login`

- **Resources** (all support GET, POST, PUT, PATCH, DELETE)
  - `http://localhost:3000/api/users`
  - `http://localhost:3000/api/organisations`
  - `http://localhost:3000/api/persons`
  - `http://localhost:3000/api/batches`
  - `http://localhost:3000/api/courses`
  - `http://localhost:3000/api/payments`
  - `http://localhost:3000/api/receipts`

## 🔐 Test Login

You can test the login with:
- **Username:** `admin`
- **Password:** `admin123`

## 💾 Data Storage

All data is automatically saved to `db.json`. This file persists your data between server restarts.

## 📚 More Information

See `BACKEND_README.md` for detailed API documentation and examples.








