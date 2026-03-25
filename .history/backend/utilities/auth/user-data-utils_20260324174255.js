import League from "../../model/League.js";
import Album from "../../model/Album.js";
import Favorite from "../../model/Favorite.js";
import Photo from "../../model/Photo.js";

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
    profilePicture: user.profilePicture,
    avatar: user.avatar || null,
    isVerified: user.isVerified,
    twoFactorEnabled: user.twoFactorEnabled || false,
    lastLogin: user.lastLogin,
    uuid: user.uuid,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

// export const processUserData = async (foundUser, excludedFields) => {
//   // Populate roles, role permissions, and directly assigned user permissions
//   const populatedUser = await foundUser.populate([
//     {
//       path: "roles",
//       populate: {
//         path: "permissions",
//         select: "key", // Select only the key of permissions
//       },
//     },
//     {
//       path: "permissions",
//       select: "key", // Populate the directly assigned permissions with keys
//     },
//   ]);

//   // Create an array of roles with their IDs, keys, and permissions
//   const roles = populatedUser.roles.map((role) => ({
//     _id: role._id,
//     key: role.key,
//     permissions: role.permissions.map((permission) => ({
//       _id: permission._id,
//       key: permission.key,
//     })),
//   }));

//   // Combine role-based permissions with directly assigned permissions
//   const permissions = [
//     ...new Map([
//       ...roles.flatMap((role) =>
//         role.permissions.map((permission) => [
//           permission._id.toString(),
//           permission,
//         ])
//       ),
//       ...populatedUser.permissions.map((permission) => [
//         permission._id.toString(),
//         {
//           _id: permission._id,
//           key: permission.key,
//         },
//       ]),
//     ]).values(),
//   ];

//   // Exclude specified fields and return the rest
//   const userData = await Promise.all(
//     Object.keys(foundUser.toObject()).map(async (key) => {
//       if (!excludedFields.includes(key)) {
//         if (key === "createdAt" || key === "updatedAt") {
//           return { [key]: new Date(foundUser[key]).toISOString() };
//         } else if (key === "profilePicture") {
//           if (foundUser[key]) {
//             const profilePhoto = foundUser[key]
//               ? await Photo.findById(foundUser[key])
//               : null;

//             const profileAlbum = profilePhoto
//               ? await Album.findById(profilePhoto.album)
//               : null;

//             return {
//               [key]: profilePhoto ? profilePhoto.filename : null,
//               profilePictureId: profilePhoto ? profilePhoto._id : null,
//               profileAlbumId: profileAlbum ? profileAlbum._id : null,
//             };
//           } else {
//             return {
//               [key]: null,
//               profilePictureId: null,
//               profileAlbumId: null,
//             }; // Handle if photo not found
//           }
//         } else {
//           return { [key]: foundUser[key] };
//         }
//       }
//     })
//   );

//   // Find the user's favorite teams document in the database
//   const userFavorites = await Favorite.findOne({ userId: foundUser._id });

//   let favoriteTeams;
//   // Check if the user has any favorite teams
//   if (!userFavorites) {
//     favoriteTeams = [];
//   } else {
//     // Extract the favorite teams array from the document
//     const { favorite } = userFavorites;

//     // Flatten the array of favorite teams and extract unique teamIds
//     const teamIds = favorite.flatMap((fav) => fav.teamIds);

//     // Lookup the teams in the League collection
//     const teams = await League.aggregate([
//       { $unwind: "$teams" },
//       { $match: { "teams._id": { $in: teamIds } } },
//       {
//         $group: {
//           _id: "$sport",
//           teams: {
//             $push: {
//               _id: "$teams._id",
//               teamName: "$teams.teamName",
//               avatarFilename: "$teams.avatarFilename",
//               uuid: "$teams.uuid",
//             },
//           },
//         },
//       },
//     ]);

//     // Construct the final array structure
//     favoriteTeams = teams.map((team) => ({
//       sport: team._id,
//       teams: team.teams,
//     }));
//   }

//   const userDataObject = {
//     ...Object.assign({}, ...userData),
//     roles, // Include the roles array with IDs and names
//     permissions: permissions, // Include the permissions array with IDs and names
//     favoriteTeams: favoriteTeams.length > 0 ? favoriteTeams : [], // Include favorite teams
//   };

//   return userDataObject;
// };
