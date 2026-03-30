export const sanitizeUserForResponse = (user) => {
  return {
    id: user._id,
    firstname: user.firstname,
    lastname: user.lastname,
    email: user.email,
    // roles: user.roles,
    // permissions: user.permissions,
    avatar: user.avatar || null,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled || false,
    lastLogin: user.lastLogin,
    uuid: user.uuid,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};
