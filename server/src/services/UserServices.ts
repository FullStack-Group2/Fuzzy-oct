import { UserModel, IUser } from '../models/User';
import { VendorModel, IVendor } from '../models/Vendor';
import { CustomerModel, ICustomer } from '../models/Customer';
import { ShipperModel, IShipper } from '../models/Shipper';
import { UserRole } from '../models/UserRole';

// Union type for all user types
type AnyUser = IVendor | ICustomer | IShipper;

export class UserServices {
  /**
   * Find a user by username across all user types (Vendor, Customer, Shipper)
   * @param username - The username to search for
   * @returns Promise<AnyUser | null> - The user document or null if not found
   */
  static async findByUserName(username: string): Promise<AnyUser | null> {
    try {
      // Search across all user types using discriminator models
      let user: AnyUser | null = await VendorModel.findOne({ username }).select('+password');
      
      if (!user) {
        user = await CustomerModel.findOne({ username }).select('+password');
      }
      
      if (!user) {
        user = await ShipperModel.findOne({ username }).select('+password').populate('assignedHub');
      }
      
      return user;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find a user by username and role
   * @param username - The username to search for
   * @param role - The specific role to search within
   * @returns Promise<AnyUser | null> - The user document or null if not found
   */
  static async findByUserNameAndRole(username: string, role: UserRole): Promise<AnyUser | null> {
    try {
      let user: AnyUser | null = null;
      
      switch (role) {
        case UserRole.VENDOR:
          user = await VendorModel.findOne({ username }).select('+password');
          break;
        case UserRole.CUSTOMER:
          user = await CustomerModel.findOne({ username }).select('+password');
          break;
        case UserRole.SHIPPER:
          user = await ShipperModel.findOne({ username }).select('+password').populate('assignedHub');
          break;
        default:
          throw new Error('Invalid user role');
      }
      
      return user;
    } catch (error) {
      console.error('Error finding user by username and role:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find a user by ID
   * @param userId - The user ID to search for
   * @returns Promise<IUser | null> - The user document or null if not found
   */
  static async findById(userId: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findById(userId);
      return user;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Check if a username already exists
   * @param username - The username to check
   * @returns Promise<boolean> - True if username exists, false otherwise
   */
  static async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await this.findByUserName(username);
      return user !== null;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw new Error('Failed to check username');
    }
  }

  /**
   * Get all users with pagination
   * @param page - Page number (default: 1)
   * @param limit - Number of users per page (default: 10)
   * @returns Promise<{users: IUser[], total: number, page: number, pages: number}>
   */
  static async getAllUsers(page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      const users = await UserModel.find()
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      
      const total = await UserModel.countDocuments();
      const pages = Math.ceil(total / limit);
      
      return {
        users,
        total,
        page,
        pages
      };
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to get users');
    }
  }

  /**
   * Get users by role
   * @param role - The user role to filter by
   * @param page - Page number (default: 1)
   * @param limit - Number of users per page (default: 10)
   * @returns Promise<{users: AnyUser[], total: number, page: number, pages: number}>
   */
  static async getUsersByRole(role: UserRole, page: number = 1, limit: number = 10) {
    try {
      const skip = (page - 1) * limit;
      
      let users: AnyUser[];
      let total: number;
      
      switch (role) {
        case UserRole.VENDOR:
          users = await VendorModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
          total = await VendorModel.countDocuments();
          break;
        case UserRole.CUSTOMER:
          users = await CustomerModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
          total = await CustomerModel.countDocuments();
          break;
        case UserRole.SHIPPER:
          users = await ShipperModel.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
          total = await ShipperModel.countDocuments();
          break;
        default:
          throw new Error('Invalid user role');
      }
      
      const pages = Math.ceil(total / limit);
      
      return {
        users,
        total,
        page,
        pages
      };
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw new Error('Failed to get users');
    }
  }
}
