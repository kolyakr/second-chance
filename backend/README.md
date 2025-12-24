# Second Chance Backend API

Backend API for Second Chance - a community-driven social platform for second-hand clothing.

## Features

- User authentication and authorization (JWT)
- Post management (CRUD operations)
- Comments with threaded replies
- Likes/Stars system
- Reviews and ratings
- User profiles and follow system
- Real-time messaging with Socket.io
- Notifications system
- Admin panel and moderation tools
- File upload for images
- Advanced filtering and search

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Multer

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the backend root directory (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/second-chance
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@secondchance.com
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

3. Make sure MongoDB is running

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## Seeding Database

To populate the database with sample data:

```bash
npm run seed
```

This will create:

- 5 sample users (including 1 admin)
- 5 sample posts
- Comments, likes, and reviews
- Follow relationships

**Default credentials:**

- Admin: `admin@example.com` / `password123`
- User: `john@example.com` / `password123`

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `GET /api/auth/verify-email` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Posts

- `GET /api/posts` - Get all posts (with filters)
- `GET /api/posts/trending` - Get trending posts
- `GET /api/posts/:id` - Get single post
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts` - Create post (Protected)
- `PUT /api/posts/:id` - Update post (Protected)
- `DELETE /api/posts/:id` - Delete post (Protected)

### Comments

- `GET /api/comments/post/:postId` - Get post comments
- `POST /api/comments` - Create comment (Protected)
- `PUT /api/comments/:id` - Update comment (Protected)
- `DELETE /api/comments/:id` - Delete comment (Protected)
- `POST /api/comments/:id/report` - Report comment (Protected)

### Likes

- `GET /api/likes/user` - Get user's liked posts (Protected)
- `GET /api/likes/:postId` - Check if liked (Protected)
- `POST /api/likes/:postId` - Toggle like (Protected)

### Reviews

- `GET /api/reviews/post/:postId` - Get post reviews
- `GET /api/reviews/user/:userId` - Get user reviews
- `POST /api/reviews` - Create review (Protected)
- `PUT /api/reviews/:id` - Update review (Protected)
- `DELETE /api/reviews/:id` - Delete review (Protected)

### Users

- `GET /api/users/:id` - Get user profile
- `GET /api/users/dashboard` - Get dashboard data (Protected)
- `GET /api/users/saved` - Get saved posts (Protected)
- `POST /api/users/save/:postId` - Save/unsave post (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `POST /api/users/:id/follow` - Follow/unfollow user (Protected)

### Messages

- `GET /api/messages/conversations` - Get user conversations (Protected)
- `GET /api/messages/conversation/:userId` - Get or create conversation (Protected)
- `GET /api/messages/conversation/:conversationId/messages` - Get messages (Protected)
- `POST /api/messages` - Send message (Protected)

### Notifications

- `GET /api/notifications` - Get notifications (Protected)
- `PUT /api/notifications/:id/read` - Mark as read (Protected)
- `PUT /api/notifications/read-all` - Mark all as read (Protected)
- `DELETE /api/notifications/:id` - Delete notification (Protected)

### Admin

- `GET /api/admin/analytics` - Get platform analytics (Admin)
- `GET /api/admin/users` - Get all users (Admin)
- `PUT /api/admin/users/:id/ban` - Ban/unban user (Admin)
- `DELETE /api/admin/posts/:id` - Delete post (Admin)
- `GET /api/admin/comments/reported` - Get reported comments (Admin)
- `DELETE /api/admin/comments/:id` - Delete comment (Admin)

### Upload

- `POST /api/upload/single` - Upload single image (Protected)
- `POST /api/upload/multiple` - Upload multiple images (Protected)

## Socket.io Events

### Client → Server

- `join-user-room` - Join user's personal notification room
- `join-conversation` - Join conversation room
- `send-message` - Send a new message
- `typing` - Send typing indicator

### Server → Client

- `new-message` - New message received
- `new-message-notification` - New message notification
- `user-typing` - User typing indicator

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/     # Express middleware
│   ├── models/         # Mongoose models
│   ├── routes/          # Express routes
│   ├── scripts/         # Utility scripts (seed, etc.)
│   ├── utils/           # Utility functions
│   └── server.ts        # Main server file
├── uploads/             # Uploaded files (created automatically)
├── .env.example         # Environment variables example
├── package.json
├── tsconfig.json
└── README.md
```

## Security Features

- JWT authentication
- Password hashing with bcrypt
- Rate limiting
- Helmet.js for security headers
- Input validation with express-validator
- CORS configuration
- XSS protection

## Error Handling

The API uses a centralized error handler. All errors are returned in the following format:

```json
{
  "success": false,
  "message": "Error message"
}
```

## Notes

- Image uploads are stored locally in the `uploads` directory
- For production, consider using cloud storage (AWS S3, Cloudinary, etc.)
- Email functionality requires proper SMTP configuration
- Socket.io is configured for real-time messaging and notifications

## License

ISC
