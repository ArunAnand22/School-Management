# Temporary Backend Server

This project uses **JSON Server** as a temporary backend to persist data during development.

## Quick Start

### 1. Start the Backend Server

```bash
npm run server
```

The server will start on `http://localhost:3000`

### 2. Start the Frontend (in a separate terminal)

```bash
npm start
```

The frontend will start on `http://localhost:4200` (default Angular port)

## API Endpoints

All API endpoints are prefixed with `/api`:

### Authentication
- `POST /api/auth/login` - Login endpoint

### CRUD Operations

The following endpoints are automatically available for each resource:

- `GET /api/{resource}` - Get all items
- `GET /api/{resource}/{id}` - Get single item
- `POST /api/{resource}` - Create new item
- `PUT /api/{resource}/{id}` - Update item (full replacement)
- `PATCH /api/{resource}/{id}` - Update item (partial)
- `DELETE /api/{resource}/{id}` - Delete item

### Available Resources

- `/api/users` - User accounts
- `/api/organisations` - Organizations
- `/api/persons` - Students and Staff (tutors)
- `/api/batches` - Course batches
- `/api/courses` - Courses
- `/api/payments` - Payment records
- `/api/receipts` - Receipt records

### Example API Calls

```bash
# Get all organisations
GET http://localhost:3000/api/organisations

# Get single organisation
GET http://localhost:3000/api/organisations/1

# Create new organisation
POST http://localhost:3000/api/organisations
Content-Type: application/json

{
  "organisationName": "New School",
  "address": "123 Main St",
  "phoneNumber": "9123456789",
  "email": "contact@newschool.edu",
  "website": "https://www.newschool.edu",
  "location": "City, State, Country",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "logo": null,
  "header": null,
  "footer": null,
  "seal": null,
  "remarks": "",
  "createdAt": "2024-01-20",
  "updatedAt": "2024-01-20"
}

# Update organisation
PATCH http://localhost:3000/api/organisations/1
Content-Type: application/json

{
  "organisationName": "Updated School Name"
}

# Delete organisation
DELETE http://localhost:3000/api/organisations/1
```

## Data Storage

All data is stored in `db.json` file. This file is automatically updated when you make POST, PUT, PATCH, or DELETE requests.

**Note:** The data persists between server restarts as long as `db.json` exists.

## Default Login Credentials

- Username: `admin`
- Password: `admin123`

## Features

- ✅ RESTful API with automatic CRUD operations
- ✅ Data persistence in JSON file
- ✅ Custom login endpoint
- ✅ `/api` prefix support
- ✅ CORS enabled for frontend development
- ✅ Automatic ID generation for new resources

## Development Tips

1. **View Data**: Open `db.json` to see all stored data
2. **Reset Data**: Delete `db.json` and restart the server to get fresh initial data
3. **Backup Data**: Copy `db.json` to backup your data
4. **Query Parameters**: JSON Server supports filtering, sorting, and pagination:
   - `GET /api/organisations?organisationName=ABC`
   - `GET /api/organisations?_sort=createdAt&_order=desc`
   - `GET /api/organisations?_page=1&_limit=10`

## Notes

- This is a **temporary development backend** - not suitable for production
- No authentication/authorization beyond the login endpoint
- No data validation
- All data is stored in a single JSON file
- Perfect for prototyping and development








