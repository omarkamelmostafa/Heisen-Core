// frontend/addPathCommentToFile.js
const fs = require("fs");
const path = require("path");

/**
 * Recursively processes all files in a directory and adds path comments
 * @param {string} dir - Directory to process
 * @param {string} frontendRoot - The frontend root path for relative paths
 */
function processDirectory(dir, frontendRoot) {
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!item.includes("node_modules") && !item.startsWith(".")) {
        processDirectory(fullPath, frontendRoot);
      }
    } else if (stat.isFile()) {
      // Process js, jsx, and txt files
      const ext = path.extname(item).toLowerCase();
      if ([".js", ".jsx", ".txt"].includes(ext)) {
        processFile(fullPath, frontendRoot);
      }
    }
  }
}

/**
 * Processes a single file and adds path comment
 * @param {string} filePath - Full path to the file
 * @param {string} frontendRoot - The frontend root path
 */
function processFile(filePath, frontendRoot) {
  try {
    // Extract path starting from "frontend" with forward slashes
    const frontendIndex = filePath.indexOf("frontend\\");
    let frontendPath =
      frontendIndex !== -1
        ? filePath.substring(frontendIndex)
        : path.relative(frontendRoot, filePath);

    // Convert to forward slashes for consistency
    frontendPath = frontendPath.replace(/\\/g, "/");

    const pathComment = `// ${frontendPath}\n`;

    // Read file content
    const content = fs.readFileSync(filePath, "utf8");

    // Check if file already has the exact same path comment
    if (content.startsWith(pathComment)) {
      console.log(`✓ Already up to date: ${frontendPath}`);
      return;
    }

    // Remove any existing path comment
    const contentWithoutExistingComment = content.replace(/^\/\/ [^\n]+\n/, "");
    const newContent = pathComment + contentWithoutExistingComment;

    // Write to file
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`✅ Added to: ${frontendPath}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Main function to start the processing
 */
function addPathCommentsToFrontendFiles() {
  const frontendRoot = __dirname; // Script is located in frontend folder
  const frontendParent = path.dirname(frontendRoot);

  console.log(
    "🚀 Starting major update: Adding path comments to all files...\n"
  );
  console.log(`📁 Frontend Root: ${frontendRoot}`);
  console.log(`📁 Project Root: ${frontendParent}\n`);

  // Process all files recursively starting from frontend folder
  processDirectory(frontendRoot, frontendParent);

  console.log(
    "\n🎉 Major update completed! All JS, JSX, and TXT files have path comments!"
  );
  console.log("📊 Files processed successfully!");
}

// Execute the major update
addPathCommentsToFrontendFiles();
add-pathCommentsToFrontendFiles();


// ******************** BACKEND ***********************
// const fs = require('fs');
// const path = require('path');

// /**
//  * Recursively processes all files in a directory and adds path comments
//  * @param {string} dir - Directory to process
//  * @param {string} backendRoot - The backend root path for relative paths
//  */
// function processDirectory(dir, backendRoot) {
//     const items = fs.readdirSync(dir);

//     for (const item of items) {
//         const fullPath = path.join(dir, item);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//             // Skip node_modules and hidden directories
//             if (!item.includes('node_modules') && !item.startsWith('.')) {
//                 processDirectory(fullPath, backendRoot);
//             }
//         } else if (stat.isFile()) {
//             // Process js, jsx, txt, and other backend file types
//             const ext = path.extname(item).toLowerCase();
//             if (['.js', '.jsx', '.ts', '.tsx', '.txt', '.json', '.md'].includes(ext)) {
//                 processFile(fullPath, backendRoot);
//             }
//         }
//     }
// }

// /**
//  * Processes a single file and adds path comment
//  * @param {string} filePath - Full path to the file
//  * @param {string} backendRoot - The backend root path
//  */
// function processFile(filePath, backendRoot) {
//     try {
//         // Extract path starting from "backend" with forward slashes
//         const backendIndex = filePath.indexOf('backend\\');
//         let backendPath = backendIndex !== -1
//             ? filePath.substring(backendIndex)
//             : path.relative(backendRoot, filePath);

//         // Convert to forward slashes for consistency
//         backendPath = backendPath.replace(/\\/g, '/');

//         const pathComment = `// ${backendPath}\n`;

//         // Read file content
//         const content = fs.readFileSync(filePath, 'utf8');

//         // Check if file already has the exact same path comment
//         if (content.startsWith(pathComment)) {
//             console.log(`✓ Already up to date: ${backendPath}`);
//             return;
//         }

//         // Remove any existing path comment
//         const contentWithoutExistingComment = content.replace(/^\/\/ [^\n]+\n/, '');
//         const newContent = pathComment + contentWithoutExistingComment;

//         // Write to file
//         fs.writeFileSync(filePath, newContent, 'utf8');
//         console.log(`✅ Added to: ${backendPath}`);

//     } catch (error) {
//         console.error(`❌ Error processing ${filePath}:`, error.message);
//     }
// }

// /**
//  * Main function to start the backend processing
//  */
// function addPathCommentsToBackendFiles() {
//     const backendRoot = __dirname; // Script is located in backend folder
//     const backendParent = path.dirname(backendRoot);

//     console.log('🚀 Starting Backend Update: Adding path comments to all backend files...\n');
//     console.log(`📁 Backend Root: ${backendRoot}`);
//     console.log(`📁 Project Root: ${backendParent}\n`);

//     // Process all files recursively starting from backend folder
//     processDirectory(backendRoot, backendParent);

//     console.log('\n🎉 Backend update completed! All backend files have path comments!');
//     console.log('📊 Backend files processed successfully!');
// }

// // Execute the backend update
// addPathCommentsToBackendFiles();
