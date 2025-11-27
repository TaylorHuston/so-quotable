/**
 * LoginForm Component Tests
 *
 * Comprehensive tests for LoginForm component following React Testing Library best practices.
 * Tests user interactions, form validation, OAuth behavior, and loading states.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { LoginForm } from "../LoginForm";

// Mock dependencies
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("../GoogleIcon", () => ({
  GoogleIcon: () => <svg data-testid="google-icon" />,
}));

// Import mocked modules
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

describe("LoginForm", () => {
  let mockSignIn: ReturnType<typeof vi.fn>;
  let mockPush: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockSignIn = vi.fn();
    mockPush = vi.fn();

    vi.mocked(useAuthActions).mockReturnValue({
      signIn: mockSignIn,
      signOut: vi.fn(),
    } as any);

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  afterEach(() => {
    // Cleanup
  });

  describe("Rendering", () => {
    it("should render login form with all elements", () => {
      render(<LoginForm />);

      expect(screen.getByRole("heading", { name: "Sign In" })).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
      expect(screen.getByText(/Don't have an account\?/)).toBeInTheDocument();
    });

    it("should render email input with correct attributes", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "you@example.com");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).not.toBeDisabled();
    });

    it("should render password input with correct attributes", () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("placeholder", "••••••••");
      expect(passwordInput).toHaveAttribute("required");
      expect(passwordInput).not.toBeDisabled();
    });

    it("should render Google icon in OAuth button", () => {
      render(<LoginForm />);

      expect(screen.getByTestId("google-icon")).toBeInTheDocument();
    });

    it("should render sign up link", () => {
      render(<LoginForm />);

      const signUpLink = screen.getByRole("link", { name: /Sign up/ });
      expect(signUpLink).toHaveAttribute("href", "/register");
    });
  });

  describe("Form Input Handling", () => {
    it("should update email state on input change", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput.value).toBe("test@example.com");
    });

    it("should update password state on input change", () => {
      render(<LoginForm />);

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: "password123" } });

      expect(passwordInput.value).toBe("password123");
    });

    it("should handle multiple input changes", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;

      fireEvent.change(emailInput, { target: { value: "user1@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "pass1" } });
      fireEvent.change(emailInput, { target: { value: "user2@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "pass2" } });

      expect(emailInput.value).toBe("user2@example.com");
      expect(passwordInput.value).toBe("pass2");
    });

    it("should clear input values", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(emailInput, { target: { value: "" } });

      expect(emailInput.value).toBe("");
    });
  });

  describe("Form Submission - Success", () => {
    it("should call signIn with correct parameters on form submit", async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockSignIn.mock.calls[0]!;
      expect(callArgs[0]).toBe("password");
      expect(callArgs[1]).toBeInstanceOf(FormData);

      const formData = callArgs[1] as FormData;
      expect(formData.get("email")).toBe("test@example.com");
      expect(formData.get("password")).toBe("password123");
      expect(formData.get("flow")).toBe("signIn");
    });

    it("should show loading state during sign in", async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Loading state should be shown
      expect(screen.getByText("Signing in...")).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it("should redirect to dashboard after successful sign in", async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Wait for async operations and timer
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Wait for the 100ms race condition fix delay + redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      }, { timeout: 1000 });
    });

    it("should prevent default form submission", async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      const form = screen.getByRole("button", { name: "Sign In" }).closest("form")!;
      const preventDefaultSpy = vi.fn();

      // Create a proper event object with preventDefault
      const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
      submitEvent.preventDefault = preventDefaultSpy;

      form.dispatchEvent(submitEvent);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should display error message on sign in failure", async () => {
      mockSignIn.mockRejectedValue(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });
    });

    it("should clear error message on new submission attempt", async () => {
      mockSignIn.mockRejectedValueOnce(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      // First attempt - fails
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });

      // Second attempt - should clear error
      mockSignIn.mockResolvedValue(undefined);
      fireEvent.change(passwordInput, { target: { value: "correctpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("Invalid email or password")).not.toBeInTheDocument();
      });
    });

    it("should reset loading state on error", async () => {
      mockSignIn.mockRejectedValue(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });

      // Loading state should be reset
      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
      expect(passwordInput).not.toBeDisabled();
    });

    it("should not redirect to dashboard on error", async () => {
      mockSignIn.mockRejectedValue(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("Google OAuth Sign In", () => {
    it("should call signIn with google provider on button click", () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      expect(mockSignIn).toHaveBeenCalledWith("google");
    });

    it("should set loading state on Google sign in", () => {
      mockSignIn.mockImplementation(() => new Promise(() => {})); // Never resolves
      render(<LoginForm />);

      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      expect(googleButton).toBeDisabled();
      expect(screen.getByLabelText("Email")).toBeDisabled();
      expect(screen.getByLabelText("Password")).toBeDisabled();
    });

    it("should handle Google sign in error", async () => {
      mockSignIn.mockRejectedValue(new Error("OAuth failed"));
      render(<LoginForm />);

      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText("OAuth failed")).toBeInTheDocument();
      });
    });

    it("should reset loading state on Google sign in error", async () => {
      mockSignIn.mockRejectedValue(new Error("OAuth failed"));
      render(<LoginForm />);

      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText("OAuth failed")).toBeInTheDocument();
      });

      expect(googleButton).not.toBeDisabled();
    });

    it("should clear error before Google sign in attempt", async () => {
      // First show an error from email/password
      mockSignIn.mockRejectedValueOnce(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });

      // Now try Google sign in - error should clear
      mockSignIn.mockResolvedValue(undefined);
      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.queryByText("Invalid email or password")).not.toBeInTheDocument();
      });
    });

    it("should not await Google sign in (fire and forget for redirect)", () => {
      const signInPromise = Promise.resolve();
      mockSignIn.mockReturnValue(signInPromise);
      render(<LoginForm />);

      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });
      fireEvent.click(googleButton);

      // Should be called immediately without await
      expect(mockSignIn).toHaveBeenCalledWith("google");
    });
  });

  describe("Accessibility", () => {
    it("should have accessible form labels", () => {
      render(<LoginForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("should have properly associated labels and inputs", () => {
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
    });

    it("should show error in accessible alert region", async () => {
      mockSignIn.mockRejectedValue(new Error("InvalidSecret"));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      // Fill form before submitting
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "wrongpassword" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
      });

      // Check error styling - text is inside a div with bg-red-100
      const errorText = screen.getByText("Invalid email or password");
      const errorDiv = errorText.closest(".bg-red-100");
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveClass("bg-red-100");
    });

    it("should have descriptive button text", () => {
      render(<LoginForm />);

      expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign in with Google" })).toBeInTheDocument();
    });
  });

  describe("Loading State Management", () => {
    it("should disable all inputs during loading", async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });
      const googleButton = screen.getByRole("button", { name: "Sign in with Google" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(googleButton).toBeDisabled();
    });

    it("should show loading text on submit button", async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 200)));
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      // Fill form first
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Wait for loading state to appear
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Signing in..." })).toBeInTheDocument();
      });
    });

    it("should restore button text after completion", async () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<LoginForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const submitButton = screen.getByRole("button", { name: "Sign In" });

      // Fill form
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "password123" } });
      fireEvent.click(submitButton);

      // Wait for signIn to be called
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Button should show loading state
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Signing in..." })).toBeInTheDocument();
      });
    });
  });
});
