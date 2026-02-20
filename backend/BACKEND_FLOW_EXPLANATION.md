# Backend Flow Explanation - Job Portal

## 📁 Project Structure Overview

```
backend/
├── index.js                 # Entry point - Server initialization
├── routes/                  # API route definitions
│   └── user.route.js
├── controllers/            # Business logic handlers
│   └── user.controller.js
├── models/                 # Database schemas (MongoDB/Mongoose)
│   ├── user.model.js
│   ├── job.model.js
│   ├── company.model.js
│   └── application.model.js
├── middlewares/            # Request processing middleware
│   └── isAuthenticated.js
└── utils/                  # Utility functions
    └── db.js               # Database connection
```

---

## 🔄 Complete Request Flow

### **1. Server Initialization (`index.js`)**

```
┌─────────────────────────────────────────────────┐
│  Server Starts (index.js)                       │
│  1. Load environment variables (.env)           │
│  2. Create Express app                          │
│  3. Configure middleware                        │
│  4. Set up routes                               │
│  5. Start server & connect to database          │
└─────────────────────────────────────────────────┘
```

**Step-by-step:**
1. **Import dependencies**: Express, CORS, cookie-parser, dotenv
2. **Load environment variables**: `dotenv.config()` reads `.env` file
3. **Create Express app**: `const app = express()`
4. **Configure middleware**:
   - `express.json()` - Parse JSON request bodies
   - `express.urlencoded()` - Parse URL-encoded data
   - `cookieParser()` - Parse cookies from requests
   - `cors()` - Enable Cross-Origin Resource Sharing
5. **Define routes**: Mount route handlers (e.g., `/api/v1/user`)
6. **Start server**: Listen on PORT and connect to MongoDB

---

### **2. Request Flow Diagram**

```
Client Request
    ↓
Express Server (index.js)
    ↓
CORS Middleware (checks origin)
    ↓
Body Parser (parses JSON/URL-encoded data)
    ↓
Cookie Parser (extracts cookies)
    ↓
Route Handler (user.route.js)
    ↓
[Optional] Authentication Middleware (isAuthenticated.js)
    ↓
Controller Function (user.controller.js)
    ↓
Database Model (user.model.js, etc.)
    ↓
MongoDB Database
    ↓
Response sent back to client
```

---

### **3. Route Layer (`routes/user.route.js`)**

**Purpose**: Define URL endpoints and map them to controller functions

**Flow:**
- Routes are defined using Express Router
- Each route specifies:
  - HTTP method (GET, POST, PUT, DELETE)
  - URL path
  - Controller function(s) to execute
  - Optional middleware (like authentication)

**Example:**
```javascript
POST /api/v1/user/register → register controller
POST /api/v1/user/login → login controller
POST /api/v1/user/profile/update → isAuthenticated middleware → updateProfile controller
GET /api/v1/user/logout → logout controller
```

**URL Structure:**
- Base: `http://localhost:8000`
- API prefix: `/api/v1/user`
- Full endpoint: `http://localhost:8000/api/v1/user/register`

---

### **4. Middleware Layer (`middlewares/isAuthenticated.js`)**

**Purpose**: Protect routes that require authentication

**How it works:**
1. Extracts `token` from request cookies
2. Verifies token using JWT (JSON Web Token)
3. If valid: extracts `userId` and attaches to `req.id`, calls `next()`
4. If invalid: returns 401 Unauthorized error

**When used:**
- Applied to routes that need authentication (e.g., update profile)
- Runs BEFORE the controller function

**Example flow:**
```
Request → isAuthenticated middleware → [if valid] → Controller
                                      → [if invalid] → Error response
```

---

### **5. Controller Layer (`controllers/user.controller.js`)**

**Purpose**: Contains business logic for handling requests

**Functions:**

#### **a) `register` - User Registration**
```
1. Extract data from req.body (fullname, email, phoneNumber, password, role)
2. Validate all fields are present
3. Check if user with email already exists
4. Hash password using bcrypt
5. Create new user in database
6. Return success response
```

#### **b) `login` - User Login**
```
1. Extract email, password, role from req.body
2. Validate fields
3. Find user by email in database
4. Compare provided password with hashed password
5. Verify role matches
6. Generate JWT token
7. Store token in HTTP-only cookie
8. Return user data and success response
```

#### **c) `updateProfile` - Update User Profile**
```
1. Extract profile data from req.body
2. Get userId from req.id (set by isAuthenticated middleware)
3. Find user in database
4. Update user fields (fullname, email, phoneNumber, bio, skills)
5. Save updated user
6. Return updated user data
```

#### **d) `logout` - User Logout**
```
1. Clear token cookie (set maxAge to 0)
2. Return success response
```

---

### **6. Model Layer (`models/`)**

**Purpose**: Define database schemas and data structure

**Models:**

#### **User Model** (`user.model.js`)
- Stores user information
- Fields: fullname, email, phoneNumber, password, role
- Profile sub-document: bio, skills, resume, profilePhoto, company reference

#### **Job Model** (`job.model.js`)
- Stores job postings
- Fields: title, description, requirements, salary, location, jobType
- References: company, created_by (User), applications

#### **Company Model** (`company.model.js`)
- Stores company information
- Fields: name, description, website, location, logo
- References: userId (User who created it)

#### **Application Model** (`application.model.js`)
- Stores job applications
- Fields: job reference, applicant reference, status
- Status: pending, accepted, rejected

**Relationships:**
- User → Company (one-to-one via profile.company)
- Company → User (one-to-one via userId)
- Job → Company (many-to-one)
- Job → User (created_by - many-to-one)
- Application → Job (many-to-one)
- Application → User (applicant - many-to-one)

---

### **7. Database Connection (`utils/db.js`)**

**Purpose**: Establish connection to MongoDB

**Flow:**
1. Import mongoose and dotenv
2. Connect to MongoDB using connection string from `.env` (MONGO_URI)
3. Handle connection errors
4. Called when server starts in `index.js`

---

## 🔐 Authentication Flow

### **Registration Flow:**
```
Client → POST /api/v1/user/register
  → register controller
  → Hash password
  → Save to database
  → Return success
```

### **Login Flow:**
```
Client → POST /api/v1/user/login
  → login controller
  → Verify credentials
  → Generate JWT token
  → Store in HTTP-only cookie
  → Return user data
```

### **Protected Route Flow:**
```
Client → POST /api/v1/user/profile/update (with cookie)
  → isAuthenticated middleware
    → Extract token from cookie
    → Verify JWT token
    → Attach userId to req.id
  → updateProfile controller
    → Use req.id to find user
    → Update user data
    → Return updated user
```

---

## 📊 Data Flow Example: User Registration

```
1. Client sends POST request:
   POST http://localhost:8000/api/v1/user/register
   Body: { fullname, email, phoneNumber, password, role }

2. Express receives request
   ↓
3. CORS middleware checks origin
   ↓
4. Body parser extracts JSON data → req.body
   ↓
5. Route handler matches "/register" → calls register()
   ↓
6. Controller (register):
   - Validates req.body fields
   - Checks if user exists: User.findOne({email})
   - Hashes password: bcrypt.hash(password, 10)
   - Creates user: User.create({...})
   ↓
7. MongoDB saves user document
   ↓
8. Controller returns response:
   { message: "Account created successfully", success: true }
   ↓
9. Response sent to client
```

---

## 🔑 Key Concepts

### **Middleware Chain**
Multiple middleware functions execute in order before reaching the controller:
```
Request → Middleware 1 → Middleware 2 → Controller → Response
```

### **JWT Authentication**
- Token generated during login
- Stored in HTTP-only cookie (secure, not accessible via JavaScript)
- Verified on protected routes
- Contains userId for user identification

### **Password Security**
- Passwords hashed using bcrypt before storing
- Never stored in plain text
- Compared using bcrypt.compare() during login

### **Database Relationships**
- Uses MongoDB ObjectId references
- Enables data relationships (User → Company → Job → Application)
- Can populate related data when needed

---

## 🚀 Adding New Features

To add a new feature (e.g., job posting):

1. **Create Model**: `models/job.model.js` (already exists)
2. **Create Controller**: `controllers/job.controller.js`
   ```javascript
   export const createJob = async(req,res) => { ... }
   ```
3. **Create Routes**: `routes/job.route.js`
   ```javascript
   router.route("/create").post(isAuthenticated, createJob);
   ```
4. **Mount Route**: In `index.js`
   ```javascript
   app.use("/api/v1/job", jobRoute);
   ```

---

## 📝 Summary

**Request Journey:**
1. **Entry**: `index.js` - Server receives request
2. **Routing**: `routes/` - Determines which controller to call
3. **Protection**: `middlewares/` - Authenticates if needed
4. **Logic**: `controllers/` - Handles business logic
5. **Data**: `models/` - Interacts with database
6. **Storage**: MongoDB - Stores/retrieves data
7. **Response**: Sent back through the chain

This is a **MVC (Model-View-Controller)** architecture pattern with Express.js and MongoDB!
