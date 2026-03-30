// addPathCommentToFile.js
const fs = require("fs");
const path = require("path");

/**
 * Adds file path comment to the beginning of a module
 * @param {string} filePath - Path to the file
 */
function addPathCommentToFile(filePath) {
  try {
    // Read the file content
    const content = fs.readFileSync(filePath, "utf8");

    // Get relative path from current directory and format it
    const relativePath = path.relative(process.cwd(), filePath);
    const formattedPath = relativePath.replace(/\\/g, "/"); // Convert to forward slashes

    console.log(first)
    console.log(first)

    // Create the path comment exactly as you want it
    const pathComment = `// ${formattedPath}\n`;

    // // Check if file already has this exact path comment at the beginning
    // if (content.startsWith(pathComment)) {
    //   console.log(`✓ Already has path comment: ${formattedPath}`);
    //   return;
    // }

    // Remove any existing path comment at the beginning
    let newContent = content;
    const existingCommentRegex = /^\/\/ [^\n]+\n/;
    const existingCommentMatch = content.match(existingCommentRegex);

    if (existingCommentMatch) {
      console.log(`🔄 Replacing existing comment in: ${formattedPath}`);
      newContent = content.replace(existingCommentRegex, "");
    }

    // Add the new path comment at the beginning
    newContent = pathComment + newContent;

    // Write back to file
    fs.writeFileSync(filePath, newContent, "utf8");
    console.log(`✓ Added path comment: ${formattedPath}`);
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Processes all JavaScript/TypeScript files in current directory and subdirectories
 */
function processAllModules() {
  const supportedExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];

  function traverseDirectory(dir) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and hidden directories
        if (!item.includes("node_modules") && !item.startsWith(".")) {
          traverseDirectory(fullPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item).toLowerCase();
        if (supportedExtensions.includes(ext)) {
          addPathCommentToFile(fullPath);
        }
      }
    }
  }

  console.log("🚀 Starting to add path comments to modules...\n");
  console.log(`📁 Current directory: ${process.cwd()}\n`);
  traverseDirectory(process.cwd());
  console.log("\n✅ Completed adding path comments!");
}

// Run the script
processAllModules();
