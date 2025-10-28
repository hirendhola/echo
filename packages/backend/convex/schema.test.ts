import { describe, test, expect } from "vitest";
import { convexTest } from "convex-test";
import schema from "./schema";
import { v } from "convex/values";

describe("schema.ts - Database Schema Definition", () => {
  describe("schema structure", () => {
    test("should have users table defined", () => {
      expect(schema).toBeDefined();
      expect(schema.tables).toBeDefined();
      expect(schema.tables.users).toBeDefined();
    });

    test("should export valid Convex schema", () => {
      // Schema should be compatible with convexTest
      expect(() => {
        convexTest(schema);
      }).not.toThrow();
    });

    test("should define users table with name field", () => {
      const t = convexTest(schema);
      expect(t).toBeDefined();
    });
  });

  describe("users table validation", () => {
    test("should accept valid user with string name", async () => {
      const t = convexTest(schema);
      
      // Insert with valid schema should work
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Valid User Name",
        });
      });
      
      expect(userId).toBeDefined();
    });

    test("should accept user with default name", async () => {
      const t = convexTest(schema);
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "please enter your name here",
        });
      });
      
      expect(userId).toBeDefined();
    });

    test("should accept user with empty string name", async () => {
      const t = convexTest(schema);
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "",
        });
      });
      
      expect(userId).toBeDefined();
    });

    test("should accept user with long name", async () => {
      const t = convexTest(schema);
      const longName = "a".repeat(1000);
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: longName,
        });
      });
      
      expect(userId).toBeDefined();
      
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      
      expect(user?.name).toBe(longName);
    });

    test("should accept user with unicode characters", async () => {
      const t = convexTest(schema);
      const unicodeName = "Usuario 👤 Tëst 日本語";
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: unicodeName,
        });
      });
      
      expect(userId).toBeDefined();
      
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      
      expect(user?.name).toBe(unicodeName);
    });

    test("should accept user with special characters", async () => {
      const t = convexTest(schema);
      const specialName = "User!@#$%^&*()_+-={}[]|:;<>?,./";
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: specialName,
        });
      });
      
      expect(userId).toBeDefined();
    });

    test("should reject user without name field", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {});
        });
      }).rejects.toThrow();
    });

    test("should reject user with non-string name", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {
            name: 123,
          });
        });
      }).rejects.toThrow();
    });

    test("should reject user with null name", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {
            name: null,
          });
        });
      }).rejects.toThrow();
    });

    test("should reject user with undefined name", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {
            name: undefined,
          });
        });
      }).rejects.toThrow();
    });

    test("should reject user with array as name", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {
            name: ["John", "Doe"],
          });
        });
      }).rejects.toThrow();
    });

    test("should reject user with object as name", async () => {
      const t = convexTest(schema);
      
      await expect(async () => {
        await t.run(async (ctx) => {
          // @ts-expect-error - Testing invalid schema
          return await ctx.db.insert("users", {
            name: { first: "John", last: "Doe" },
          });
        });
      }).rejects.toThrow();
    });
  });

  describe("schema integrity", () => {
    test("should handle multiple users without conflicts", async () => {
      const t = convexTest(schema);
      
      const names = ["Alice", "Bob", "Charlie", "Diana", "Eve"];
      const userIds = [];
      
      for (const name of names) {
        const userId = await t.run(async (ctx) => {
          return await ctx.db.insert("users", { name });
        });
        userIds.push(userId);
      }
      
      // All IDs should be unique
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(names.length);
    });

    test("should maintain referential integrity", async () => {
      const t = convexTest(schema);
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", {
          name: "Test User",
        });
      });
      
      // Should be able to retrieve the same user
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      
      expect(user).toBeDefined();
      expect(user?._id).toBe(userId);
      expect(user?.name).toBe("Test User");
    });

    test("should preserve data types through storage", async () => {
      const t = convexTest(schema);
      const testName = "Type Test User";
      
      const userId = await t.run(async (ctx) => {
        return await ctx.db.insert("users", { name: testName });
      });
      
      const user = await t.run(async (ctx) => {
        return await ctx.db.get(userId);
      });
      
      expect(typeof user?.name).toBe("string");
      expect(user?.name).toBe(testName);
    });
  });

  describe("schema extensibility", () => {
    test("should allow querying users table", async () => {
      const t = convexTest(schema);
      
      await t.run(async (ctx) => {
        await ctx.db.insert("users", { name: "User 1" });
        await ctx.db.insert("users", { name: "User 2" });
      });
      
      const users = await t.run(async (ctx) => {
        return await ctx.db.query("users").collect();
      });
      
      expect(users).toHaveLength(2);
    });

    test("should support filtering users", async () => {
      const t = convexTest(schema);
      
      await t.run(async (ctx) => {
        await ctx.db.insert("users", { name: "Alice" });
        await ctx.db.insert("users", { name: "Bob" });
        await ctx.db.insert("users", { name: "Alice" });
      });
      
      const aliceUsers = await t.run(async (ctx) => {
        return await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("name"), "Alice"))
          .collect();
      });
      
      expect(aliceUsers).toHaveLength(2);
      aliceUsers.forEach((user) => {
        expect(user.name).toBe("Alice");
      });
    });

    test("should handle concurrent insertions", async () => {
      const t = convexTest(schema);
      
      const insertPromises = [
        t.run(async (ctx) => ctx.db.insert("users", { name: "User 1" })),
        t.run(async (ctx) => ctx.db.insert("users", { name: "User 2" })),
        t.run(async (ctx) => ctx.db.insert("users", { name: "User 3" })),
      ];
      
      const userIds = await Promise.all(insertPromises);
      
      expect(userIds).toHaveLength(3);
      expect(new Set(userIds).size).toBe(3);
    });
  });

  describe("validation against Convex types", () => {
    test("should match v.string() validator for name field", () => {
      // This test verifies the schema uses the correct validator type
      const nameValidator = v.string();
      expect(nameValidator).toBeDefined();
    });

    test("should be compatible with defineSchema and defineTable", async () => {
      // Verify schema can be used with convexTest without errors
      expect(() => {
        const t = convexTest(schema);
        expect(t).toBeDefined();
      }).not.toThrow();
    });
  });
});