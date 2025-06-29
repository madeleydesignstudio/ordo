import { db, tasks, projects } from '../src/index';

const DANIEL_USER_ID = 'user_2pYvDPKqXKktmF2Ue6Uy2ZwS1xx'; // Clerk user ID format for daniel@madeleydesignstudio.com

async function addDummyTasks() {
  try {
    console.log('Adding dummy tasks for Daniel...');

    // Create a sample project first
    const [project] = await db
      .insert(projects)
      .values({
        name: 'Ordo Development',
        description: 'Main development project for Ordo task management app',
        color: '#3b82f6',
        userId: DANIEL_USER_ID,
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
        userId: DANIEL_USER_ID,
      },
      {
        title: 'Implement tRPC routes for tasks',
        description: 'Create CRUD operations for tasks with proper Clerk authentication',
        priority: 2, // High priority  
        completed: true,
        userId: DANIEL_USER_ID,
      },
      {
        title: 'Build task display components',
        description: 'Create React components to display tasks in web, desktop, and mobile apps',
        priority: 1, // Medium priority
        completed: false,
        userId: DANIEL_USER_ID,
      },
      {
        title: 'Add task creation functionality',
        description: 'Implement forms to create new tasks with validation',
        priority: 1, // Medium priority
        completed: false,
        userId: DANIEL_USER_ID,
      },
      {
        title: 'Implement real-time task updates',
        description: 'Add WebSocket or polling for real-time task synchronization',
        priority: 0, // Low priority
        completed: false,
        userId: DANIEL_USER_ID,
      },
      {
        title: 'Deploy to production',
        description: 'Setup CI/CD pipeline and deploy all applications',
        priority: 0, // Low priority
        completed: false,
        userId: DANIEL_USER_ID,
      },
    ];

    const insertedTasks = await db
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

addDummyTasks().then(() => process.exit(0)); 