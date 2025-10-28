import { convexTest } from "convex-test";
import { expect, test, describe, beforeEach, vi } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

describe("users.ts - Convex Backend Functions", () => {
  describe("getMany query", () => {
    test("should return empty array when no users exist", async () => {
      const t = convexTest(schema);
      const users = await t.query(api.users.getMany);
      expect(users).toEqual([]);
    });

    test("should return all users after adding one user", async () => {
      const t = convexTest(schema);
      const userId = await t.mutation(api.users.add);
      
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(1);
      expect(users[0]._id).toBe(userId);
      expect(users[0].name).toBe("please enter your name here");
    });

    test("should return all users after adding multiple users", async () => {
      const t = convexTest(schema);
      
      // Add three users
      await t.mutation(api.users.add);
      await t.mutation(api.users.add);
      await t.mutation(api.users.add);
      
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(3);
      
      // Verify all users have the default name
      users.forEach((user) => {
        expect(user.name).toBe("please enter your name here");
        expect(user._id).toBeDefined();
        expect(typeof user._id).toBe("string");
      });
    });

    test("should return users in the order they were created", async () => {
      const t = convexTest(schema);
      
      const userId1 = await t.mutation(api.users.add);
      const userId2 = await t.mutation(api.users.add);
      const userId3 = await t.mutation(api.users.add);
      
      const users = await t.query(api.users.getMany);
      expect(users[0]._id).toBe(userId1);
      expect(users[1]._id).toBe(userId2);
      expect(users[2]._id).toBe(userId3);
    });

    test("should handle large number of users", async () => {
      const t = convexTest(schema);
      const userCount = 100;
      
      // Add 100 users
      for (let i = 0; i < userCount; i++) {
        await t.mutation(api.users.add);
      }
      
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(userCount);
    });

    test("should return immutable query results", async () => {
      const t = convexTest(schema);
      await t.mutation(api.users.add);
      
      const users1 = await t.query(api.users.getMany);
      const users2 = await t.query(api.users.getMany);
      
      expect(users1).toEqual(users2);
      expect(users1).not.toBe(users2); // Different references
    });
  });

  describe("add mutation", () => {
    test("should add a user and return valid ID", async () => {
      const t = convexTest(schema);
      const userId = await t.mutation(api.users.add);
      
      expect(userId).toBeDefined();
      expect(typeof userId).toBe("string");
      expect(userId.length).toBeGreaterThan(0);
    });

    test("should create user with correct default name", async () => {
      const t = convexTest(schema);
      const userId = await t.mutation(api.users.add);
      
      // Verify by querying the database directly
      const users = await t.query(api.users.getMany);
      const addedUser = users.find((u) => u._id === userId);
      
      expect(addedUser).toBeDefined();
      expect(addedUser?.name).toBe("please enter your name here");
    });

    test("should generate unique IDs for multiple users", async () => {
      const t = convexTest(schema);
      
      const userId1 = await t.mutation(api.users.add);
      const userId2 = await t.mutation(api.users.add);
      const userId3 = await t.mutation(api.users.add);
      
      expect(userId1).not.toBe(userId2);
      expect(userId2).not.toBe(userId3);
      expect(userId1).not.toBe(userId3);
    });

    test("should persist user data across queries", async () => {
      const t = convexTest(schema);
      const userId = await t.mutation(api.users.add);
      
      // Query multiple times
      const users1 = await t.query(api.users.getMany);
      const users2 = await t.query(api.users.getMany);
      const users3 = await t.query(api.users.getMany);
      
      expect(users1).toHaveLength(1);
      expect(users2).toHaveLength(1);
      expect(users3).toHaveLength(1);
      expect(users1[0]._id).toBe(userId);
    });

    test("should handle rapid consecutive additions", async () => {
      const t = convexTest(schema);
      
      // Add users rapidly in sequence
      const promises = Array(10).fill(null).map(() => t.mutation(api.users.add));
      const userIds = await Promise.all(promises);
      
      // All IDs should be unique
      const uniqueIds = new Set(userIds);
      expect(uniqueIds.size).toBe(10);
      
      // All users should exist in database
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(10);
    });

    test("should increment database size correctly", async () => {
      const t = convexTest(schema);
      
      let users = await t.query(api.users.getMany);
      expect(users).toHaveLength(0);
      
      await t.mutation(api.users.add);
      users = await t.query(api.users.getMany);
      expect(users).toHaveLength(1);
      
      await t.mutation(api.users.add);
      users = await t.query(api.users.getMany);
      expect(users).toHaveLength(2);
    });

    test("should work in isolation between test contexts", async () => {
      const t1 = convexTest(schema);
      const t2 = convexTest(schema);
      
      // Add user to first context
      await t1.mutation(api.users.add);
      const users1 = await t1.query(api.users.getMany);
      expect(users1).toHaveLength(1);
      
      // Second context should be empty
      const users2 = await t2.query(api.users.getMany);
      expect(users2).toHaveLength(0);
    });
  });

  describe("integration tests - getMany and add", () => {
    test("should handle complete user lifecycle", async () => {
      const t = convexTest(schema);
      
      // Start with no users
      let users = await t.query(api.users.getMany);
      expect(users).toHaveLength(0);
      
      // Add first user
      const id1 = await t.mutation(api.users.add);
      users = await t.query(api.users.getMany);
      expect(users).toHaveLength(1);
      expect(users[0]._id).toBe(id1);
      
      // Add second user
      const id2 = await t.mutation(api.users.add);
      users = await t.query(api.users.getMany);
      expect(users).toHaveLength(2);
      
      // Verify both users exist with correct IDs
      const userIds = users.map((u) => u._id);
      expect(userIds).toContain(id1);
      expect(userIds).toContain(id2);
    });

    test("should maintain data consistency after multiple operations", async () => {
      const t = convexTest(schema);
      const addedIds: string[] = [];
      
      // Perform interleaved adds and queries
      for (let i = 0; i < 5; i++) {
        const id = await t.mutation(api.users.add);
        addedIds.push(id);
        
        const users = await t.query(api.users.getMany);
        expect(users).toHaveLength(i + 1);
      }
      
      // Final verification
      const finalUsers = await t.query(api.users.getMany);
      expect(finalUsers).toHaveLength(5);
      
      const finalIds = finalUsers.map((u) => u._id);
      addedIds.forEach((id) => {
        expect(finalIds).toContain(id);
      });
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle empty args object in getMany", async () => {
      const t = convexTest(schema);
      
      // Should work with explicit empty args
      const users = await t.query(api.users.getMany, {});
      expect(users).toEqual([]);
    });

    test("should handle empty args object in add", async () => {
      const t = convexTest(schema);
      
      // Should work with explicit empty args
      const userId = await t.mutation(api.users.add, {});
      expect(userId).toBeDefined();
      
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(1);
    });

    test("should handle stress test with many operations", async () => {
      const t = convexTest(schema);
      const operationCount = 50;
      
      // Mix adds and queries
      for (let i = 0; i < operationCount; i++) {
        if (i % 2 === 0) {
          await t.mutation(api.users.add);
        } else {
          const users = await t.query(api.users.getMany);
          expect(users.length).toBeGreaterThanOrEqual(0);
        }
      }
      
      const finalUsers = await t.query(api.users.getMany);
      expect(finalUsers.length).toBeGreaterThan(0);
    });
  });

  describe("data structure validation", () => {
    test("should return users with correct schema structure", async () => {
      const t = convexTest(schema);
      await t.mutation(api.users.add);
      
      const users = await t.query(api.users.getMany);
      const user = users[0];
      
      // Verify required fields exist
      expect(user).toHaveProperty("_id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("_creationTime");
      
      // Verify field types
      expect(typeof user._id).toBe("string");
      expect(typeof user.name).toBe("string");
      expect(typeof user._creationTime).toBe("number");
    });

    test("should include creation timestamp", async () => {
      const t = convexTest(schema);
      const beforeTime = Date.now();
      
      await t.mutation(api.users.add);
      
      const afterTime = Date.now();
      const users = await t.query(api.users.getMany);
      
      expect(users[0]._creationTime).toBeGreaterThanOrEqual(beforeTime);
      expect(users[0]._creationTime).toBeLessThanOrEqual(afterTime);
    });

    test("should maintain schema constraints", async () => {
      const t = convexTest(schema);
      await t.mutation(api.users.add);
      
      const users = await t.query(api.users.getMany);
      
      // Name should be a non-empty string
      expect(users[0].name).toBeTruthy();
      expect(users[0].name.length).toBeGreaterThan(0);
    });
  });

  describe("performance characteristics", () => {
    test("should efficiently query large result sets", async () => {
      const t = convexTest(schema);
      
      // Add many users
      for (let i = 0; i < 50; i++) {
        await t.mutation(api.users.add);
      }
      
      // Time the query
      const startTime = Date.now();
      const users = await t.query(api.users.getMany);
      const endTime = Date.now();
      
      expect(users).toHaveLength(50);
      // Query should complete reasonably fast (< 1 second)
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test("should handle batch operations efficiently", async () => {
      const t = convexTest(schema);
      const batchSize = 20;
      
      const startTime = Date.now();
      
      // Sequential adds
      for (let i = 0; i < batchSize; i++) {
        await t.mutation(api.users.add);
      }
      
      const endTime = Date.now();
      
      const users = await t.query(api.users.getMany);
      expect(users).toHaveLength(batchSize);
      
      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});