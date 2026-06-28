import { Request, Response } from 'express';
import * as userService from '../services/user.service';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: 'USER' | 'ADMIN';
  };
}

export const getProfileById = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // BUG: Missing authorization check. Any authenticated user can fetch any profile.
  // PRD: Users can view their own, Admins can view any.
  // CURRENT: If logged in, can view any ID.
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const user = await userService.findUserById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // For simplicity, sensitive fields are assumed to be filtered by the service or omitted.
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, bio } = req.body;

  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // BUG: Security Vulnerability - Missing authorization check.
  // PRD: Users can update their own profile.
  // CURRENT: Any authenticated user can update *any* user's profile by manipulating the ID in the URL.

  // BUG: Missing input validation for `bio` field (e.g., max length, sanitization).
  // This could lead to database errors or excessive data storage/processing.
  // Assuming basic validation for name/email might be handled by a schema/middleware (e.g., Joi/Zod) not shown here.

  try {
    const updatedUser = await userService.updateUser(id, { name, email, bio });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found or update failed' });
    }
    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};