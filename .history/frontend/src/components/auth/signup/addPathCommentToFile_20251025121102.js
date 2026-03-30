// frontend\src\components\auth\signup\addPathCommentToFile.js
const fs = require("fs");
const path = require("path");

function addRelativePathComments() {
  const scriptDir = __dirname;

  console.log("🚀 Starting to add path comments...\n");

  const files = fs.readdirSync(scriptDir);

  files.forEach((file) => {
    const filePath = path.join(scriptDir, file);
    const stat = fs.statSync(filePath);

    if (
      (stat.isFile() && path.extname(file) === ".js") ||
      (path.extname(file) === ".jsx" && file !== path.basename(__filename))
    ) {
      console.log("filePath: ", filePath);

      // Extract path starting from "frontend" with backslashes
      const frontendIndex = filePath.indexOf("frontend\\");
      const frontendPath =
        frontendIndex !== -1 ? filePath.substring(frontendIndex) : filePath;

      const pathComment = `// ${frontendPath}\n`;

      console.log(`📝 Will add: // ${frontendPath}`);

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
    '\n✅ All JS files now have path comments starting from "frontend"!'
  );
}

// Execute the function
addRelativePathComments();
