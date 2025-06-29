import { db, tasks, projects } from '../src/index';

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a user ID as argument');
  console.log('Usage: bun run tsx scripts/add-dummy-tasks-for-user.ts <user-id>');
  process.exit(1);
}

async function addDummyTasksForUser(targetUserId: string) {
  try {
    console.log(`Adding dummy tasks for user: ${targetUserId}...`);

    // Create a sample project first
    const [project] = await db!
      .insert(projects)
      .values({
        name: 'Ordo Development',
        description: 'Main development project for Ordo task management app',
        color: '#3b82f6',
        userId: targetUserId,
      })
      .returning();

    console.log('Created project:', project?.name || 'Unknown');

    // Add sample tasks
    const sampleTasks = [
      {
        title: 'Setup PostgreSQL database with Neon',
        description: 'Configure Drizzle ORM and create initial schema',
        priority: 2, // High priority
        completed: true,
        userId: targetUserId,
      },
      {
        title: 'Implement tRPC routes for tasks',
        description: 'Create CRUD operations for tasks with proper Clerk authentication',
        priority: 2, // High priority  
        completed: true,
        userId: targetUserId,
      },
      {
        title: 'Build task display components',
        description: 'Create React components to display tasks in web, desktop, and mobile apps',
        priority: 1, // Medium priority
        completed: false,
        userId: targetUserId,
      },
      {
        title: 'Add task creation functionality',
        description: 'Implement forms to create new tasks with validation',
        priority: 1, // Medium priority
        completed: false,
        userId: targetUserId,
      },
      {
        title: 'Implement real-time task updates',
        description: 'Add WebSocket or polling for real-time task synchronization',
        priority: 0, // Low priority
        completed: false,
        userId: targetUserId,
      },
      {
        title: 'Deploy to production',
        description: 'Setup CI/CD pipeline and deploy all applications',
        priority: 0, // Low priority
        completed: false,
        userId: targetUserId,
      },
    ];

    const insertedTasks = await db!
      .insert(tasks)
      .values(sampleTasks)
      .returning();

    console.log(`Added ${insertedTasks.length} dummy tasks:`);
    insertedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title} (Priority: ${task.priority}, Completed: ${task.completed})`);
    });

    console.log('✅ Dummy data added successfully!');
  } catch (error) {
    console.error('❌ Error adding dummy data:', error);
  }
}

addDummyTasksForUser(userId).then(() => process.exit(0)); 