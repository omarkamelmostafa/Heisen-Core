// backend/services/email/templates/template.engine.js
import fs from "fs/promises";
import path from "path";
import handlebars from "handlebars";

export class TemplateEngine {
  constructor() {
    this.templateCache = new Map();
    this.registerPartials();
  }

  async registerPartials() {
    try {
      const partialsDir = path.join(
        process.cwd(),
        "services/email/templates/layouts"
      );
      const files = await fs.readdir(partialsDir);

      for (const file of files) {
        if (file.endsWith(".hbs")) {
          const partialName = path.basename(file, ".hbs");
          const partialContent = await fs.readFile(
            path.join(partialsDir, file),
            "utf8"
          );
          handlebars.registerPartial(partialName, partialContent);
        }
      }
    } catch (error) {
      console.warn("Could not load partials:", error.message);
    }
  }

  async compile(templateName, data) {
    const cacheKey = `${templateName}-${JSON.stringify(data)}`;

    // Check cache first
    if (this.templateCache.has(cacheKey)) {
      return this.templateCache.get(cacheKey);
    }

    try {
      const templatePath = path.join(
        process.cwd(),
        "services/email/templates",
        `${templateName}.hbs`
      );

      const templateContent = await fs.readFile(templatePath, "utf8");
      const template = handlebars.compile(templateContent);
      const compiledHtml = template(data);

      // Cache the result
      this.templateCache.set(cacheKey, compiledHtml);

      return compiledHtml;
    } catch (error) {
      console.error(`Template compilation failed for ${templateName}:`, error);
      throw new Error(`Template not found or invalid: ${templateName}`);
    }
  }

  clearCache() {
    this.templateCache.clear();
  }
}
