export const processUserData = async (user, excludedFields = []) => {
  const userObject = user.toObject ? user.toObject() : user;

  // Always exclude these fields by default
  const defaultExcluded = [
    "password",
    "refreshToken",
    "loginAttempts",
    "isLocked",
    "lockUntil",
  ];
  const allExcluded = [...new Set([...defaultExcluded, ...excludedFields])];

  allExcluded.forEach((field) => {
    delete userObject[field];
  });

  return userObject;
};

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
