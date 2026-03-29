import fs from "fs";

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


