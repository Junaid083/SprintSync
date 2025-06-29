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

### Option 1: Docker Deployment (Recommended)

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd sprintsync
   \`\`\`

2. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env

   # Edit .env with your configuration

   \`\`\`

3. **Seed demo data**
   \`\`\`bash
   npm run seed
   \`\`\`

4. **Access the application**
   - Open http://localhost:3000
   - Login with demo credentials (see below)

### Option 2: Local Development

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

## 📁 Project Structure

\`\`\`
sprintsync/
├── app/ # Next.js App Router pages
│ ├── api/ # API routes
│ ├── auth/ # Authentication pages
│ ├── dashboard/ # Dashboard page
│ ├── tasks/ # Task management pages
│ └── globals.css # Global styles
├── components/ # React components
├── lib/ # Utilities and services
│ ├── models/ # MongoDB models
│ ├── services/ # API service layer
│ ├── auth.ts # Authentication utilities
│ ├── db.ts # Database connection
│ └── types.ts # TypeScript types
├── scripts/ # Database scripts
└── README.md # This file
\`\`\`

## 🔧 Configuration

### Environment Variables

\`\`\`env

# Database

MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=sprintsync

# Authentication

JWT_SECRET=your-super-secret-jwt-key

# AI Integration (Optional)

OPENAI_API_KEY=your-openai-api-key

# Environment

NODE_ENV=development
\`\`\`

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

## 🧪 Testing

Run the application locally and test the following workflows:

1. **Authentication Flow**

   - Login with demo credentials
   - Access protected routes
   - Logout functionality

2. **Task Management**

   - Create new tasks
   - Edit existing tasks
   - Update task status
   - Delete tasks

3. **AI Integration**
   - Use AI suggest feature
   - Verify fallback when API unavailable

## 🔧 Development

### Adding New Features

1. **Database Models**: Add to \`lib/models/\`
2. **API Routes**: Create in \`app/api/\`
3. **Components**: Add to \`components/\`
4. **Services**: Update \`lib/services/\`
5. **Types**: Define in \`lib/types.ts\`

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Structured logging for debugging
- Error boundaries for resilience

## 📈 Performance Considerations

- **Database Indexing**: Optimized MongoDB queries
- **Caching**: HTTP caching headers
- **Bundle Optimization**: Tree shaking and code splitting

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **HttpOnly Cookies**: XSS protection
- **Input Validation**: Server-side validation
- **CORS Configuration**: Controlled cross-origin requests
- **Environment Variables**: Secure configuration management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Team collaboration features
- [ ] Advanced reporting and analytics
- [ ] Mobile app
- [ ] Integration with external tools (Jira, GitHub)
- [ ] Advanced AI features (daily planning, workload optimization)

\`\`\`
