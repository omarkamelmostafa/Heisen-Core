// backend/utilities/utils.js
import fs from "fs";
import crypto from "crypto";

// Utility functions

export const ensureDirectoryExists = async (directory) => {
  try {
    if (!fs.existsSync(directory)) {
      await fs.promises.mkdir(directory, { recursive: true });
    }
  } catch (error) {
    console.error(
      `Failed to ensure directory exists at ${directory}:`,
      error.message
    );
  }
};

export const ensureFileExists = (filename, filepath) => {
  if (!fs.existsSync(filepath)) {
    fs.writeFileSync(filepath, "", { encoding: "utf-8" }); // Create an empty file
  }
};

export const generateRandomString = (length) => {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
};

/**
 * Populates user roles and permissions and returns structured data.
 *
 * @param {Object} user - The user document to populate.
 * @returns {Object} - An object containing populated roles and additional permissions.
 */
export const populateUserRolesAndPermissions = async (user) => {
  const populatedUser = await user.populate([
    {
      path: "roles",
      populate: {
        path: "permissions",
        select: "name", // Select only the name of permissions
      },
    },
    {
      path: "permissions",
      select: "name", // Populate the directly assigned permissions with names
    },
  ]);

  // Create an array of roles with their IDs, names, and permissions
  const roles = populatedUser.roles.map((role) => ({
    _id: role._id.toString(),
    name: role.name,
    permissions: role.permissions.map((permission) => ({
      _id: permission._id,
      name: permission.name,
    })),
  }));

  // Combine role-based permissions with directly assigned permissions
  const additionalPermissions = [
    ...new Map([
      // ...roles.flatMap((role) =>
      //   role.permissions.map((permission) => [
      //     permission._id.toString(),
      //     permission,
      //   ])
      // ),
      ...populatedUser.permissions.map((permission) => [
        permission._id.toString(),
        {
          _id: permission._id.toString(),
          name: permission.name,
        },
      ]),
    ]).values(),
  ];

  return { roles, additionalPermissions };
};
