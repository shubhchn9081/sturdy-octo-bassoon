import { storage } from './server/storage.js';

async function createAdminUser() {
  try {
    // Check if admin user already exists
    const admin = await storage.getUserByUsername('admin_test');
    
    if (admin) {
      console.log('Admin user already exists with ID:', admin.id);
      return admin;
    }
    
    // Create admin user
    const newAdmin = await storage.createUser({
      username: 'admin_test',
      password: 'admin123', // In a real app, this would be hashed
      email: 'admin@example.com',
      fullName: 'Admin User',
      isAdmin: true
    });
    
    console.log('Created new admin user with ID:', newAdmin.id);
    return newAdmin;
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
}

createAdminUser()
  .then(admin => {
    console.log('Admin user details:', admin);
    process.exit(0);
  })
  .catch(error => {
    console.error('Failed to create admin user:', error);
    process.exit(1);
  });