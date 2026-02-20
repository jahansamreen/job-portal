# Detailed Request Flow Explanation - For Beginners

## 🎯 Understanding the Complete Journey of a Request

This document explains **EXACTLY** what happens when a request comes to your backend, step by step, with detailed explanations.

---

## 📋 Table of Contents
1. [What Happens When Server Starts](#1-what-happens-when-server-starts)
2. [Complete Request Journey - Registration Example](#2-complete-request-journey---registration-example)
3. [Complete Request Journey - Login Example](#3-complete-request-journey---login-example)
4. [Complete Request Journey - Protected Route Example](#4-complete-request-journey---protected-route-example)
5. [Understanding Each Component in Detail](#5-understanding-each-component-in-detail)

---

## 1. What Happens When Server Starts

### Step-by-Step Server Initialization

When you run `npm run dev` or `node index.js`, here's what happens:

#### **Line 1-6: Importing Dependencies**
```javascript
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./utils/db.js";
import userRoute from "./routes/user.route.js"
```

**What this does:**
- `express`: Creates the web server framework
- `cookieParser`: Helps read cookies from requests
- `cors`: Allows frontend (different port) to talk to backend
- `dotenv`: Loads environment variables from `.env` file
- `connectDB`: Function to connect to MongoDB.
- `userRoute`: All user-related routes (register, login, etc.)

#### **Line 8: Load Environment Variables**
```javascript
dotenv.config({});
```
**What this does:**
- Reads your `.env` file
- Makes variables like `MONGO_URI`, `PORT`, `SECRET_KEY` available via `process.env`

#### **Line 10: Create Express App**
```javascript
const app = express();
```
**What this does:**
- Creates an Express application instance
- This `app` object will handle all incoming requests
- Think of it as the "receptionist" of your server

#### **Line 12-17: Define a Simple Route**
```javascript
app.get("/home",(req,res)=>{
    return res.status(200).json({
        message:"i am coming from backend",
        success: true
    })
})
```
**What this does:**
- If someone visits `http://localhost:8000/home`, send back a JSON response
- `req` = request object (contains data from client)
- `res` = response object (used to send data back to client)

#### **Line 20-22: Set Up Middleware (Part 1)**
```javascript
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
```

**What `app.use()` means:**
- "For EVERY request that comes in, run this function first"
- Middleware runs BEFORE your route handlers

**What each middleware does:**

1. **`express.json()`**
   - **Purpose**: Parses JSON data from request body
   - **Example**: If client sends `{"name": "John"}`, this converts it from string to JavaScript object
   - **Where it puts data**: In `req.body`
   - **When it's needed**: When client sends JSON data (like in POST requests)

2. **`express.urlencoded({extended:true})`**
   - **Purpose**: Parses form data from request body
   - **Example**: If client sends `name=John&age=25`, this converts it to `{name: "John", age: "25"}`
   - **Where it puts data**: In `req.body`
   - **When it's needed**: When client sends form data

3. **`cookieParser()`**
   - **Purpose**: Extracts cookies from request headers
   - **Example**: If request has cookie `token=abc123`, this makes it available as `req.cookies.token`
   - **Where it puts data**: In `req.cookies`
   - **When it's needed**: For authentication (checking if user is logged in)

#### **Line 24-29: Set Up CORS**
```javascript
const corsOptions ={
    origin: 'http//localhost:5173',
    credentials:true
}
app.use(cors(corsOptions));
```

**What CORS does:**
- **Problem**: Browser security prevents frontend (port 5173) from talking to backend (port 8000)
- **Solution**: CORS tells browser "it's okay, allow this"
- **`origin`**: Which frontend URL is allowed (your React/Vue app)
- **`credentials: true`**: Allows cookies to be sent with requests

#### **Line 31: Set Port Number**
```javascript
const PORT=process.env.PORT || 3000;
```
**What this does:**
- Uses port from `.env` file, or defaults to 3000 if not set
- Your server will listen on this port

#### **Line 37: Mount User Routes**
```javascript
app.use("/api/v1/user",userRoute);
```

**What this does:**
- Takes all routes defined in `userRoute` and adds `/api/v1/user` prefix
- **Example**: Route `/register` in userRoute becomes `/api/v1/user/register`
- This is like saying "all user-related routes start with `/api/v1/user`"

#### **Line 42-45: Start Server**
```javascript
app.listen(PORT,()=>{
    connectDB();
    console.log(`Server running at port ${PORT}`);
})
```

**What this does:**
1. Starts listening for requests on the specified port
2. When server is ready, calls `connectDB()` to connect to MongoDB
3. Prints message to console

**At this point:**
- Server is running and waiting for requests
- Database is connected
- All middleware is set up
- Routes are registered

---

## 2. Complete Request Journey - Registration Example

Let's trace a **complete request** from start to finish using the registration endpoint.

### **Scenario: User wants to register**

**Client sends:**
```
POST http://localhost:8000/api/v1/user/register
Headers: {
  Content-Type: application/json
}
Body: {
  "fullname": "John Doe",
  "email": "john@example.com",
  "phoneNumber": 1234567890,
  "password": "mypassword123",
  "role": "student"
}
```

---

### **Step 1: Request Arrives at Server**

```
┌─────────────────────────────────────────┐
│  Request arrives at port 8000           │
│  Method: POST                           │
│  URL: /api/v1/user/register             │
│  Body: (raw JSON string)               │
└─────────────────────────────────────────┘
```

**What happens:**
- Express receives the HTTP request
- Creates `req` (request) and `res` (response) objects
- Starts processing through middleware chain

---

### **Step 2: CORS Middleware Runs**

```javascript
app.use(cors(corsOptions));
```

**What happens:**
1. Checks the `Origin` header in request
2. Compares it with allowed origin (`http://localhost:5173`)
3. If allowed:
   - Adds CORS headers to response
   - Calls `next()` to continue to next middleware
4. If not allowed:
   - Blocks the request
   - Sends error response

**In our case:**
- ✅ Origin matches → Continues to next step
- `req` and `res` objects are passed along

---

### **Step 3: Body Parser Middleware Runs**

```javascript
app.use(express.json());
```

**What happens:**
1. Checks `Content-Type` header (should be `application/json`)
2. Reads the raw body data (currently a string):
   ```json
   '{"fullname":"John Doe","email":"john@example.com",...}'
   ```
3. Parses it into a JavaScript object:
   ```javascript
   {
     fullname: "John Doe",
     email: "john@example.com",
     phoneNumber: 1234567890,
     password: "mypassword123",
     role: "student"
   }
   ```
4. Attaches this object to `req.body`
5. Calls `next()` to continue

**After this step:**
- `req.body` now contains the parsed data
- You can access `req.body.fullname`, `req.body.email`, etc.

---

### **Step 4: Cookie Parser Middleware Runs**

```javascript
app.use(cookieParser());
```

**What happens:**
1. Checks if request has `Cookie` header
2. If yes, parses cookies and puts them in `req.cookies`
3. If no cookies, `req.cookies` is empty object `{}`
4. Calls `next()` to continue

**In our case:**
- No cookies sent (new user registering)
- `req.cookies = {}`
- Continues to next step

---

### **Step 5: Express Matches Route**

```javascript
app.use("/api/v1/user",userRoute);
```

**What happens:**
1. Express looks at the URL: `/api/v1/user/register`
2. Checks if it matches any mounted routes
3. Finds: `/api/v1/user` matches!
4. Strips the prefix: `/api/v1/user` → remaining path is `/register`
5. Passes control to `userRoute` with remaining path `/register`

**Now Express looks inside `userRoute`:**

```javascript
// In routes/user.route.js
router.route("/register").post(register);
```

**What happens:**
1. Express checks: Does `/register` match? ✅
2. Checks: Is method POST? ✅
3. Found the handler! → Calls `register` function

---

### **Step 6: Controller Function Executes**

```javascript
// In controllers/user.controller.js
export const register = async(req,res)=>{
```

**Now we're in the controller! Let's go line by line:**

#### **Line 7: Extract Data from Request**
```javascript
const{fullname,email,phoneNumber,password,role}=req.body;
```

**What this does:**
- Uses JavaScript destructuring
- Extracts values from `req.body` into variables
- **Before:**
  ```javascript
  req.body = {
    fullname: "John Doe",
    email: "john@example.com",
    phoneNumber: 1234567890,
    password: "mypassword123",
    role: "student"
  }
  ```
- **After:**
  ```javascript
  fullname = "John Doe"
  email = "john@example.com"
  phoneNumber = 1234567890
  password = "mypassword123"
  role = "student"
  ```

#### **Line 8-13: Validate Required Fields**
```javascript
if(!fullname || !email || !phoneNumber || !password || !role){
    return res.status(400).json({
        message: "Something is missing",
        success: false 
    });
}
```

**What this does:**
- Checks if any field is missing or empty
- `!fullname` means "if fullname is falsy" (null, undefined, empty string, 0, false)
- If any field is missing:
  - **`return`**: Stops function execution immediately
  - **`res.status(400)`**: Sets HTTP status code to 400 (Bad Request)
  - **`.json({...})`**: Sends JSON response to client
  - Response sent, function ends here

**In our case:**
- All fields present → Continues to next step

#### **Line 14: Check if User Already Exists**
```javascript
const user=await User.findOne({email});
```

**What this does:**
- **`User`**: This is the Mongoose model (from `models/user.model.js`)
- **`.findOne({email})`**: Searches database for user with this email
- **`await`**: Waits for database query to complete (async operation)
- **Result**: Either a user object (if found) or `null` (if not found)

**Database Query:**
```
MongoDB Query: db.users.findOne({email: "john@example.com"})
Result: null (user doesn't exist yet)
```

**In our case:**
- User doesn't exist → `user = null`
- Continues to next step

#### **Line 15-20: Check if User Found**
```javascript
if(user){
    return res.status(400).json({
        message: "User already exists with this email",
        success: false,
    })
}
```

**What this does:**
- If `user` is not null (user exists):
  - Send error response
  - Stop execution

**In our case:**
- `user` is `null` → Condition is false
- Continues to next step

#### **Line 21: Hash the Password**
```javascript
const hashedPassword = await bcrypt.hash(password,10);
```

**What this does:**
- **Why hash?** Never store passwords in plain text!
- **`bcrypt.hash()`**: Converts password into a scrambled string
- **`10`**: "Salt rounds" - how many times to scramble (higher = more secure, slower)
- **`await`**: Waits for hashing to complete

**Before:**
```javascript
password = "mypassword123"
```

**After:**
```javascript
hashedPassword = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
```

**Important:** You can't reverse this! If someone steals your database, they can't get original passwords.

#### **Line 22-28: Create User in Database**
```javascript
await User.create({
    fullname,
    email,
    phoneNumber,
    password: hashedPassword,
    role
})
```

**What this does:**
- **`User.create()`**: Creates a new document in MongoDB
- **`await`**: Waits for database save to complete
- Saves all the data to the `users` collection

**What gets saved:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),  // Auto-generated by MongoDB
  fullname: "John Doe",
  email: "john@example.com",
  phoneNumber: 1234567890,
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...",  // Hashed!
  role: "student",
  profile: {
    bio: undefined,
    skills: [],
    resume: undefined,
    profilePhoto: ""
  },
  createdAt: 2024-01-15T10:30:00.000Z,  // Auto-added by timestamps
  updatedAt: 2024-01-15T10:30:00.000Z
}
```

#### **Line 29-32: Send Success Response**
```javascript
return res.status(201).json({
    message: "Account created successfully",
    success: true
})
```

**What this does:**
- **`res.status(201)`**: Sets HTTP status to 201 (Created - successful creation)
- **`.json({...})`**: Converts object to JSON and sends it
- **`return`**: Stops function execution

**Response sent to client:**
```json
HTTP Status: 201 Created
Headers: {
  Content-Type: application/json
}
Body: {
  "message": "Account created successfully",
  "success": true
}
```

---

### **Step 7: Response Sent Back to Client**

The response travels back through the middleware chain (in reverse order) and is sent to the client.

**Client receives:**
```json
{
  "message": "Account created successfully",
  "success": true
}
```

---

## 3. Complete Request Journey - Login Example

Now let's trace a **login request** which is more complex because it involves password verification and token generation.

### **Scenario: User wants to login**

**Client sends:**
```
POST http://localhost:8000/api/v1/user/login
Headers: {
  Content-Type: application/json
}
Body: {
  "email": "john@example.com",
  "password": "mypassword123",
  "role": "student"
}
```

---

### **Steps 1-5: Same as Registration**

- Request arrives
- CORS middleware
- Body parser (extracts email, password, role)
- Cookie parser (no cookies yet)
- Route matching → calls `login` function

---

### **Step 6: Login Controller Executes**

```javascript
export const login = async(req,res)=>{
```

#### **Line 40: Extract Data**
```javascript
const{ email,password,role}=req.body;
```
- Extracts: `email = "john@example.com"`, `password = "mypassword123"`, `role = "student"`

#### **Line 41-46: Validate Fields**
```javascript
if( !email ||  !password || !role){
    return res.status(400).json({
        message: "Something is missing",
        success: false 
    });
}
```
- All fields present → Continue

#### **Line 47: Find User in Database**
```javascript
const user = await User.findOne({email});
```

**Database Query:**
```
MongoDB: db.users.findOne({email: "john@example.com"})
Result: {
  _id: ObjectId("507f1f77bcf86cd799439011"),
  fullname: "John Doe",
  email: "john@example.com",
  phoneNumber: 1234567890,
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMye...",  // Hashed password
  role: "student",
  ...
}
```

**In our case:**
- User found → `user` contains the user object
- Continues

#### **Line 48-53: Check if User Exists**
```javascript
if(!user){
    return res.status(400).json({
        message:'Incorrect email or password',
        success: false,
    })
}
```
- User exists → Continue

#### **Line 54: Verify Password**
```javascript
const isPasswordMatch = await bcrypt.compare(password,user.password);
```

**What this does:**
- **`bcrypt.compare()`**: Takes plain password and hashed password, compares them
- **How it works:**
  1. Takes `"mypassword123"` (plain text)
  2. Takes `"$2a$10$N9qo8uLOickgx2ZMRZoMye..."` (hashed)
  3. Hashes the plain password with the same salt
  4. Compares the two hashes
  5. Returns `true` if they match, `false` if not

**In our case:**
- Password matches → `isPasswordMatch = true`
- Continues

#### **Line 55-60: Check Password Match**
```javascript
if(!isPasswordMatch){
    return res.status(400).json({
        message: 'Incorrect email or password',
        success: false,
    })
}
```
- Password matches → Continue

#### **Line 63-68: Verify Role**
```javascript
if(role !== user.role){
    return res.status(400).json({
        message: "Account doesn't exist with current role.",
        success: false,
    })
}
```
- Role matches → Continue

#### **Line 70-72: Prepare Token Data**
```javascript
const tokenData ={
    userId: user._id,
}
```
- Creates object with user ID to embed in token
- `tokenData = { userId: ObjectId("507f1f77bcf86cd799439011") }`

#### **Line 74: Generate JWT Token**
```javascript
const token = await jwt.sign(tokenData, process.env.SECRET_KEY, {expiresIn: '1d'});
```

**What this does:**
- **`jwt.sign()`**: Creates a JSON Web Token
- **Parameters:**
  - `tokenData`: Data to embed (userId)
  - `process.env.SECRET_KEY`: Secret key to sign token (from .env file)
  - `{expiresIn: '1d'}`: Token expires in 1 day
- **Result**: A long string like `"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1MDdmMWY3N2JjZjg2Y2Q3OTk0MzkwMTEiLCJpYXQiOjE3MDQ4NzY4MDAsImV4cCI6MTcwNDk2MzIwMH0.abc123..."`

**What's inside the token:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "iat": 1704876800,  // Issued at (timestamp)
  "exp": 1704963200   // Expires at (timestamp)
}
```

**Important:** Token is signed with secret key, so it can't be tampered with.

#### **Line 75-82: Prepare User Data**
```javascript
const userData = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profile: user.profile
}
```
- Creates clean user object (without password!)
- This is what we send to client

#### **Line 84: Send Response with Cookie**
```javascript
return res.status(200).cookie("token",token,{maxAge: 1*24*60*60*1000, httpOnly: true, sameSite:'strict'}).json({
    message: `Welcome back ${userData.fullname}`,
    user: userData,
    success: true
})
```

**Breaking this down:**

1. **`res.status(200)`**: HTTP 200 OK
2. **`.cookie("token",token,{...})`**: Sets a cookie
   - **Name**: `token`
   - **Value**: The JWT token string
   - **Options:**
     - `maxAge: 1*24*60*60*1000`: Cookie expires in 1 day (milliseconds)
     - `httpOnly: true`: Cookie can't be accessed by JavaScript (security!)
     - `sameSite: 'strict'`: Cookie only sent on same-site requests
3. **`.json({...})`**: Sends JSON response

**Response sent:**
```
HTTP Status: 200 OK
Headers: {
  Content-Type: application/json,
  Set-Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Max-Age=86400; HttpOnly; SameSite=Strict
}
Body: {
  "message": "Welcome back John Doe",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "John Doe",
    "email": "john@example.com",
    "phoneNumber": 1234567890,
    "role": "student",
    "profile": {...}
  },
  "success": true
}
```

**What happens on client:**
- Browser automatically saves the cookie
- Cookie is sent with every subsequent request automatically
- JavaScript can't access it (httpOnly)

---

## 4. Complete Request Journey - Protected Route Example

Now let's trace a **protected route** that requires authentication (update profile).

### **Scenario: User wants to update profile**

**Client sends:**
```
POST http://localhost:8000/api/v1/user/profile/update
Headers: {
  Content-Type: application/json
}
Cookie: token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Body: {
  "fullname": "John Smith",
  "bio": "Software developer"
}
```

---

### **Steps 1-4: Same as Before**

- Request arrives
- CORS middleware
- Body parser
- Cookie parser (extracts token from cookie)

**After cookie parser:**
```javascript
req.cookies = {
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### **Step 5: Route Matching**

```javascript
// In routes/user.route.js
router.route("/profile/update").post(isAuthenticated,updateProfile);
```

**Notice:** There are **TWO** functions: `isAuthenticated` and `updateProfile`

**What Express does:**
1. Matches route `/profile/update` with POST method
2. Calls functions in order:
   - First: `isAuthenticated` (middleware)
   - Then (if middleware calls `next()`): `updateProfile` (controller)

---

### **Step 6: Authentication Middleware Executes**

```javascript
// In middlewares/isAuthenticated.js
const isAuthenticated = async(req,res,next)=>{
```

**What `next` is:**
- `next` is a function that tells Express "move to the next function"
- If you don't call `next()`, the request stops here

#### **Line 5: Extract Token from Cookie**
```javascript
const token = req.cookies.token;
```

**What this does:**
- Gets token from cookies (set by cookie parser)
- `token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`

#### **Line 6-11: Check if Token Exists**
```javascript
if(!token){
    return res.status(401).json({
        message:'user not authenticated',
        success: false
    })
}
```

**What this does:**
- If no token → User not logged in
- Send 401 Unauthorized error
- **`return`**: Stops execution (doesn't call `next()`)

**In our case:**
- Token exists → Continue

#### **Line 12: Verify Token**
```javascript
const decode = await jwt.verify(token,process.env.SECRET_KEY);
```

**What this does:**
- **`jwt.verify()`**: 
  1. Checks if token is valid (not expired, not tampered)
  2. Verifies signature using secret key
  3. If valid: Returns decoded data
  4. If invalid: Throws error

**If token is valid:**
```javascript
decode = {
  userId: "507f1f77bcf86cd799439011",
  iat: 1704876800,
  exp: 1704963200
}
```

**If token is invalid:**
- Throws error → Caught by catch block

#### **Line 13-18: Check if Decode is Valid**
```javascript
if(!decode){
    return res.status(401).json({
        message: 'Invalid token',
        success: false
    })
}
```

**In our case:**
- Token valid → `decode` contains data
- Continues

#### **Line 19: Attach User ID to Request**
```javascript
req.id=decode.userId;
```

**What this does:**
- Extracts `userId` from decoded token
- Attaches it to `req.id`
- Now controller can access `req.id` to know which user made the request

**After this:**
```javascript
req.id = "507f1f77bcf86cd799439011"
```

#### **Line 20: Call Next Function**
```javascript
next();
```

**What this does:**
- Tells Express "authentication passed, continue to next function"
- Express now calls `updateProfile` controller

---

### **Step 7: Update Profile Controller Executes**

```javascript
export const updateProfile = async(req,res)=>{
```

#### **Line 108: Extract Data**
```javascript
const {fullname,email,phoneNumber,bio,skills}=req.body;
```
- Extracts: `fullname = "John Smith"`, `bio = "Software developer"`, others undefined

#### **Line 117: Get User ID from Middleware**
```javascript
const userId = req.id; //middleware authentication
```

**What this does:**
- Gets user ID that was set by `isAuthenticated` middleware
- `userId = "507f1f77bcf86cd799439011"`

**Why this is secure:**
- User ID comes from verified token
- User can't fake it (token is signed)
- We know exactly which user is making the request

#### **Line 118: Find User in Database**
```javascript
let user = await User.findById(userId);
```

**Database Query:**
```
MongoDB: db.users.findById("507f1f77bcf86cd799439011")
Result: {
  _id: ObjectId("507f1f77bcf86cd799439011"),
  fullname: "John Doe",
  email: "john@example.com",
  ...
}
```

#### **Line 119-124: Check if User Exists**
```javascript
if(!user){
    return res.status(400).json({
        message: "User not found",
        success: false
    })
}
```
- User found → Continue

#### **Line 126-130: Update User Fields**
```javascript
if(fullname) user.fullname=fullname
if(phoneNumber)  user.phoneNumber=phoneNumber
if(email) user.email=email
if(bio) user.profile.bio=bio
if(skills) user.profile.skills= skillsArray
```

**What this does:**
- Only updates fields that were provided
- **Before:**
  ```javascript
  user.fullname = "John Doe"
  user.profile.bio = undefined
  ```
- **After:**
  ```javascript
  user.fullname = "John Smith"  // Updated
  user.profile.bio = "Software developer"  // Updated
  ```

#### **Line 134: Save to Database**
```javascript
await user.save();
```

**What this does:**
- Saves the updated user object to MongoDB
- **`await`**: Waits for save to complete

**Database Update:**
```
MongoDB: db.users.updateOne(
  {_id: "507f1f77bcf86cd799439011"},
  {
    fullname: "John Smith",
    profile: {bio: "Software developer"},
    updatedAt: 2024-01-15T11:00:00.000Z
  }
)
```

#### **Line 136-143: Prepare Response Data**
```javascript
user = {
    _id: user._id,
    fullname: user.fullname,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profile: user.profile
}
```
- Creates clean user object (without password)

#### **Line 145-149: Send Response**
```javascript
return res.status(200).json({
    message: "Profile updated successfuly",
    user,
    success: true
})
```

**Response sent:**
```json
{
  "message": "Profile updated successfuly",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "fullname": "John Smith",
    "email": "john@example.com",
    "phoneNumber": 1234567890,
    "role": "student",
    "profile": {
      "bio": "Software developer",
      ...
    }
  },
  "success": true
}
```

---

## 5. Understanding Each Component in Detail

### **A. What is Middleware?**

**Definition:** Functions that run between receiving a request and sending a response.

**Analogy:** Like a security checkpoint at an airport:
1. Check passport (CORS)
2. Scan bags (Body parser)
3. Check ticket (Cookie parser)
4. Security check (Authentication)
5. Board plane (Controller)

**Key Points:**
- Middleware runs in the order it's defined
- Each middleware can:
  - Modify `req` or `res`
  - End the request (send response)
  - Pass to next middleware (`next()`)

**Example:**
```javascript
app.use((req, res, next) => {
  console.log("Request received!");
  next(); // Pass to next middleware
});
```

---

### **B. What is Routing?**

**Definition:** Matching URL paths to handler functions.

**How Express matches routes:**
1. Checks URL path
2. Checks HTTP method (GET, POST, etc.)
3. Finds matching route
4. Calls associated function(s)

**Route Structure:**
```
Base URL: http://localhost:8000
Prefix: /api/v1/user
Route: /register
Full URL: http://localhost:8000/api/v1/user/register
```

**Route Parameters:**
```javascript
router.route("/user/:id").get((req, res) => {
  const userId = req.params.id; // Gets :id from URL
});
// GET /api/v1/user/user/123 → req.params.id = "123"
```

---

### **C. What is a Controller?**

**Definition:** Functions that contain business logic for handling requests.

**Responsibilities:**
1. Extract data from `req.body`, `req.params`, `req.query`
2. Validate input
3. Interact with database (via models)
4. Process business logic
5. Send response via `res`

**Structure:**
```javascript
export const functionName = async(req, res) => {
  try {
    // 1. Extract data
    const { field1, field2 } = req.body;
    
    // 2. Validate
    if (!field1) {
      return res.status(400).json({ error: "Missing field1" });
    }
    
    // 3. Database operation
    const result = await Model.create({ field1, field2 });
    
    // 4. Send response
    return res.status(201).json({ success: true, data: result });
  } catch (error) {
    // Handle errors
    console.log(error);
    return res.status(500).json({ error: "Server error" });
  }
}
```

---

### **D. What is a Model?**

**Definition:** Schema definition for database documents (MongoDB collections).

**What it does:**
1. Defines structure of data
2. Provides methods to interact with database
3. Validates data before saving

**Example:**
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true }
});

export const User = mongoose.model('User', userSchema);
```

**Model Methods:**
- `User.create({...})` - Create new document
- `User.findOne({...})` - Find one document
- `User.findById(id)` - Find by ID
- `User.updateOne({...}, {...})` - Update document
- `User.deleteOne({...})` - Delete document

---

### **E. Request Object (req)**

**What it contains:**
- `req.body` - Request body data (from body parser)
- `req.params` - URL parameters (`/user/:id`)
- `req.query` - Query string (`?name=John`)
- `req.cookies` - Cookies (from cookie parser)
- `req.headers` - HTTP headers
- `req.id` - Custom property (set by middleware)

**Example:**
```javascript
// Request: POST /api/user/123?role=admin
// Body: {"name": "John"}

req.params = { id: "123" }
req.query = { role: "admin" }
req.body = { name: "John" }
```

---

### **F. Response Object (res)**

**Methods:**
- `res.status(200)` - Set HTTP status code
- `res.json({...})` - Send JSON response
- `res.send("text")` - Send text response
- `res.cookie(name, value, options)` - Set cookie
- `res.redirect(url)` - Redirect to URL

**Example:**
```javascript
res.status(201)
   .cookie("token", "abc123", { httpOnly: true })
   .json({ message: "Success", data: result });
```

---

## 🎓 Summary: The Complete Picture

**When a request comes in:**

1. **Server receives request** → Creates `req` and `res` objects
2. **Middleware chain executes** (in order):
   - CORS → Check origin
   - Body parser → Parse JSON/form data → `req.body`
   - Cookie parser → Parse cookies → `req.cookies`
3. **Route matching** → Find matching route
4. **Route-specific middleware** (if any):
   - Authentication → Verify token → `req.id`
5. **Controller executes**:
   - Extract data from `req`
   - Validate input
   - Database operations (via models)
   - Business logic
   - Send response via `res`
6. **Response sent** → Travels back to client

**Key Concepts:**
- **Middleware**: Functions that process requests before controllers
- **Routes**: Map URLs to controller functions
- **Controllers**: Handle business logic
- **Models**: Interact with database
- **req**: Request object (contains incoming data)
- **res**: Response object (used to send data back)

This is the complete flow! Every request follows this pattern. 🚀
