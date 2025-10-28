import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "./page";

const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: mockUseQuery,
}));

vi.mock("@workspace/backend/api", () => ({
  api: {
    users: {
      getMany: "users:getMany",
    },
  },
}));

describe("Page Component (Widget App)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering with no users", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue(undefined);
    });

    test("should render without crashing", () => {
      expect(() => {
        render(<Page />);
      }).not.toThrow();
    });

    test("should render heading", () => {
      render(<Page />);
      expect(screen.getByRole("heading", { name: /Hello World\/app/i })).toBeInTheDocument();
    });

    test("should not render any user paragraphs when users is undefined", () => {
      render(<Page />);
      const paragraphs = screen.queryAllByRole("paragraph");
      expect(paragraphs.length).toBe(0);
    });

    test("should not have Add User button", () => {
      render(<Page />);
      expect(screen.queryByRole("button", { name: /Add User/i })).not.toBeInTheDocument();
    });
  });

  describe("rendering with empty users array", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue([]);
    });

    test("should render with empty array", () => {
      render(<Page />);
      expect(screen.getByText(/Hello World\/app/i)).toBeInTheDocument();
    });

    test("should not render any user items", () => {
      const { container } = render(<Page />);
      const userParagraphs = container.querySelectorAll('p');
      expect(userParagraphs.length).toBe(0);
    });
  });

  describe("rendering with users", () => {
    const mockUsers = [
      { _id: "user1" as any, name: "Alice", _creationTime: Date.now() },
      { _id: "user2" as any, name: "Bob", _creationTime: Date.now() },
      { _id: "user3" as any, name: "Charlie", _creationTime: Date.now() },
    ];

    beforeEach(() => {
      mockUseQuery.mockReturnValue(mockUsers);
    });

    test("should render all users", () => {
      render(<Page />);

      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Charlie")).toBeInTheDocument();
    });

    test("should render correct number of user elements", () => {
      const { container } = render(<Page />);
      const userElements = container.querySelectorAll('p');
      expect(userElements.length).toBe(mockUsers.length);
    });

    test("should maintain user order", () => {
      const { container } = render(<Page />);
      const userElements = Array.from(container.querySelectorAll('p'));
      const userNames = userElements.map(el => el.textContent);

      expect(userNames).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });

  describe("Convex hooks integration", () => {
    test("should call useQuery with correct API reference", () => {
      mockUseQuery.mockReturnValue([]);

      render(<Page />);

      expect(mockUseQuery).toHaveBeenCalledWith("users:getMany");
    });

    test("should handle loading state (undefined users)", () => {
      mockUseQuery.mockReturnValue(undefined);

      const { container } = render(<Page />);
      
      expect(screen.getByText(/Hello World\/app/i)).toBeInTheDocument();
      expect(container.querySelectorAll('p').length).toBe(0);
    });

    test("should reactively update when users change", () => {
      const { rerender } = render(<Page />);

      mockUseQuery.mockReturnValue([]);
      rerender(<Page />);

      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "New User", _creationTime: Date.now() },
      ]);
      rerender(<Page />);

      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  describe("differences from web app", () => {
    test("should not include Add User button", () => {
      mockUseQuery.mockReturnValue([]);
      render(<Page />);

      expect(screen.queryByRole("button", { name: /Add User/i })).not.toBeInTheDocument();
    });

    test("should be read-only interface", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "Test User", _creationTime: Date.now() },
      ]);
      
      const { container } = render(<Page />);

      expect(container.querySelector('button')).not.toBeInTheDocument();
    });

    test("should only use useQuery hook, not useMutation", () => {
      mockUseQuery.mockReturnValue([]);
      render(<Page />);

      // useMutation should not be called
      expect(mockUseQuery).toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    test("should handle single user", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "Single User", _creationTime: Date.now() },
      ]);

      render(<Page />);

      expect(screen.getByText("Single User")).toBeInTheDocument();
    });

    test("should handle many users", () => {
      const manyUsers = Array.from({ length: 100 }, (_, i) => ({
        _id: `user${i}` as any,
        name: `User ${i}`,
        _creationTime: Date.now(),
      }));

      mockUseQuery.mockReturnValue(manyUsers);

      render(<Page />);

      expect(screen.getByText("User 0")).toBeInTheDocument();
      expect(screen.getByText("User 99")).toBeInTheDocument();
    });

    test("should handle users with special characters", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "User<>&\"'", _creationTime: Date.now() },
      ]);

      render(<Page />);

      expect(screen.getByText("User<>&\"'")).toBeInTheDocument();
    });

    test("should handle users with unicode", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "用户 👤", _creationTime: Date.now() },
      ]);

      render(<Page />);

      expect(screen.getByText("用户 👤")).toBeInTheDocument();
    });

    test("should handle empty names", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "", _creationTime: Date.now() },
      ]);

      const { container } = render(<Page />);
      expect(container.querySelectorAll('p').length).toBe(1);
    });
  });

  describe("accessibility", () => {
    test("should have accessible heading", () => {
      mockUseQuery.mockReturnValue([]);
      render(<Page />);
      
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    test("should have semantic HTML structure", () => {
      mockUseQuery.mockReturnValue([]);
      const { container } = render(<Page />);
      
      const mainContainer = container.querySelector('.flex.items-center.justify-center.min-h-svh');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe("layout and styling", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue([]);
    });

    test("should apply correct CSS classes to main container", () => {
      const { container } = render(<Page />);
      const mainDiv = container.querySelector('.flex.items-center.justify-center.min-h-svh');
      expect(mainDiv).toBeInTheDocument();
    });

    test("should apply correct CSS classes to inner container", () => {
      const { container } = render(<Page />);
      const innerDiv = container.querySelector('.flex.flex-col.items-center.justify-center.gap-4');
      expect(innerDiv).toBeInTheDocument();
    });

    test("should apply correct CSS classes to heading", () => {
      const { container } = render(<Page />);
      const heading = container.querySelector('.text-2xl.font-bold');
      expect(heading).toBeInTheDocument();
    });
  });

  describe("performance", () => {
    test("should handle rapid state updates", () => {
      const { rerender } = render(<Page />);

      for (let i = 0; i < 10; i++) {
        mockUseQuery.mockReturnValue(
          Array.from({ length: i }, (_, j) => ({
            _id: `user${j}` as any,
            name: `User ${j}`,
            _creationTime: Date.now(),
          }))
        );
        rerender(<Page />);
      }

      expect(() => rerender(<Page />)).not.toThrow();
    });

    test("should efficiently render large user lists", () => {
      const largeUserList = Array.from({ length: 1000 }, (_, i) => ({
        _id: `user${i}` as any,
        name: `User ${i}`,
        _creationTime: Date.now(),
      }));

      mockUseQuery.mockReturnValue(largeUserList);

      const startTime = Date.now();
      render(<Page />);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});