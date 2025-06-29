const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb+srv://-------/sprintsync";

async function seedData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("sprintsync");

    // Clear existing data
    await db.collection("users").deleteMany({});
    await db.collection("tasks").deleteMany({});

    // Create demo users
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const users = [
      {
        email: "admin@sprintsync.com",
        passwordHash: hashedPassword,
        isAdmin: true,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "developer@sprintsync.com",
        passwordHash: hashedPassword,
        isAdmin: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "designer@sprintsync.com",
        passwordHash: hashedPassword,
        isAdmin: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        email: "qa@sprintsync.com",
        passwordHash: hashedPassword,
        isAdmin: false,
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const insertedUsers = await db.collection("users").insertMany(users);
    console.log("Users created:", insertedUsers.insertedCount);

    // Create demo tasks assigned to different users
    const adminUserId = insertedUsers.insertedIds[0];
    const devUserId = insertedUsers.insertedIds[1];
    const designerUserId = insertedUsers.insertedIds[2];
    const qaUserId = insertedUsers.insertedIds[3];

    const tasks = [
      {
        title: "Set up CI/CD Pipeline",
        description:
          "Configure GitHub Actions for automated testing and deployment to production environment. This includes setting up workflows for testing, building, and deploying the application.",
        status: "in_progress",
        priority: "high",
        totalMinutes: 180,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        userId: devUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Design User Dashboard",
        description:
          "Create wireframes and mockups for the main user dashboard. Include responsive design considerations and accessibility features.",
        status: "todo",
        priority: "medium",
        totalMinutes: 240,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        userId: designerUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Implement User Authentication",
        description:
          "Add JWT-based authentication with login, logout, and protected routes. Ensure security best practices are followed.",
        status: "done",
        priority: "high",
        totalMinutes: 240,
        userId: devUserId,
        isDeleted: false,
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(),
      },
      {
        title: "Test Payment Integration",
        description:
          "Comprehensive testing of payment gateway integration including edge cases, error handling, and security validation.",
        status: "in_progress",
        priority: "high",
        totalMinutes: 120,
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        userId: qaUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Write API Documentation",
        description:
          "Create comprehensive API documentation using Swagger/OpenAPI specification. Include examples and error codes.",
        status: "todo",
        priority: "low",
        totalMinutes: 60,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        userId: adminUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Fix Critical Bug in Payment Processing",
        description:
          "Urgent fix needed for payment gateway integration causing transaction failures. This is blocking customer transactions.",
        status: "todo",
        priority: "high",
        totalMinutes: 0,
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        userId: devUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Mobile App UI Improvements",
        description:
          "Enhance the mobile application user interface based on user feedback. Focus on improving navigation and reducing cognitive load.",
        status: "todo",
        priority: "medium",
        totalMinutes: 180,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        userId: designerUserId,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Database Performance Optimization",
        description:
          "Analyze and optimize database queries for better performance. Add necessary indexes and optimize slow queries.",
        status: "done",
        priority: "medium",
        totalMinutes: 300,
        userId: devUserId,
        isDeleted: false,
        createdAt: new Date(Date.now() - 172800000),
        updatedAt: new Date(),
      },
    ];

    const insertedTasks = await db.collection("tasks").insertMany(tasks);
    console.log("Tasks created:", insertedTasks.insertedCount);

    console.log("\n=== DEMO CREDENTIALS ===");
    console.log("Admin User:");
    console.log("Email: admin@sprintsync.com");
    console.log("Password: admin123");
    console.log("\nDeveloper User:");
    console.log("Email: developer@sprintsync.com");
    console.log("Password: admin123");
    console.log("\nDesigner User:");
    console.log("Email: designer@sprintsync.com");
    console.log("Password: admin123");
    console.log("\nQA User:");
    console.log("Email: qa@sprintsync.com");
    console.log("Password: admin123");
    console.log("========================\n");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await client.close();
  }
}

seedData();
