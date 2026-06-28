// This is a mock Prisma client for demonstration purposes.
// In a real application, a PrismaClient instance would be imported and used.
const prisma = {
  user: {
    findUnique: async (args: { where: { id: string } }) => {
      // Mock DB interaction
      if (args.where.id === 'user123') {
        return { id: 'user123', name: 'Alice', email: 'alice@example.com', bio: 'Software Engineer', role: 'USER', passwordHash: 'hashedpassword' };
      }
      if (args.where.id === 'admin456') {
        return { id: 'admin456', name: 'Bob', email: 'bob@example.com', bio: 'Lead Admin', role: 'ADMIN', passwordHash: 'hashedpassword' };
      }
      return null;
    },
    update: async (args: { where: { id: string }, data: { name?: string, email?: string, bio?: string } }) => {
      // Mock DB interaction
      // In a real scenario, this would interact with the actual database.
      if (args.where.id === 'user123' || args.where.id === 'admin456') {
        const existingUser = await prisma.user.findUnique({ where: { id: args.where.id } });
        if (existingUser) {
          return { ...existingUser, ...args.data }; // Return updated mock user
        }
      }
      return null;
    },
  },
};

export const findUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  // Filter out password and other sensitive fields before returning.
  if (user) {
    const { passwordHash, role, ...profile } = user; // Example of filtering sensitive data
    return profile;
  }
  return null;
};

export const updateUser = async (id: string, data: { name?: string, email?: string, bio?: string }) => {
  // Ensure we only update allowed fields to prevent mass assignment vulnerabilities.
  const allowedFields: (keyof typeof data)[] = ['name', 'email', 'bio'];
  const updateData: Partial<typeof data> = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  }

  // Logic Flaw (subtle): If `updateData` is empty (e.g., only disallowed fields or undefineds were passed),
  // this still proceeds to call the ORM update method, which is inefficient.
  // A check `if (Object.keys(updateData).length === 0) return null;` could prevent this.

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return updatedUser;
};