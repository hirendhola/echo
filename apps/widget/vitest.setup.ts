import { expect, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
});

process.env.NEXT_PUBLIC_CONVEX_URL = "https://test.convex.cloud";