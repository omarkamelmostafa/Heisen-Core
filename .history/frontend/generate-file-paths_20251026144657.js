const fs = require("fs");
const path = require("path");

class FilePathGenerator {
  constructor(rootDir = __dirname) {
    this.rootDir = rootDir;
    this.excludedDirs = ["node_modules", ".git", ".next", "dist", "build"];
    this.excludedFiles = [".DS_Store", "Thumbs.db"];
  }

  /**
   * Recursively scan directory and return all file paths
   */
  scanDirectory(dir = this.rootDir) {
    let results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.shouldExcludeDirectory(item)) {
          results = results.concat(this.scanDirectory(fullPath));
        }
      } else {
        if (!this.shouldExcludeFile(item)) {
          const relativePath = path
            .relative(this.rootDir, fullPath)
            .replace(/\\/g, "/");
          results.push({
            path: relativePath,
            size: stat.size,
            modified: stat.mtime,
          });
        }
      }
    }

    return results;
  }

  /**
   * Check if directory should be excluded
   */
  shouldExcludeDirectory(dirName) {
    return this.excludedDirs.includes(dirName) || dirName.startsWith(".");
  }

  /**
   * Check if file should be excluded
   */
  shouldExcludeFile(fileName) {
    return this.excludedFiles.includes(fileName);
  }

  /**
   * Generate comprehensive file list
   */
  generateComprehensiveList(outputFile = "project-structure.txt") {
    console.log("🔍 Scanning project structure...\n");

    const allFiles = this.scanDirectory();

    // Group by file type
    const groupedFiles = this.groupByExtension(allFiles);

    // Generate report
    let report = `PROJECT STRUCTURE REPORT\n`;
    report += `Generated: ${new Date().toISOString()}\n`;
    report += `Root Directory: ${this.rootDir}\n`;
    report += `Total Files: ${allFiles.length}\n\n`;

    report += `FILE TYPES BREAKDOWN:\n`;
    Object.keys(groupedFiles).forEach((ext) => {
      report += `${ext}: ${groupedFiles[ext].length} files\n`;
    });

    report += `\nALL FILES:\n`;
    allFiles.forEach((file) => {
      report += `${file.path}\n`;
    });

    fs.writeFileSync(outputFile, report, "utf8");

    console.log(`✅ Generated comprehensive report: ${outputFile}`);
    console.log(`📊 Total files: ${allFiles.length}`);

    return allFiles;
  }

  /**
   * Group files by extension
   */
  groupByExtension(files) {
    const groups = {};
    files.forEach((file) => {
      const ext = path.extname(file.path) || "no-extension";
      if (!groups[ext]) groups[ext] = [];
      groups[ext].push(file);
    });
    return groups;
  }
}

// Export the class
module.exports = FilePathGenerator;

// Usage example
if (require.main === module) {
  const generator = new FilePathGenerator();
  generator.generateComprehensiveList();
}
