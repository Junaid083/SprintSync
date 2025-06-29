# SprintSync

SprintSync is an internal tool for engineers to log work, track time, and get AI assistance for planning. Built with Next.js 15, MongoDB, and modern web technologies.

## 🚀 Features

- **Task Management**: Create, edit, delete, and organize tasks
- **Time Tracking**: Track time spent on each task
- **AI Assistance**: Get AI-powered suggestions for task descriptions and planning
- **User Authentication**: Secure JWT-based authentication
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live task status updates
- **Comprehensive Logging**: Structured API logging for observability

## 🛠 Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with HttpOnly cookies
- **Styling**: Tailwind CSS with shadcn/ui components
- **AI Integration**: OpenAI API (with fallback)
- **Language**: TypeScript

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or cloud)
- OpenAI API Key (optional, for AI features)

## 🚀 Quick Start

### Option 1: Local Development

1. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up MongoDB**

   - Install MongoDB locally or use MongoDB Atlas
   - Update MONGODB_URI in .env

3. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Seed demo data**
   \`\`\`bash
   npm run seed
   \`\`\`

## 🔐 Demo Credentials

**Admin User:**

- Email: admin@sprintsync.com
- Password: admin123

**Developer User:**

- Email: developer@sprintsync.com
- Password: admin123

## 📊 API Documentation

### Authentication Endpoints

- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout
- \`GET /api/auth/me\` - Get current user

### Task Endpoints

- \`GET /api/tasks\` - List user tasks
- \`POST /api/tasks\` - Create new task
- \`GET /api/tasks/[id]\` - Get specific task
- \`PUT /api/tasks/[id]\` - Update task
- \`DELETE /api/tasks/[id]\` - Delete task
- \`PATCH /api/tasks/[id]/status\` - Update task status

### AI Endpoints

- \`POST /api/ai/suggest\` - Get AI suggestions for tasks

## 🔍 Observability

All API calls are logged with structured JSON including:

- HTTP method and path
- User ID (when authenticated)
- Response latency
- Success/error status
- Error details and stack traces

Example log entry:
\`\`\`json
{
"timestamp": "2024-01-15T10:30:00.000Z",
"method": "POST",
"path": "/api/tasks",
"userId": "507f1f77bcf86cd799439011",
"latencyMs": 145,
"status": "success"
}
\`\`\`
