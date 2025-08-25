import { UserModel, IUser } from '../models/User';
import { VendorModel, IVendor } from '../models/Vendor';
import { CustomerModel, ICustomer } from '../models/Customer';
import { ShipperModel, IShipper } from '../models/Shipper';
import { UserRole } from '../models/UserRole';
import bcrypt from 'bcrypt';

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
      let user: AnyUser | null = await VendorModel.findOne({ username }).select(
        '+password',
      );

      if (!user) {
        user = await CustomerModel.findOne({ username }).select('+password');
      }

      if (!user) {
        user = await ShipperModel.findOne({ username })
          .select('+password')
          .populate('assignedHub');
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
  static async findByUserNameAndRole(
    username: string,
    role: UserRole,
  ): Promise<AnyUser | null> {
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
          user = await ShipperModel.findOne({ username })
            .select('+password')
            .populate('assignedHub');
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
  static async findByEmail(email: string): Promise<IUser | null> {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      console.error('Error finding user by email:', error);
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
   * Find a user by ID with password field included
   * @param userId - The user ID to search for
   * @returns Promise<AnyUser | null> - The user document with password or null if not found
   */
  static async findByIdWithPassword(userId: string): Promise<AnyUser | null> {
    try {
      // Try to find user in each collection with password field
      let user: AnyUser | null =
        await VendorModel.findById(userId).select('+password');

      if (!user) {
        user = await CustomerModel.findById(userId).select('+password');
      }

      if (!user) {
        user = await ShipperModel.findById(userId)
          .select('+password')
          .populate('assignedHub');
      }

      return user;
    } catch (error) {
      console.error('Error finding user by ID with password:', error);
      throw new Error('Failed to find user');
    }
  }
  // Check if username already exists
  static async usernameExists(username: string): Promise<boolean> {
    try {
      const user = await UserModel.findOne({ username });
      return !!user;
    } catch (error) {
      console.error('Error checking username existence:', error);
      throw new Error('Failed to check username');
    }
  }
  static async updatePassword(
    userId: string,
    newPassword: string,
  ): Promise<IUser | null> {
    try {
      console.log('Password updated successfully for user:', userId);
      // First, find the user with the current password
      const existingUser = await UserServices.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }

      // Comprehensive password validation to match frontend requirements
      if (newPassword.length < 8) {
        throw new Error('New password must be at least 8 characters long');
      }

      if (!/[A-Z]/.test(newPassword)) {
        throw new Error(
          'New password must contain at least one uppercase letter',
        );
      }

      if (!/[a-z]/.test(newPassword)) {
        throw new Error(
          'New password must contain at least one lowercase letter',
        );
      }

      if (!/\d/.test(newPassword)) {
        throw new Error('New password must contain at least one number');
      }

      if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        throw new Error(
          'New password must contain at least one special character',
        );
      }

      console.log('New password validation passed for user:', userId);

      // Hash the new password before saving
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);
      console.log('Updating password for user:', userId);

      // Update the password using the correct filter
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { password: hashedNewPassword },
        { new: true, runValidators: true },
      ).select('-password');
      console.log('Updated user:', updatedUser);

      return updatedUser;
    } catch (error) {
      console.error('Error updating password:', error);
      throw new Error(
        error instanceof Error ? error.message : 'Failed to update password',
      );
    }
  }
}
