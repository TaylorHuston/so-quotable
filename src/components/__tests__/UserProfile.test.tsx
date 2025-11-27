/**
 * UserProfile Component Tests
 *
 * Comprehensive tests for UserProfile component following React Testing Library best practices.
 * Tests user data display, loading states, error states, and authentication flow.
 *
 * @vitest-environment happy-dom
 */

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { UserProfile } from "../UserProfile";

// Mock dependencies
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(),
}));

vi.mock("convex/react", () => ({
  Authenticated: ({ children }: { children: React.ReactNode }) => <div data-auth-state="authenticated">{children}</div>,
  Unauthenticated: ({ children }: { children: React.ReactNode }) => <div data-auth-state="unauthenticated">{children}</div>,
  useQuery: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Import mocked modules
import { useAuthActions } from "@convex-dev/auth/react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";

describe("UserProfile", () => {
  let mockSignOut: ReturnType<typeof vi.fn>;
  let mockPush: ReturnType<typeof vi.fn>;
  let mockUseQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockSignOut = vi.fn();
    mockPush = vi.fn();
    mockUseQuery = vi.fn();

    vi.mocked(useAuthActions).mockReturnValue({
      signIn: vi.fn(),
      signOut: mockSignOut,
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);

    vi.mocked(useQuery).mockImplementation(mockUseQuery as any);
  });

  describe("Unauthenticated State", () => {
    it("should render sign in prompt when not authenticated", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      expect(screen.getByTestId("not-signed-in")).toBeInTheDocument();
      expect(screen.getByText("Not signed in")).toBeInTheDocument();
    });

    it("should render sign in and sign up links", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      const signInLink = screen.getByRole("link", { name: "Sign In" });
      const signUpLink = screen.getByRole("link", { name: "Sign Up" });

      expect(signInLink).toHaveAttribute("href", "/login");
      expect(signUpLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when user data is loading", () => {
      mockUseQuery.mockReturnValue(undefined);
      render(<UserProfile />);

      const loadingContainer = screen.getByTestId("auth-state-loading");
      expect(loadingContainer).toBeInTheDocument();

      // Check for skeleton elements
      const skeletons = loadingContainer.querySelectorAll(".animate-pulse");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("should show avatar placeholder in loading state", () => {
      mockUseQuery.mockReturnValue(undefined);
      render(<UserProfile />);

      const avatarPlaceholder = screen.getByTestId("auth-state-loading").querySelector(".bg-gray-200.rounded-full");
      expect(avatarPlaceholder).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error message when user is null inside Authenticated", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      // This will show in both authenticated and unauthenticated contexts
      // In the authenticated context it shows an error
      const errorElement = screen.getByTestId("auth-state-error");
      expect(errorElement).toBeInTheDocument();
      expect(screen.getByText("Authentication error: User not found")).toBeInTheDocument();
    });
  });

  describe("Authenticated State - User Data Display", () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      name: "Test User",
      slug: "test-user",
      emailVerified: true,
      role: "user" as const,
      createdAt: new Date("2025-01-01").getTime(),
      updatedAt: new Date("2025-01-07").getTime(),
      image: "https://example.com/avatar.jpg",
    };

    it("should display user information when authenticated", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("test@example.com")).toBeInTheDocument();
      expect(screen.getByText("@test-user")).toBeInTheDocument();
    });

    it("should display user avatar image when available", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const avatar = screen.getByAltText("Test User");
      expect(avatar).toHaveAttribute("src", "https://example.com/avatar.jpg");
    });

    it("should display avatar initials when no image", () => {
      mockUseQuery.mockReturnValue({ ...mockUser, image: undefined });
      render(<UserProfile />);

      expect(screen.getByText("T")).toBeInTheDocument(); // First letter of name
    });

    it("should use email initial when no name or image", () => {
      mockUseQuery.mockReturnValue({ ...mockUser, name: undefined, image: undefined });
      render(<UserProfile />);

      expect(screen.getByText("T")).toBeInTheDocument(); // First letter of email
    });

    it("should show email verified badge when email is verified", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const verifiedBadge = screen.getByLabelText("Email verified");
      expect(verifiedBadge).toBeInTheDocument();
    });

    it("should show not verified warning when email is not verified", () => {
      mockUseQuery.mockReturnValue({ ...mockUser, emailVerified: false });
      render(<UserProfile />);

      expect(screen.getByText("Email not verified")).toBeInTheDocument();
      expect(screen.queryByLabelText("Email verified")).not.toBeInTheDocument();
    });

    it("should display admin badge for admin users", () => {
      mockUseQuery.mockReturnValue({ ...mockUser, role: "admin" });
      render(<UserProfile />);

      expect(screen.getByText("Admin")).toBeInTheDocument();
    });

    it("should not display admin badge for regular users", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.queryByText("Admin")).not.toBeInTheDocument();
    });

    it("should display member since date", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.getByText("Member since")).toBeInTheDocument();
      // Check that a formatted date exists (format may vary by timezone)
      const formattedDate = new Date(mockUser.createdAt).toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it("should display last updated date", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.getByText("Last updated")).toBeInTheDocument();
      // Check that a formatted date exists (format may vary by timezone)
      const formattedDate = new Date(mockUser.updatedAt).toLocaleDateString();
      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });

    it("should render with data-user-email attribute", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const profileContainer = screen.getByTestId("auth-state-authenticated");
      expect(profileContainer).toHaveAttribute("data-user-email", "test@example.com");
    });
  });

  describe("Sign Out Functionality", () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      name: "Test User",
      slug: "test-user",
      emailVerified: true,
      role: "user" as const,
      createdAt: new Date("2025-01-01").getTime(),
      updatedAt: new Date("2025-01-07").getTime(),
    };

    it("should render sign out button", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    });

    it("should call signOut when sign out button is clicked", async () => {
      mockSignOut.mockResolvedValue(undefined);
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1);
      });
    });

    it("should redirect to login after successful sign out", async () => {
      mockSignOut.mockResolvedValue(undefined);
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("should handle sign out error gracefully", async () => {
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockSignOut.mockRejectedValue(new Error("Sign out failed"));
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith("[UserProfile] Sign out failed:", expect.any(Error));
      });

      consoleErrorSpy.mockRestore();
    });

    it("should not redirect on sign out error", async () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      mockSignOut.mockRejectedValue(new Error("Sign out failed"));
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const signOutButton = screen.getByRole("button", { name: "Sign Out" });
      fireEvent.click(signOutButton);

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalled();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle user with only email (no name)", () => {
      mockUseQuery.mockReturnValue({
        _id: "user123",
        email: "test@example.com",
        slug: "test-user",
        emailVerified: false,
        role: "user",
        createdAt: new Date("2025-01-01").getTime(),
        updatedAt: new Date("2025-01-07").getTime(),
      });
      render(<UserProfile />);

      // Should display email in header when name is missing
      // Use getAllByText since email appears twice (header and email field)
      const emailElements = screen.getAllByText("test@example.com");
      expect(emailElements.length).toBeGreaterThan(0);
      expect(screen.getByText("@test-user")).toBeInTheDocument();
    });

    it("should handle very long user names gracefully", () => {
      const longName = "A".repeat(100);
      mockUseQuery.mockReturnValue({
        _id: "user123",
        email: "test@example.com",
        name: longName,
        slug: "test-user",
        emailVerified: true,
        role: "user",
        createdAt: new Date("2025-01-01").getTime(),
        updatedAt: new Date("2025-01-07").getTime(),
      });
      render(<UserProfile />);

      const nameElement = screen.getByText(longName);
      expect(nameElement).toBeInTheDocument();
      expect(nameElement).toHaveClass("truncate"); // Should have truncate class
    });

    it("should handle user with no avatar fallback to first character", () => {
      mockUseQuery.mockReturnValue({
        _id: "user123",
        email: "",
        slug: "test-user",
        emailVerified: false,
        role: "user",
        createdAt: new Date("2025-01-01").getTime(),
        updatedAt: new Date("2025-01-07").getTime(),
      });
      render(<UserProfile />);

      // Should show "U" as fallback
      expect(screen.getByText("U")).toBeInTheDocument();
    });

    it("should handle dates with timezone correctly", () => {
      mockUseQuery.mockReturnValue({
        _id: "user123",
        email: "test@example.com",
        slug: "test-user",
        emailVerified: true,
        role: "user",
        createdAt: Date.parse("2025-01-01T12:00:00Z"),
        updatedAt: Date.parse("2025-01-07T18:30:00Z"),
      });
      render(<UserProfile />);

      // Dates should be formatted using toLocaleDateString
      expect(screen.getByText("Member since")).toBeInTheDocument();
      expect(screen.getByText("Last updated")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    const mockUser = {
      _id: "user123",
      email: "test@example.com",
      name: "Test User",
      slug: "test-user",
      emailVerified: true,
      role: "user" as const,
      createdAt: new Date("2025-01-01").getTime(),
      updatedAt: new Date("2025-01-07").getTime(),
      image: "https://example.com/avatar.jpg",
    };

    it("should have accessible button labels", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();
    });

    it("should have accessible link labels for unauthenticated state", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    });

    it("should have descriptive aria-label for verified badge", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const badge = screen.getByLabelText("Email verified");
      expect(badge).toBeInTheDocument();
    });

    it("should have accessible image alt text", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      const avatar = screen.getByAltText("Test User");
      expect(avatar).toBeInTheDocument();
    });

    it("should use semantic HTML structure", () => {
      mockUseQuery.mockReturnValue(mockUser);
      render(<UserProfile />);

      // Should use definition list for metadata
      const dlElement = screen.getByText("Member since").closest("dl");
      expect(dlElement).toBeInTheDocument();
    });
  });

  describe("Data Attributes", () => {
    it("should have correct data-auth-state for loading", () => {
      mockUseQuery.mockReturnValue(undefined);
      render(<UserProfile />);

      const container = screen.getByTestId("auth-state-loading");
      expect(container).toHaveAttribute("data-auth-state", "loading");
    });

    it("should have correct data-auth-state for error", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      const container = screen.getByTestId("auth-state-error");
      expect(container).toHaveAttribute("data-auth-state", "error");
    });

    it("should have correct data-auth-state for authenticated", () => {
      mockUseQuery.mockReturnValue({
        _id: "user123",
        email: "test@example.com",
        slug: "test-user",
        emailVerified: true,
        role: "user",
        createdAt: new Date("2025-01-01").getTime(),
        updatedAt: new Date("2025-01-07").getTime(),
      });
      render(<UserProfile />);

      const container = screen.getByTestId("auth-state-authenticated");
      expect(container).toHaveAttribute("data-auth-state", "authenticated");
    });

    it("should have correct data-auth-state for unauthenticated", () => {
      mockUseQuery.mockReturnValue(null);
      render(<UserProfile />);

      const container = screen.getByTestId("not-signed-in").closest('[data-auth-state]');
      expect(container).toHaveAttribute("data-auth-state", "unauthenticated");
    });
  });
});
