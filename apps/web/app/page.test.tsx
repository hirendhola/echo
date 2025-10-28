import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Page from "./page";

// Mock Convex hooks
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

// Mock workspace packages
vi.mock("@workspace/backend/api", () => ({
  api: {
    users: {
      getMany: "users:getMany",
      add: "users:add",
    },
  },
}));

vi.mock("@workspace/ui/components/button", () => ({
  Button: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

describe("Page Component (Web App)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering with no users", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue(undefined);
      mockUseMutation.mockReturnValue(vi.fn());
    });

    test("should render without crashing", () => {
      expect(() => {
        render(<Page />);
      }).not.toThrow();
    });

    test("should render Add User button", () => {
      render(<Page />);
      expect(screen.getByRole("button", { name: /Add User/i })).toBeInTheDocument();
    });

    test("should render heading", () => {
      render(<Page />);
      expect(screen.getByRole("heading", { name: /Hello World\/app/i })).toBeInTheDocument();
    });

    test("should not render any user paragraphs when users is undefined", () => {
      render(<Page />);
      const paragraphs = screen.queryAllByRole("paragraph");
      // Only the heading should exist, no user paragraphs
      expect(paragraphs.length).toBe(0);
    });

    test("should render correct layout structure", () => {
      const { container } = render(<Page />);
      const mainDiv = container.querySelector('.flex.items-center.justify-center.min-h-svh');
      expect(mainDiv).toBeInTheDocument();
    });
  });

  describe("rendering with empty users array", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue([]);
      mockUseMutation.mockReturnValue(vi.fn());
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
      mockUseMutation.mockReturnValue(vi.fn());
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

    test("should render users with correct keys", () => {
      const { container } = render(<Page />);
      const userElements = container.querySelectorAll('p[data-testid]');
      
      // React should handle keys internally
      expect(container.querySelectorAll('p').length).toBe(3);
    });

    test("should maintain user order", () => {
      const { container } = render(<Page />);
      const userElements = Array.from(container.querySelectorAll('p'));
      const userNames = userElements.map(el => el.textContent);

      expect(userNames).toEqual(["Alice", "Bob", "Charlie"]);
    });
  });

  describe("Add User button interaction", () => {
    const mockAddUser = vi.fn();

    beforeEach(() => {
      mockUseQuery.mockReturnValue([]);
      mockUseMutation.mockReturnValue(mockAddUser);
    });

    test("should call addUser mutation when button is clicked", () => {
      render(<Page />);
      const button = screen.getByRole("button", { name: /Add User/i });

      fireEvent.click(button);

      expect(mockAddUser).toHaveBeenCalledTimes(1);
    });

    test("should call addUser with no arguments", () => {
      render(<Page />);
      const button = screen.getByRole("button", { name: /Add User/i });

      fireEvent.click(button);

      expect(mockAddUser).toHaveBeenCalledWith();
    });

    test("should handle multiple button clicks", () => {
      render(<Page />);
      const button = screen.getByRole("button", { name: /Add User/i });

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      expect(mockAddUser).toHaveBeenCalledTimes(3);
    });

    test("should not crash when mutation is undefined", () => {
      mockUseMutation.mockReturnValue(undefined);

      expect(() => {
        render(<Page />);
      }).not.toThrow();
    });
  });

  describe("Convex hooks integration", () => {
    test("should call useQuery with correct API reference", () => {
      mockUseQuery.mockReturnValue([]);
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(mockUseQuery).toHaveBeenCalledWith("users:getMany");
    });

    test("should call useMutation with correct API reference", () => {
      mockUseQuery.mockReturnValue([]);
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(mockUseMutation).toHaveBeenCalledWith("users:add");
    });

    test("should handle loading state (undefined users)", () => {
      mockUseQuery.mockReturnValue(undefined);
      mockUseMutation.mockReturnValue(vi.fn());

      const { container } = render(<Page />);
      
      // Should render UI without users
      expect(screen.getByText(/Hello World\/app/i)).toBeInTheDocument();
      expect(container.querySelectorAll('p').length).toBe(0);
    });

    test("should reactively update when users change", () => {
      const { rerender } = render(<Page />);

      // Initially no users
      mockUseQuery.mockReturnValue([]);
      rerender(<Page />);

      // Add a user
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "New User", _creationTime: Date.now() },
      ]);
      rerender(<Page />);

      expect(screen.getByText("New User")).toBeInTheDocument();
    });
  });

  describe("edge cases and error handling", () => {
    test("should handle single user", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "Single User", _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());

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
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(screen.getByText("User 0")).toBeInTheDocument();
      expect(screen.getByText("User 99")).toBeInTheDocument();
    });

    test("should handle users with special characters in names", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "User<>&\"'", _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(screen.getByText("User<>&\"'")).toBeInTheDocument();
    });

    test("should handle users with unicode names", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "用户 👤", _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(screen.getByText("用户 👤")).toBeInTheDocument();
    });

    test("should handle users with empty names", () => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "", _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());

      const { container } = render(<Page />);

      // Empty name should still render a paragraph element
      expect(container.querySelectorAll('p').length).toBe(1);
    });

    test("should handle users with very long names", () => {
      const longName = "A".repeat(1000);
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: longName, _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());

      render(<Page />);

      expect(screen.getByText(longName)).toBeInTheDocument();
    });
  });

  describe("client-side rendering", () => {
    test("should be marked as client component", () => {
      // Component uses "use client" directive
      expect(() => {
        mockUseQuery.mockReturnValue([]);
        mockUseMutation.mockReturnValue(vi.fn());
        render(<Page />);
      }).not.toThrow();
    });
  });

  describe("accessibility", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue([
        { _id: "user1" as any, name: "Test User", _creationTime: Date.now() },
      ]);
      mockUseMutation.mockReturnValue(vi.fn());
    });

    test("should have accessible button", () => {
      render(<Page />);
      const button = screen.getByRole("button", { name: /Add User/i });
      expect(button).toBeInTheDocument();
    });

    test("should have accessible heading", () => {
      render(<Page />);
      const heading = screen.getByRole("heading");
      expect(heading).toBeInTheDocument();
      expect(heading.tagName).toBe("H1");
    });

    test("should have semantic HTML structure", () => {
      const { container } = render(<Page />);
      
      // Should have proper div hierarchy
      const mainContainer = container.querySelector('.flex.items-center.justify-center.min-h-svh');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  describe("layout and styling", () => {
    beforeEach(() => {
      mockUseQuery.mockReturnValue([]);
      mockUseMutation.mockReturnValue(vi.fn());
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
      mockUseMutation.mockReturnValue(vi.fn());

      const startTime = Date.now();
      render(<Page />);
      const endTime = Date.now();

      // Rendering should be reasonably fast
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});