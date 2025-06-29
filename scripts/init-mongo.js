// MongoDB initialization script
const db = db.getSiblingDB("sprintsync")

// Create users collection with indexes
db.createCollection("users")
db.users.createIndex({ email: 1 }, { unique: true })

// Create tasks collection with indexes
db.createCollection("tasks")
db.tasks.createIndex({ userId: 1, createdAt: -1 })
db.tasks.createIndex({ status: 1 })

print("Database initialized successfully")
