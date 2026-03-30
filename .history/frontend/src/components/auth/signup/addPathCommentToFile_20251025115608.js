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

    // Create the path comment exactly as you want it
    const pathComment = `// ${formattedPath}\n`;

    // Check if file already has this exact path comment at the beginning
    if (content.startsWith(pathComment)) {
      console.log(`✓ Already has path comment: ${formattedPath}`);
      return;
    }

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
 