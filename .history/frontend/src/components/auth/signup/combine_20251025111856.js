// combine.js
// combine.js
const fs = require("fs");
const path = require("path");

// --- Configuration ---
const OUTPUT_FILENAME = "combined_data.txt";
const CURRENT_DIRECTORY = process.cwd();
const EXCLUDE_FILES = [
  OUTPUT_FILENAME, // Don't include the output file itself
  path.basename(__filename), // Don't include the script file itself (e.g., 'combine.js')
];

/**
 * Reads the content of all relevant files in the current directory and
 * writes the combined content to a single output file.
 */
function combineFiles() {
  console.log(`🚀 Starting file combination in: ${CURRENT_DIRECTORY}`);

  try {
    // 1. Read all files/directories in the current folder
    const files = fs.readdirSync(CURRENT_DIRECTORY);
    let combinedContent = "";

    console.log(
      `\n🔍 Found ${files.length} items. Filtering and processing...`
    );

    // 2. Iterate through each item
    files.forEach((file) => {
      const filePath = path.join(CURRENT_DIRECTORY, file);
      const stats = fs.statSync(filePath);

      // 3. Skip directories and excluded files
      if (stats.isDirectory() || EXCLUDE_FILES.includes(file)) {
        return; // Skip this file/folder
      }

      try {
        // 4. Read the file content
        const content = fs.readFileSync(filePath, "utf8");

        // 5. Add a separator and the file content to the combined string
        combinedContent += `\n--- START OF FILE: ${file} ---\n\n`;
        combinedContent += content;
        combinedContent += `\n\n--- END OF FILE: ${file} ---\n\n`;

        console.log(`   ✅ Included: ${file}`);
      } catch (readError) {
        // Handle cases where a file exists but can't be read (e.g., permission error)
        console.error(`   ❌ Failed to read ${file}: ${readError.message}`);
      }
    });

    // 6. Write the final content to the output file
    if (combinedContent.trim().length > 0) {
      fs.writeFileSync(
        path.join(CURRENT_DIRECTORY, OUTPUT_FILENAME),
        combinedContent.trim(),
        "utf8"
      );
      console.log(
        `\n🎉 Successfully created and saved data to: ${OUTPUT_FILENAME}`
      );
      console.log(
        `   Total content size: ${Math.round(combinedContent.length / 1024)} KB`
      );
    } else {
      console.log(
        "\n⚠️ No content found to combine. The output file was not created."
      );
    }
  } catch (dirError) {
    console.error(`\nFatal Error reading directory: ${dirError.message}`);
    process.exit(1); // Exit with an error code
  }
}

// Execute the main function
combineFiles();
