# Micro-Task Marketplace API

A personalized micro-task marketplace platform where users can offer and request small, localized tasks with AI-powered matching, reputation system, and secure payments.

## Features

- **JWT Authentication**: Secure user registration and login with bcrypt password hashing
- **Task Management**: Full CRUD operations for creating, listing, updating, and canceling tasks
- **Location-Based Filtering**: Find tasks near you using latitude/longitude coordinates
- **AI-Powered Matching**: Machine learning algorithm that matches tasks with providers based on:
  - Skills compatibility (35% weight)
  - Location proximity (30% weight)
  - Reputation score (20% weight)
  - Experience/completed tasks (15% weight)
- **Reputation System**: Star ratings (1-5) and reviews with automatic reputation calculation
- **Stripe Payments**: Secure payment processing with webhook support
- **Real-time Notifications**: Task updates and notifications
- **Match History Tracking**: Learn from user behavior to improve recommendations

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: SQLite with Prisma ORM
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod
- **Payments**: Stripe
- **Styling**: Tailwind CSS 4

## Getting Started

1. **Install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Run database migrations**:
```bash
npx prisma migrate dev
```

4. **Generate Prisma client**:
```bash
npx prisma generate
```

5. **Start the development server**:
```bash
npm run dev
```

6. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe",
    "skills": ["grocery-shopping", "dog-walking"],
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "San Francisco, CA"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Tasks

- `GET /api/tasks` - List tasks with optional filters
  - Query params: `status`, `category`, `latitude`, `longitude`, `radius`

- `POST /api/tasks` - Create a new task (requires authentication)
  ```json
  {
    "title": "Pick up groceries",
    "description": "Need someone to pick up groceries from Whole Foods",
    "category": "groceries",
    "price": 25.00,
    "latitude": 37.7749,
    "longitude": -122.4194,
    "address": "123 Main St, San Francisco",
    "scheduledAt": "2026-02-20T10:00:00Z"
  }
  ```

- `GET /api/tasks/[id]` - Get task details

- `PATCH /api/tasks/[id]` - Update task (accept task or change status)
  ```json
  {
    "action": "accept"  // or
    "status": "in-progress"
  }
  ```

- `DELETE /api/tasks/[id]` - Cancel task

### Users

- `GET /api/users/me` - Get current user profile (requires authentication)

- `PATCH /api/users/me` - Update user profile (requires authentication)
  ```json
  {
    "name": "John Doe",
    "skills": ["grocery-shopping", "dog-walking", "handyman"],
    "latitude": 37.7749,
    "longitude": -122.4194
  }
  ```

- `GET /api/users/me/tasks` - Get user's tasks
  - Query params: `type` (requested|providing)

### Reviews & Reputation

- `POST /api/reviews` - Create a review for completed task (requires authentication)
  ```json
  {
    "taskId": "task-id",
    "rating": 5,
    "comment": "Great job, very professional!"
  }
  ```

- `GET /api/reviews?userId=xxx` - Get reviews for a user

### AI Matching

- `GET /api/matching/recommendations` - Get personalized task recommendations (requires authentication)
  - Query params: `limit` (default: 10)
  - Returns tasks ranked by match score

- `POST /api/matching/providers` - Find best matching providers for a task (requires authentication)
  ```json
  {
    "taskId": "task-id",
    "limit": 10
  }
  ```

### Payments

- `POST /api/payments/create-intent` - Create a Stripe payment intent (requires authentication)
  ```json
  {
    "taskId": "task-id"
  }
  ```

- `POST /api/payments/webhook` - Stripe webhook handler

### Notifications

- `GET /api/notifications` - Get user notifications (requires authentication)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### User
- Profile information (name, email, phone, bio, avatar)
- Location data (latitude, longitude, address)
- Skills array (JSON)
- Reputation (totalRating, reviewCount, completedTasks)

### Task
- Task details (title, description, category)
- Pricing (price, currency, paymentStatus)
- Location (latitude, longitude, address, radius)
- Status (open, assigned, in-progress, completed, cancelled)
- Scheduling (scheduledAt, completedAt, deadline)
- Relations (requester, provider)

### Review
- Rating (1-5 stars)
- Comment
- Relations (task, giver, receiver)

### MatchHistory
- Tracks user-task matches
- Stores match scores
- Records acceptance feedback for ML learning

## Matching Algorithm

The matching algorithm calculates a score (0-100) based on:

1. **Skills Match (35%)**: Does the user have skills matching the task category?
2. **Location (30%)**: How close is the user to the task location? (exponential decay)
3. **Reputation (20%)**: User's average rating from reviews
4. **Experience (15%)**: Number of completed tasks

Match history is stored to enable future ML improvements based on actual user behavior.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npx prisma studio
```

## Environment Variables

- `DATABASE_URL`: SQLite database file path
- `JWT_SECRET`: Secret key for JWT signing
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

## License

MIT
