const fs = require("fs");
const path = require("path");

function addRelativePathComments() {
  const scriptDir = __dirname;
  const projectRoot = process.cwd();

  console.log("📁 Project Root:", projectRoot);
  console.log("🚀 Starting to add path comments...\n");

  const files = fs.readdirSync(scriptDir);

  files.forEach((file) => {
    const filePath = path.join(scriptDir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isFile() &&
      path.extname(file) === ".js" &&
      file !== path.basename(__filename)
    ) {
      // Get relative path from project root
      const relativePath = path
        .relative(projectRoot, filePath)
        .replace(/\\/g, "/");

      // Extract path starting from "frontend"
      const frontendPath = relativePath.includes("frontend/")
        ? relativePath.split("frontend/")[1]
        : relativePath;

      console.log("frontendPath: ", frontendPath);
      const pathComment = `// frontend/${frontendPath}\n`;

      console.log(`📝 Will add: // frontend/${frontendPath}`);

      // Read file content
      const content = fs.readFileSync(filePath, "utf8");

      // Remove any existing path comment and add new one
      const contentWithoutExistingComment = content.replace(
        /^\/\/ [^\n]+\n/,
        ""
      );
      const newContent = pathComment + contentWithoutExistingComment;

      // Write to file
      fs.writeFileSync(filePath, newContent, "utf8");
    }
  });

  console.log(
    '\n✅ All JS files now have relative path comments starting from "frontend"!'
  );
}

// Execute the function
addRelativePathComments();
