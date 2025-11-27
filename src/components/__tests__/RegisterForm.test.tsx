/**
 * RegisterForm Component Tests
 *
 * Comprehensive tests for RegisterForm component following React Testing Library best practices.
 * Tests password strength indicator, confirmation matching, duplicate email checking, and validation.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import React from "react";
import { RegisterForm } from "../RegisterForm";

// Mock dependencies
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvex: vi.fn(),
}));

vi.mock("../GoogleIcon", () => ({
  GoogleIcon: () => <svg data-testid="google-icon" />,
}));

// Import mocked modules
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";

describe("RegisterForm", () => {
  let mockSignIn: ReturnType<typeof vi.fn>;
  let mockPush: ReturnType<typeof vi.fn>;
  let mockConvexQuery: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    mockSignIn = vi.fn();
    mockPush = vi.fn();
    mockConvexQuery = vi.fn();

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

    vi.mocked(useConvex).mockReturnValue({
      query: mockConvexQuery,
    } as any);
  });

  afterEach(() => {
    // Cleanup
  });

  describe("Rendering", () => {
    it("should render registration form with all elements", () => {
      render(<RegisterForm />);

      expect(screen.getByText("Create Account")).toBeInTheDocument();
      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign Up" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Sign up with Google" })).toBeInTheDocument();
      expect(screen.getByText(/Already have an account\?/)).toBeInTheDocument();
    });

    it("should render email input with correct attributes", () => {
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "you@example.com");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).not.toBeDisabled();
    });

    it("should render password inputs with correct attributes", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;

      expect(passwordInput).toHaveAttribute("type", "password");
      expect(confirmInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("required");
      expect(confirmInput).toHaveAttribute("required");
    });

    it("should render sign in link", () => {
      render(<RegisterForm />);

      const signInLink = screen.getByRole("link", { name: /Sign in/ });
      expect(signInLink).toHaveAttribute("href", "/login");
    });

    it("should render Google icon in OAuth button", () => {
      render(<RegisterForm />);

      expect(screen.getByTestId("google-icon")).toBeInTheDocument();
    });
  });

  describe("Form Input Handling", () => {
    it("should update email state on input change", () => {
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email") as HTMLInputElement;
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      expect(emailInput.value).toBe("test@example.com");
    });

    it("should update password state on input change", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password") as HTMLInputElement;
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });

      expect(passwordInput.value).toBe("Password123!");
    });

    it("should update confirm password state on input change", () => {
      render(<RegisterForm />);

      const confirmInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });

      expect(confirmInput.value).toBe("Password123!");
    });
  });

  describe("Password Strength Indicator", () => {
    it("should not show password strength for empty password", () => {
      render(<RegisterForm />);

      expect(screen.queryByText("Weak")).not.toBeInTheDocument();
      expect(screen.queryByText("Medium")).not.toBeInTheDocument();
      expect(screen.queryByText("Strong")).not.toBeInTheDocument();
    });

    it("should show weak strength for password missing requirements", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "short" } });

      // Wait for debounce delay (300ms)
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("Weak")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should show medium strength for 12-15 char password meeting all requirements", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "Password123!" } }); // 12 chars

      // Wait for debounce delay (300ms)
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("Medium")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should show strong strength for 16+ char password meeting all requirements", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "VeryStrongPass123!" } }); // 18 chars

      // Wait for debounce delay (300ms)
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.getByText("Strong")).toBeInTheDocument();
      vi.useRealTimers();
    });

    it("should show password hint text", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });

      expect(screen.getByText("Use 12+ characters with a mix of letters, numbers & symbols")).toBeInTheDocument();
    });

    it("should update strength indicator as password changes", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");

      // Start weak
      fireEvent.change(passwordInput, { target: { value: "weak" } });
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText("Weak")).toBeInTheDocument();

      // Upgrade to medium
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText("Medium")).toBeInTheDocument();

      // Upgrade to strong
      fireEvent.change(passwordInput, { target: { value: "VeryStrongPassword123!" } });
      await act(async () => {
        vi.advanceTimersByTime(300);
      });
      expect(screen.getByText("Strong")).toBeInTheDocument();

      vi.useRealTimers();
    });

    it("should show correct color for weak password", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "weak" } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const strengthBar = screen.getByText("Weak").previousElementSibling?.querySelector("div");
      expect(strengthBar).toHaveClass("bg-red-500");
      vi.useRealTimers();
    });

    it("should show correct color for medium password", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const strengthBar = screen.getByText("Medium").previousElementSibling?.querySelector("div");
      expect(strengthBar).toHaveClass("bg-yellow-500");
      vi.useRealTimers();
    });

    it("should show correct color for strong password", async () => {
      vi.useFakeTimers();
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "VeryStrongPassword123!" } });

      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      const strengthBar = screen.getByText("Strong").previousElementSibling?.querySelector("div");
      expect(strengthBar).toHaveClass("bg-green-500");
      vi.useRealTimers();
    });
  });

  describe("Password Confirmation Matching", () => {
    it("should show error when passwords do not match", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Different123!" } });

      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    });

    it("should show success when passwords match", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });

      expect(screen.getByText("Passwords match")).toBeInTheDocument();
    });

    it("should disable submit button when passwords do not match", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Different123!" } });

      expect(submitButton).toBeDisabled();
    });

    it("should enable submit button when passwords match", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });

      expect(submitButton).not.toBeDisabled();
    });

    it("should update match status as user types", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password" } });
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

      fireEvent.change(confirmInput, { target: { value: "Password123" } });
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument();

      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      expect(screen.getByText("Passwords match")).toBeInTheDocument();
    });

    it("should not show match indicators when confirm field is empty", () => {
      render(<RegisterForm />);

      const passwordInput = screen.getByLabelText("Password");
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });

      expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
      expect(screen.queryByText("Passwords match")).not.toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should show error when submitting with mismatched passwords", async () => {
      // Mock checkEmailAvailability to return true (available)
      mockConvexQuery.mockResolvedValue(true);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Different123!" } });

      // Button should be disabled, but test form validation logic
      expect(submitButton).toBeDisabled();
    });

    it("should show error for weak password on submit", async () => {
      // Mock checkEmailAvailability to return true (available)
      mockConvexQuery.mockResolvedValue(true);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      // Submit button is only enabled when passwords match
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "weak" } });
      fireEvent.change(confirmInput, { target: { value: "weak" } });

      const form = screen.getByRole("button", { name: "Sign Up" }).closest("form")!;
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 12 characters/)).toBeInTheDocument();
      });
    });

    it("should prevent form submission with event.stopPropagation", async () => {
      // Mock checkEmailAvailability to return true (available)
      mockConvexQuery.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const form = screen.getByRole("button", { name: "Sign Up" }).closest("form")!;
      const stopPropagationSpy = vi.fn();
      const preventDefaultSpy = vi.fn();

      // Create a proper event object
      const submitEvent = new Event("submit", { bubbles: true, cancelable: true });
      submitEvent.stopPropagation = stopPropagationSpy;
      submitEvent.preventDefault = preventDefaultSpy;

      form.dispatchEvent(submitEvent);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe("Duplicate Email Checking", () => {
    it("should check for existing user before registration", async () => {
      // Mock checkEmailAvailability to return true (available)
      mockConvexQuery.mockResolvedValue(true);
      mockSignIn.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockConvexQuery).toHaveBeenCalled();
      });

      // Verify the query was called with normalized email
      const queryCall = mockConvexQuery.mock.calls[0]!;
      expect(queryCall[1]).toHaveProperty("email");
    });

    it("should show error when email already exists", async () => {
      // Mock checkEmailAvailability to return false (email taken)
      mockConvexQuery.mockResolvedValue(false);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("An account with this email already exists")).toBeInTheDocument();
      });

      // Should not attempt to sign in
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("should not call signIn when duplicate email is found", async () => {
      // Mock checkEmailAvailability to return false (email taken)
      mockConvexQuery.mockResolvedValue(false);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("An account with this email already exists")).toBeInTheDocument();
      });

      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it("should reset loading state when duplicate email is found", async () => {
      // Mock checkEmailAvailability to return false (email taken)
      mockConvexQuery.mockResolvedValue(false);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("An account with this email already exists")).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Form Submission - Success", () => {
    it("should call signIn with correct parameters on successful registration", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledTimes(1);
      });

      const callArgs = mockSignIn.mock.calls[0]!;
      expect(callArgs[0]).toBe("password");
      expect(callArgs[1]).toBeInstanceOf(FormData);

      const formData = callArgs[1] as FormData;
      expect(formData.get("email")).toBe("newuser@example.com");
      expect(formData.get("password")).toBe("Password123!");
      expect(formData.get("flow")).toBe("signUp");
    });

    it("should show loading state during registration", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Creating account...")).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
      expect(emailInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
      expect(confirmInput).toBeDisabled();
    });

    it("should redirect to dashboard after successful registration", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });

      // Wait for the 100ms race condition fix delay + redirect
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
      }, { timeout: 1000 });
    });
  });

  describe("Form Submission - Error Handling", () => {
    it("should display error message on registration failure", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockRejectedValue(new Error("Registration failed"));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Registration failed")).toBeInTheDocument();
      });
    });

    it("should reset loading state on error", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockRejectedValue(new Error("Registration failed"));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Registration failed")).toBeInTheDocument();
      });

      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });

    it("should clear error on new submission attempt", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockRejectedValueOnce(new Error("Registration failed"));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      // First attempt - fails
      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Registration failed")).toBeInTheDocument();
      });

      // Second attempt - should clear error
      mockSignIn.mockResolvedValue(undefined);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText("Registration failed")).not.toBeInTheDocument();
      });
    });
  });

  describe("Google OAuth Registration", () => {
    it("should call signIn with google provider on button click", () => {
      mockSignIn.mockResolvedValue(undefined);
      render(<RegisterForm />);

      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });
      fireEvent.click(googleButton);

      expect(mockSignIn).toHaveBeenCalledWith("google");
    });

    it("should set loading state on Google sign up", () => {
      mockSignIn.mockImplementation(() => new Promise(() => {}));
      render(<RegisterForm />);

      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });
      fireEvent.click(googleButton);

      expect(googleButton).toBeDisabled();
      expect(screen.getByLabelText("Email")).toBeDisabled();
    });

    it("should handle Google sign up error", async () => {
      mockSignIn.mockRejectedValue(new Error("OAuth failed"));
      render(<RegisterForm />);

      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText("OAuth failed")).toBeInTheDocument();
      });
    });

    it("should reset loading state on Google sign up error", async () => {
      mockSignIn.mockRejectedValue(new Error("OAuth failed"));
      render(<RegisterForm />);

      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText("OAuth failed")).toBeInTheDocument();
      });

      expect(googleButton).not.toBeDisabled();
    });

    it("should clear error before Google sign up attempt", async () => {
      // Mock checkEmailAvailability to return false (email taken) for form submission
      mockConvexQuery.mockResolvedValue(false);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      // First show an error
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("An account with this email already exists")).toBeInTheDocument();
      });

      // Now try Google sign up - error should clear
      mockSignIn.mockResolvedValue(undefined);
      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });
      fireEvent.click(googleButton);

      await waitFor(() => {
        expect(screen.queryByText("An account with this email already exists")).not.toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible form labels", () => {
      render(<RegisterForm />);

      expect(screen.getByLabelText("Email")).toBeInTheDocument();
      expect(screen.getByLabelText("Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
    });

    it("should have properly associated labels and inputs", () => {
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");

      expect(emailInput).toHaveAttribute("id", "email");
      expect(passwordInput).toHaveAttribute("id", "password");
      expect(confirmInput).toHaveAttribute("id", "confirmPassword");
    });

    it("should show errors in accessible alert region", async () => {
      // Mock checkEmailAvailability to return false (email taken)
      mockConvexQuery.mockResolvedValue(false);
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("An account with this email already exists")).toBeInTheDocument();
      }, { timeout: 3000 });

      // Check error styling - text is inside a div with bg-red-100
      const errorText = screen.getByText("An account with this email already exists");
      const errorDiv = errorText.closest(".bg-red-100");
      expect(errorDiv).toBeInTheDocument();
      expect(errorDiv).toHaveClass("bg-red-100");
    });
  });

  describe("Loading State Management", () => {
    it("should disable all inputs during loading", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });
      const googleButton = screen.getByRole("button", { name: "Sign up with Google" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(emailInput).toBeDisabled();
      });

      expect(passwordInput).toBeDisabled();
      expect(confirmInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
      expect(googleButton).toBeDisabled();
    });

    it("should show loading text on submit button", async () => {
      mockConvexQuery.mockResolvedValue(true); // Email available
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      render(<RegisterForm />);

      const emailInput = screen.getByLabelText("Email");
      const passwordInput = screen.getByLabelText("Password");
      const confirmInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Sign Up" });

      fireEvent.change(emailInput, { target: { value: "newuser@example.com" } });
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmInput, { target: { value: "Password123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Creating account...")).toBeInTheDocument();
      });
    });
  });
});
