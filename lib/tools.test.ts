import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { tools } from "@/lib/tools";

describe("tools registry", () => {
  it("gives every tool a unique kebab-case slug", () => {
    const slugs = tools.map((tool) => tool.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) {
      expect(slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("gives every tool a title and a description", () => {
    for (const tool of tools) {
      expect(tool.title.trim()).not.toBe("");
      expect(tool.description.trim()).not.toBe("");
    }
  });

  it("has a page for every tool", () => {
    for (const tool of tools) {
      expect(existsSync(`app/tools/${tool.slug}/page.tsx`), tool.slug).toBe(true);
    }
  });
});
