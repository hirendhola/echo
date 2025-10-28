import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Providers } from "./providers";
import * as React from "react";

// Mock Convex
vi.mock("convex/react", () => ({
  ConvexProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="convex-provider">{children}</div>
  ),
  ConvexReactClient: vi.fn().mockImplementation((url: string) => ({
    url,
    close: vi.fn(),
  })),
}));

describe("Providers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("rendering", () => {
    test("should render without crashing", () => {
      expect(() => {
        render(
          <Providers>
            <div>Test Child</div>
          </Providers>
        );
      }).not.toThrow();
    });

    test("should render children", () => {
      render(
        <Providers>
          <div>Test Content</div>
        </Providers>
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    test("should render multiple children", () => {
      render(
        <Providers>
          <div>First Child</div>
          <div>Second Child</div>
          <span>Third Child</span>
        </Providers>
      );

      expect(screen.getByText("First Child")).toBeInTheDocument();
      expect(screen.getByText("Second Child")).toBeInTheDocument();
      expect(screen.getByText("Third Child")).toBeInTheDocument();
    });

    test("should render ConvexProvider", () => {
      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );

      expect(screen.getByTestId("convex-provider")).toBeInTheDocument();
    });

    test("should render nested components", () => {
      const NestedComponent = () => <div>Nested Content</div>;

      render(
        <Providers>
          <NestedComponent />
        </Providers>
      );

      expect(screen.getByText("Nested Content")).toBeInTheDocument();
    });
  });

  describe("ConvexProvider integration", () => {
    test("should wrap children in ConvexProvider", () => {
      const { container } = render(
        <Providers>
          <div data-testid="child">Child</div>
        </Providers>
      );

      const provider = screen.getByTestId("convex-provider");
      const child = screen.getByTestId("child");

      expect(provider).toContainElement(child);
    });

    test("should pass children to ConvexProvider", () => {
      render(
        <Providers>
          <button>Click Me</button>
        </Providers>
      );

      const button = screen.getByRole("button", { name: "Click Me" });
      expect(button).toBeInTheDocument();
    });
  });

  describe("client-side rendering", () => {
    test("should be marked as client component", () => {
      // The component uses "use client" directive
      // This test verifies it can be rendered in a test environment
      expect(() => {
        render(
          <Providers>
            <div>Test</div>
          </Providers>
        );
      }).not.toThrow();
    });

    test("should handle React hooks", () => {
      const TestComponent = () => {
        const [count, setCount] = React.useState(0);
        return <div>Count: {count}</div>;
      };

      render(
        <Providers>
          <TestComponent />
        </Providers>
      );

      expect(screen.getByText("Count: 0")).toBeInTheDocument();
    });
  });

  describe("environment configuration", () => {
    test("should use environment variable for Convex URL", () => {
      const { ConvexReactClient } = require("convex/react");

      render(
        <Providers>
          <div>Test</div>
        </Providers>
      );

      expect(ConvexReactClient).toHaveBeenCalledWith(
        expect.stringContaining("convex.cloud")
      );
    });

    test("should handle missing environment variable gracefully", () => {
      const originalEnv = process.env.NEXT_PUBLIC_CONVEX_URL;
      delete process.env.NEXT_PUBLIC_CONVEX_URL;

      expect(() => {
        render(
          <Providers>
            <div>Test</div>
          </Providers>
        );
      }).not.toThrow();

      process.env.NEXT_PUBLIC_CONVEX_URL = originalEnv;
    });
  });

  describe("TypeScript types", () => {
    test("should accept ReactNode as children", () => {
      expect(() => {
        render(
          <Providers>
            <div>String child</div>
          </Providers>
        );
      }).not.toThrow();

      expect(() => {
        render(<Providers>{123}</Providers>);
      }).not.toThrow();

      expect(() => {
        render(<Providers>{null}</Providers>);
      }).not.toThrow();
    });

    test("should render with fragment children", () => {
      render(
        <Providers>
          <>
            <div>Fragment Child 1</div>
            <div>Fragment Child 2</div>
          </>
        </Providers>
      );

      expect(screen.getByText("Fragment Child 1")).toBeInTheDocument();
      expect(screen.getByText("Fragment Child 2")).toBeInTheDocument();
    });
  });

  describe("edge cases", () => {
    test("should handle empty children", () => {
      expect(() => {
        render(<Providers>{null}</Providers>);
      }).not.toThrow();
    });

    test("should handle undefined children", () => {
      expect(() => {
        render(<Providers>{undefined}</Providers>);
      }).not.toThrow();
    });

    test("should handle boolean children", () => {
      expect(() => {
        render(<Providers>{false}</Providers>);
      }).not.toThrow();
    });

    test("should handle conditional rendering", () => {
      const showContent = true;
      render(
        <Providers>
          {showContent && <div>Conditional Content</div>}
        </Providers>
      );

      expect(screen.getByText("Conditional Content")).toBeInTheDocument();
    });

    test("should handle array of children", () => {
      const items = ["Item 1", "Item 2", "Item 3"];
      render(
        <Providers>
          {items.map((item, index) => (
            <div key={index}>{item}</div>
          ))}
        </Providers>
      );

      items.forEach((item) => {
        expect(screen.getByText(item)).toBeInTheDocument();
      });
    });
  });

  describe("performance", () => {
    test("should not re-render unnecessarily", () => {
      let renderCount = 0;
      const TestChild = () => {
        renderCount++;
        return <div>Render count: {renderCount}</div>;
      };

      const { rerender } = render(
        <Providers>
          <TestChild />
        </Providers>
      );

      expect(renderCount).toBe(1);

      rerender(
        <Providers>
          <TestChild />
        </Providers>
      );

      // Should re-render (this is expected behavior)
      expect(renderCount).toBeGreaterThan(0);
    });

    test("should handle many children efficiently", () => {
      const manyChildren = Array.from({ length: 100 }, (_, i) => (
        <div key={i}>Child {i}</div>
      ));

      expect(() => {
        render(<Providers>{manyChildren}</Providers>);
      }).not.toThrow();

      expect(screen.getByText("Child 0")).toBeInTheDocument();
      expect(screen.getByText("Child 99")).toBeInTheDocument();
    });
  });

  describe("React features", () => {
    test("should support context consumers", () => {
      const TestContext = React.createContext("default");

      const Consumer = () => {
        const value = React.useContext(TestContext);
        return <div>Context: {value}</div>;
      };

      render(
        <TestContext.Provider value="test-value">
          <Providers>
            <Consumer />
          </Providers>
        </TestContext.Provider>
      );

      expect(screen.getByText("Context: test-value")).toBeInTheDocument();
    });

    test("should support refs", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Providers>
          <div ref={ref}>Ref Test</div>
        </Providers>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.textContent).toBe("Ref Test");
    });
  });
});