/**
 * Forgot Password Page Tests
 *
 * Comprehensive tests for forgot password page following React Testing Library best practices.
 * Tests form validation, submission, success/error states, and user interactions.
 *
 * @vitest-environment happy-dom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import ForgotPasswordPage from "../page";

// Mock dependencies
vi.mock("convex/react", () => ({
  useMutation: vi.fn(),
}));

vi.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

// Import mocked modules
import { useMutation } from "convex/react";

describe("ForgotPasswordPage", () => {
  let mockRequestPasswordReset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRequestPasswordReset = vi.fn();

    vi.mocked(useMutation).mockReturnValue(mockRequestPasswordReset as any);
  });

  describe("Rendering", () => {
    it("should render forgot password form with all elements", () => {
      render(<ForgotPasswordPage />);

      expect(screen.getByRole("heading", { name: "Forgot Password?" })).toBeInTheDocument();
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
      expect(screen.getByText(/Enter your email address/)).toBeInTheDocument();
    });

    it("should render email input with correct attributes", () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
      expect(emailInput).toHaveAttribute("type", "email");
      expect(emailInput).toHaveAttribute("placeholder", "you@example.com");
      expect(emailInput).toHaveAttribute("required");
      expect(emailInput).not.toBeDisabled();
    });

    it("should render back to login link", () => {
      render(<ForgotPasswordPage />);

      const loginLink = screen.getByRole("link", { name: "Back to Login" });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });
  });

  describe("Form Submission", () => {
    it("should submit form with email and show success state", async () => {
      mockRequestPasswordReset.mockResolvedValue({ success: true });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" });

      // Fill in email
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      expect(emailInput.value).toBe("test@example.com");

      // Submit form
      fireEvent.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument();
      });

      // Wait for success state
      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Check Your Email" })).toBeInTheDocument();
      });

      // Should show success message
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
      expect(screen.getByText(/1 hour/)).toBeInTheDocument();
    });

    it("should call requestPasswordReset with correct email", async () => {
      mockRequestPasswordReset.mockResolvedValue({ success: true });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" });

      fireEvent.change(emailInput, { target: { value: "user@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRequestPasswordReset).toHaveBeenCalledWith({
          email: "user@example.com",
        });
      });
    });

    it("should handle submission error gracefully", async () => {
      mockRequestPasswordReset.mockRejectedValue(new Error("Network error"));

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText("Network error")).toBeInTheDocument();
      });

      // Should still show form
      expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    });

    it("should disable form inputs during submission", async () => {
      // Create a promise we can control
      let resolveRequest: (value: any) => void;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockRequestPasswordReset.mockReturnValue(requestPromise);

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address") as HTMLInputElement;
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" }) as HTMLButtonElement;

      // Submit form
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      // Wait for loading state
      await waitFor(() => {
        expect(submitButton).toBeDisabled();
        expect(emailInput).toBeDisabled();
      });

      // Resolve the request
      resolveRequest!({ success: true });

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Check Your Email" })).toBeInTheDocument();
      });
    });
  });

  describe("Success State", () => {
    beforeEach(async () => {
      mockRequestPasswordReset.mockResolvedValue({ success: true });

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Check Your Email" })).toBeInTheDocument();
      });
    });

    it("should render success icon", () => {
      const icon = screen.getByRole("heading", { name: "Check Your Email" }).previousSibling;
      expect(icon).toBeInTheDocument();
    });

    it("should show sent email address", () => {
      expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it("should show expiration time", () => {
      expect(screen.getByText(/1 hour/)).toBeInTheDocument();
    });

    it("should show send another reset link button", () => {
      expect(screen.getByRole("button", { name: "Send Another Reset Link" })).toBeInTheDocument();
    });

    it("should show back to login link", () => {
      const loginLink = screen.getByRole("link", { name: "Back to Login" });
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveAttribute("href", "/login");
    });

    it("should reset form when clicking send another link", async () => {
      const sendAnotherButton = screen.getByRole("button", { name: "Send Another Reset Link" });
      fireEvent.click(sendAnotherButton);

      await waitFor(() => {
        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeInTheDocument();
      });
    });
  });

  describe("Validation", () => {
    it("should require email input", () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("required");
    });

    it("should use email input type", () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("type", "email");
    });
  });

  describe("Accessibility", () => {
    it("should have proper label associations", () => {
      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      expect(emailInput).toHaveAttribute("id", "email");
    });

    it("should show loading state in button text", async () => {
      let resolveRequest: (value: any) => void;
      const requestPromise = new Promise((resolve) => {
        resolveRequest = resolve;
      });
      mockRequestPasswordReset.mockReturnValue(requestPromise);

      render(<ForgotPasswordPage />);

      const emailInput = screen.getByLabelText("Email Address");
      const submitButton = screen.getByRole("button", { name: "Send Reset Link" });

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "Sending..." })).toBeInTheDocument();
      });

      resolveRequest!({ success: true });
    });
  });
});
