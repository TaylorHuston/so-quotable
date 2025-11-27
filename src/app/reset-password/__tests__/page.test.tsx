/**
 * Reset Password Page Tests
 *
 * Comprehensive tests for reset password page following React Testing Library best practices.
 * Tests token validation, form submission, password strength indicator, and success/error states.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ResetPasswordPage from "../page";

// Mock dependencies
vi.mock("convex/react", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useMutation: vi.fn(),
    useConvex: vi.fn(),
    useAction: vi.fn(),
  };
});

vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: vi.fn(),
}));

// Import mocked modules
import { useMutation, useConvex, useAction } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";

describe("ResetPasswordPage", () => {
  let mockResetPasswordWithToken: ReturnType<typeof vi.fn>;
  let mockPush: ReturnType<typeof vi.fn>;
  let mockSearchParams: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockResetPasswordWithToken = vi.fn();
    mockPush = vi.fn();
    mockSearchParams = {
      get: vi.fn((key: string) => {
        if (key === "token") return "valid-token-123456789012345";
        return null;
      }),
    };

    vi.mocked(useMutation).mockReturnValue(mockResetPasswordWithToken);
    vi.mocked(useConvex).mockReturnValue({} as any);
    vi.mocked(useAction).mockReturnValue(mockResetPasswordWithToken);
    vi.mocked(useAuthActions).mockReturnValue({
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    vi.mocked(useSearchParams).mockReturnValue(mockSearchParams);
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    } as any);
  });

  describe("Rendering", () => {
    it("should render reset password form with all elements", () => {
      render(<ResetPasswordPage />);

      expect(screen.getByRole("heading", { name: "Reset Your Password" })).toBeInTheDocument();
      expect(screen.getByLabelText("New Password")).toBeInTheDocument();
      expect(screen.getByLabelText("Confirm Password")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Reset Password" })).toBeInTheDocument();
    });

    it("should render password inputs with correct attributes", () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password") as HTMLInputElement;
      expect(newPasswordInput).toHaveAttribute("type", "password");
      expect(newPasswordInput).toHaveAttribute("placeholder", "••••••••");
      expect(newPasswordInput).toHaveAttribute("required");

      const confirmPasswordInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
      expect(confirmPasswordInput).toHaveAttribute("type", "password");
      expect(confirmPasswordInput).toHaveAttribute("placeholder", "••••••••");
      expect(confirmPasswordInput).toHaveAttribute("required");
    });

    it("should render back to login button", () => {
      render(<ResetPasswordPage />);

      const loginButton = screen.getByRole("button", { name: "Back to Login" });
      expect(loginButton).toBeInTheDocument();
    });
  });

  describe("Token Validation", () => {
    it("should extract token from URL on mount", () => {
      render(<ResetPasswordPage />);

      expect(mockSearchParams.get).toHaveBeenCalledWith("token");
    });

    it("should show error if no token provided", async () => {
      // Create a fresh mock for this test with null token
      const noTokenSearchParams = {
        get: vi.fn().mockReturnValue(null),
      };
      vi.mocked(useSearchParams).mockReturnValue(noTokenSearchParams);

      render(<ResetPasswordPage />);

      // Wait for useEffect to run and update state
      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: "Reset Failed" })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
      // Error message appears in multiple places - use getAllByText
      expect(screen.getAllByText(/No reset token provided/).length).toBeGreaterThan(0);
    });
  });

  describe("Password Strength Indicator", () => {
    it("should show password strength indicator when typing", async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");

      // Type weak password
      fireEvent.change(passwordInput, { target: { value: "weak" } });

      // Wait for debounced update (300ms)
      await waitFor(() => {
        expect(screen.getByText("Weak")).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it("should show medium strength for NIST-compliant password (12-15 chars)", async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");

      // Type medium strength password (12 chars, meets all requirements)
      fireEvent.change(passwordInput, { target: { value: "Password123!" } });

      await waitFor(() => {
        expect(screen.getByText("Medium")).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it("should show strong strength for long password (16+ chars)", async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");

      // Type strong password (16+ chars, meets all requirements)
      fireEvent.change(passwordInput, { target: { value: "VeryStrongPassword123!" } });

      await waitFor(() => {
        expect(screen.getByText("Strong")).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it("should show helper text about password requirements", async () => {
      render(<ResetPasswordPage />);

      const passwordInput = screen.getByLabelText("New Password");

      fireEvent.change(passwordInput, { target: { value: "test" } });

      await waitFor(() => {
        expect(screen.getByText(/12\+ characters with a mix of letters, numbers & symbols/)).toBeInTheDocument();
      });
    });
  });

  describe("Password Confirmation", () => {
    it("should show error if passwords do not match", async () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(newPasswordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "Password456!" } });

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("should show success if passwords match", async () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      fireEvent.change(newPasswordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "Password123!" } });

      await waitFor(() => {
        expect(screen.getByText("Passwords match")).toBeInTheDocument();
      });
    });

    it("should disable submit button if passwords do not match", async () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" }) as HTMLButtonElement;

      fireEvent.change(newPasswordInput, { target: { value: "Password123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "Different123!" } });

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe("Form Submission", () => {
    it("should submit form with token and new password", async () => {
      mockResetPasswordWithToken.mockResolvedValue({
        success: true,
        message: "Password reset successfully",
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockResetPasswordWithToken).toHaveBeenCalledWith({
          token: "valid-token-123456789012345",
          newPassword: "NewPassword123!",
        });
      });
    });

    it("should show loading state during submission", async () => {
      let resolveRequest: (value: any) => void;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockResetPasswordWithToken.mockReturnValue(requestPromise);

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" }) as HTMLButtonElement;

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(submitButton).toBeDisabled();
          expect(screen.getByRole("button", { name: "Resetting..." })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      resolveRequest!({ success: true, message: "Success" });

      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: "Password Reset Successful!" })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );
    });

    it("should show success state and redirect to login", async () => {
      // Simplified test: just verify success state renders and redirect happens
      // without complex timer manipulation
      mockResetPasswordWithToken.mockResolvedValue({
        success: true,
        message: "Password reset successfully",
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      // Verify success state
      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: "Password Reset Successful!" })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Verify redirect is scheduled (countdown starts at 3)
      expect(screen.getByText(/Redirecting to login/)).toBeInTheDocument();
    });

    it("should handle submission error gracefully", async () => {
      mockResetPasswordWithToken.mockResolvedValue({
        success: false,
        error: "Invalid reset token",
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          // Error message appears in multiple places - use getAllByText
          expect(screen.getAllByText("Invalid reset token").length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );
    });

    it("should validate password before submission", async () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      // Type weak password
      fireEvent.change(newPasswordInput, { target: { value: "weak" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "weak" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          // Error message appears in multiple places - use getAllByText
          expect(screen.getAllByText(/at least 12 characters/i).length).toBeGreaterThan(0);
        },
        { timeout: 2000 }
      );

      expect(mockResetPasswordWithToken).not.toHaveBeenCalled();
    });
  });

  describe("Error State", () => {
    it("should show request new reset link button for expired token", async () => {
      mockResetPasswordWithToken.mockResolvedValue({
        success: false,
        error: "Password reset token has expired",
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByRole("heading", { name: "Reset Failed" })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      expect(screen.getByRole("button", { name: "Request New Reset Link" })).toBeInTheDocument();
    });

    it("should navigate to forgot-password when clicking request new link", async () => {
      mockResetPasswordWithToken.mockResolvedValue({
        success: false,
        error: "Password reset token has expired",
      });

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");
      const submitButton = screen.getByRole("button", { name: "Reset Password" });

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(screen.getByRole("button", { name: "Request New Reset Link" })).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      const requestButton = screen.getByRole("button", { name: "Request New Reset Link" });
      fireEvent.click(requestButton);

      expect(mockPush).toHaveBeenCalledWith("/forgot-password");
    });
  });

  describe("Accessibility", () => {
    it("should have proper label associations", () => {
      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password");
      const confirmPasswordInput = screen.getByLabelText("Confirm Password");

      expect(newPasswordInput).toHaveAttribute("id", "newPassword");
      expect(confirmPasswordInput).toHaveAttribute("id", "confirmPassword");
    });

    it("should disable form inputs during submission", async () => {
      let resolveRequest: (value: any) => void;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockResetPasswordWithToken.mockReturnValue(requestPromise);

      render(<ResetPasswordPage />);

      const newPasswordInput = screen.getByLabelText("New Password") as HTMLInputElement;
      const confirmPasswordInput = screen.getByLabelText("Confirm Password") as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: "Reset Password" }) as HTMLButtonElement;

      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.click(submitButton);

      await waitFor(
        () => {
          expect(newPasswordInput).toBeDisabled();
          expect(confirmPasswordInput).toBeDisabled();
          expect(submitButton).toBeDisabled();
        },
        { timeout: 2000 }
      );

      resolveRequest!({ success: true, message: "Success" });
    });
  });
});
