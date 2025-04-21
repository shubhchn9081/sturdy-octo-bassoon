import { DatabaseStorage } from './storage';
import { eq } from 'drizzle-orm';
import { users } from '@shared/schema';
import { db } from './db';

// Add missing methods to DatabaseStorage prototype
DatabaseStorage.prototype.updateAdminStatus = async function(id: number, isAdmin: boolean) {
  const [updatedUser] = await db
    .update(users)
    .set({ isAdmin })
    .where(eq(users.id, id))
    .returning();
  
  return updatedUser || undefined;
};