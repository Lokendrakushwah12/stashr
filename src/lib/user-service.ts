import clientPromise from "./mongodb-adapter";

export interface UserUpdateData {
  userType?: 'admin' | 'user';
  name?: string;
  image?: string;
}

export class UserService {
  private static async getClient() {
    return await clientPromise;
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string) {
    const client = await this.getClient();
    const db = client.db();
    
    const user = await db.collection("users").findOne({ email }) as { userType?: string } | null;
    if (!user) return null;
    
    return {
      ...user,
      userType: user.userType ?? 'user', // Default fallback
    };
  }

  /**
   * Update user type (admin only)
   */
  static async updateUserType(email: string, userType: 'admin' | 'user') {
    const client = await this.getClient();
    const db = client.db();
    
    const result = await db.collection("users").updateOne(
      { email },
      { 
        $set: { 
          userType,
          updatedAt: new Date()
        }
      }
    );
    
    return result.modifiedCount > 0;
  }

  /**
   * Get all users with their types
   */
  static async getAllUsers() {
    const client = await this.getClient();
    const db = client.db();
    
    const users = await db.collection("users").find({}).toArray() as { userType?: string }[];
    
    return users.map(user => ({
      ...user,
      userType: user.userType ?? 'user', // Default fallback
    }));
  }

  /**
   * Ensure all users have userType field
   */
  static async ensureUserTypes() {
    const client = await this.getClient();
    const db = client.db();
    
    // Find users without userType
    const usersWithoutType = await db.collection("users").find({
      userType: { $exists: false }
    }).toArray();
    
    if (usersWithoutType.length === 0) {
      return { updated: 0, message: "All users already have userType" };
    }
    
    // Update users without userType to default to 'user'
    const result = await db.collection("users").updateMany(
      { userType: { $exists: false } },
      { 
        $set: { 
          userType: 'user',
          updatedAt: new Date()
        }
      }
    );
    
    return {
      updated: result.modifiedCount,
      message: `Updated ${result.modifiedCount} users with default userType`
    };
  }

  /**
   * Set specific user as admin
   */
  static async setUserAsAdmin(email: string) {
    return await this.updateUserType(email, 'admin');
  }

  /**
   * Set specific user as regular user
   */
  static async setUserAsRegular(email: string) {
    return await this.updateUserType(email, 'user');
  }
}
