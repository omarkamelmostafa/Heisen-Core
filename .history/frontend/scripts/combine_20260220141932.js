const fs = require("fs");
const path = require("path");

/**
 * File Combiner Utility
 * 
 * Usage: node scripts/combine.js <directory_path> [output_filename]
 */

const TARGET_DIRECTORY = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
const OUTPUT_FILENAME = process.argv[3] || "combined_data.txt";
const EXCLUDE_FILES = [
  OUTPUT_FILENAME,
  path.basename(__filename),
];

function combineFiles() {
  console.log(`🚀 Starting file combination in: ${TARGET_DIRECTORY}`);

  if (!fs.existsSync(TARGET_DIRECTORY)) {
    console.error(`❌ Error: Directory does not exist: ${TARGET_DIRECTORY}`);
    process.exit(1);
  }

  try {
    const files = fs.readdirSync(TARGET_DIRECTORY);
    let combinedContent = "";

    console.log(`🔍 Found ${files.length} items. Processing...`);

    files.forEach((file) => {
      const filePath = path.join(TARGET_DIRECTORY, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory() || EXCLUDE_FILES.includes(file)) {
        return;
      }

      try {
        const content = fs.readFileSync(filePath, "utf8");
        combinedContent += `\n--- START OF FILE: ${file} ---\n\n`;
        combinedContent += content;
        combinedContent += `\n\n--- END OF FILE: ${file} ---\n\n`;
        console.log(`   ✅ Included: ${file}`);
      } catch (readError) {
        console.error(`   ❌ Failed to read ${file}: ${readError.message}`);
      }
    });

    if (combinedContent.trim().length > 0) {
      const outputPath = path.join(TARGET_DIRECTORY, OUTPUT_FILENAME);
      fs.writeFileSync(outputPath, combinedContent.trim(), "utf8");
      console.log(`\n🎉 Successfully created: ${outputPath}`);
    } else {
      console.log("\n⚠️ No content found to combine.");
    }
  } catch (error) {
    console.error(`\nFatal Error: ${error.message}`);
    process.exit(1);
  }
}

combineFiles();
