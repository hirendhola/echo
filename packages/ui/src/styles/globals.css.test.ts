import { describe, test, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";

describe("globals.css - CSS Validation", () => {
  let cssContent: string;

  try {
    cssContent = readFileSync(join(__dirname, "globals.css"), "utf-8");
  } catch (error) {
    cssContent = "";
  }

  describe("file structure", () => {
    test("should exist and be readable", () => {
      expect(cssContent).toBeDefined();
      expect(cssContent.length).toBeGreaterThan(0);
    });

    test("should contain CSS content", () => {
      expect(cssContent.includes("@")).toBe(true);
    });

    test("should include Tailwind directives", () => {
      expect(cssContent).toContain("@tailwind base");
      expect(cssContent).toContain("@tailwind components");
      expect(cssContent).toContain("@tailwind utilities");
    });
  });

  describe(":root CSS variables", () => {
    test("should define :root selector", () => {
      expect(cssContent).toContain(":root");
    });

    test("should define background color variable", () => {
      expect(cssContent).toContain("--background:");
    });

    test("should define foreground color variable", () => {
      expect(cssContent).toContain("--foreground:");
    });

    test("should define primary color variable", () => {
      expect(cssContent).toContain("--primary:");
    });

    test("should define secondary color variable", () => {
      expect(cssContent).toContain("--secondary:");
    });

    test("should define muted color variable", () => {
      expect(cssContent).toContain("--muted:");
    });

    test("should define accent color variable", () => {
      expect(cssContent).toContain("--accent:");
    });

    test("should define destructive color variable", () => {
      expect(cssContent).toContain("--destructive:");
    });

    test("should define border color variable", () => {
      expect(cssContent).toContain("--border:");
    });

    test("should define input color variable", () => {
      expect(cssContent).toContain("--input:");
    });

    test("should define ring color variable", () => {
      expect(cssContent).toContain("--ring:");
    });

    test("should define radius variable", () => {
      expect(cssContent).toContain("--radius:");
    });

    test("should define chart color variables", () => {
      expect(cssContent).toContain("--chart-1:");
      expect(cssContent).toContain("--chart-2:");
      expect(cssContent).toContain("--chart-3:");
      expect(cssContent).toContain("--chart-4:");
      expect(cssContent).toContain("--chart-5:");
    });

    test("should define sidebar variables", () => {
      expect(cssContent).toContain("--sidebar:");
      expect(cssContent).toContain("--sidebar-foreground:");
      expect(cssContent).toContain("--sidebar-primary:");
      expect(cssContent).toContain("--sidebar-accent:");
      expect(cssContent).toContain("--sidebar-border:");
    });

    test("should define font variables", () => {
      expect(cssContent).toContain("--font-sans:");
      expect(cssContent).toContain("--font-mono:");
    });

    test("should define shadow variables", () => {
      expect(cssContent).toContain("--shadow");
    });
  });

  describe(".dark theme", () => {
    test("should define .dark class", () => {
      expect(cssContent).toContain(".dark");
    });

    test("should override color variables for dark mode", () => {
      const darkSection = cssContent.split(".dark")[1];
      expect(darkSection).toBeDefined();
      expect(darkSection).toContain("--background:");
      expect(darkSection).toContain("--foreground:");
    });
  });

  describe("@theme inline", () => {
    test("should define @theme inline directive", () => {
      expect(cssContent).toContain("@theme inline");
    });

    test("should map CSS variables to Tailwind theme", () => {
      expect(cssContent).toContain("--color-background:");
      expect(cssContent).toContain("--color-foreground:");
      expect(cssContent).toContain("--color-primary:");
    });

    test("should define radius scale", () => {
      expect(cssContent).toContain("--radius-sm:");
      expect(cssContent).toContain("--radius-md:");
      expect(cssContent).toContain("--radius-lg:");
      expect(cssContent).toContain("--radius-xl:");
    });
  });

  describe("body styles", () => {
    test("should define body styles", () => {
      expect(cssContent).toContain("body");
    });

    test("should apply letter-spacing to body", () => {
      const bodySection = cssContent.split("body")[1];
      if (bodySection) {
        expect(bodySection).toContain("letter-spacing:");
      }
    });
  });

  describe("@layer base", () => {
    test("should define @layer base", () => {
      expect(cssContent).toContain("@layer base");
    });

    test("should set global styles in base layer", () => {
      const baseSection = cssContent.split("@layer base")[1];
      expect(baseSection).toBeDefined();
    });
  });

  describe("color format validation", () => {
    test("should use oklch color format", () => {
      expect(cssContent).toContain("oklch(");
    });

    test("should define valid oklch values", () => {
      const oklchMatches = cssContent.match(/oklch\([^)]+\)/g);
      expect(oklchMatches).toBeDefined();
      expect(oklchMatches!.length).toBeGreaterThan(0);
    });

    test("should have consistent color definitions", () => {
      const rootColors = cssContent.match(/--[a-z-]+:\s*oklch\([^)]+\);/g);
      expect(rootColors).toBeDefined();
      expect(rootColors!.length).toBeGreaterThan(10);
    });
  });

  describe("CSS syntax validation", () => {
    test("should have balanced brackets", () => {
      const openBraces = (cssContent.match(/{/g) || []).length;
      const closeBraces = (cssContent.match(/}/g) || []).length;
      expect(openBraces).toBe(closeBraces);
    });

    test("should have balanced parentheses", () => {
      const openParens = (cssContent.match(/\(/g) || []).length;
      const closeParens = (cssContent.match(/\)/g) || []).length;
      expect(openParens).toBe(closeParens);
    });

    test("should not have obvious syntax errors", () => {
      expect(cssContent).not.toContain(";;");
      expect(cssContent).not.toContain("{{");
      expect(cssContent).not.toContain("}}");
    });

    test("should properly terminate declarations", () => {
      const invalidDeclarations = cssContent.match(/[a-z-]+:\s*[^;{]+[{]/g);
      expect(invalidDeclarations).toBeNull();
    });
  });

  describe("design token completeness", () => {
    test("should define all primary color tokens", () => {
      const requiredTokens = [
        "--background",
        "--foreground",
        "--primary",
        "--secondary",
        "--muted",
        "--accent",
        "--destructive",
      ];

      requiredTokens.forEach((token) => {
        expect(cssContent).toContain(token);
      });
    });

    test("should define foreground variants", () => {
      expect(cssContent).toContain("--primary-foreground");
      expect(cssContent).toContain("--secondary-foreground");
      expect(cssContent).toContain("--muted-foreground");
      expect(cssContent).toContain("--accent-foreground");
      expect(cssContent).toContain("--destructive-foreground");
    });

    test("should define border and input tokens", () => {
      expect(cssContent).toContain("--border");
      expect(cssContent).toContain("--input");
      expect(cssContent).toContain("--ring");
    });
  });

  describe("responsive design support", () => {
    test("should use viewport-relative units", () => {
      expect(cssContent).toContain("svh");
    });

    test("should define fluid sizing variables", () => {
      expect(cssContent).toMatch(/calc\([^)]+\)/);
    });
  });

  describe("accessibility considerations", () => {
    test("should provide sufficient color contrast variables", () => {
      expect(cssContent).toContain("--foreground:");
      expect(cssContent).toContain("--background:");
    });

    test("should define focus ring variable", () => {
      expect(cssContent).toContain("--ring:");
    });
  });

  describe("maintainability", () => {
    test("should have reasonable file size", () => {
      expect(cssContent.length).toBeLessThan(50000);
    });

    test("should use consistent naming conventions", () => {
      const variableNames = cssContent.match(/--[a-z0-9-]+:/g);
      expect(variableNames).toBeDefined();
      
      variableNames?.forEach((name) => {
        expect(name).toMatch(/^--[a-z][a-z0-9-]*:$/);
      });
    });

    test("should organize related properties together", () => {
      const rootSection = cssContent.split(":root")[1]?.split("}")[0];
      expect(rootSection).toBeDefined();
      expect(rootSection.length).toBeGreaterThan(100);
    });
  });
});