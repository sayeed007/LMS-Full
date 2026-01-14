"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Github,
  Mail,
  Lock,
  User as UserIcon,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { showAuthErrorToast, showSuccessToast } from "@/lib/toast-utils";
import { useRegisterMutation } from "@/store/api/authApi";
import { useRouter } from "next/navigation";
import AuthLayoutWrapper from "@/components/auth/AuthLayoutWrapper";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("OAuth sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      showAuthErrorToast("Passwords do not match");
      return;
    }

    try {
      await register(formData).unwrap();
      showSuccessToast(
        "Registration successful!",
        "Please check your email to verify your account."
      );
      // Automatically sign in after registration using NextAuth credentials
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const apiError = error as { data?: { message?: string } };
      showAuthErrorToast(
        apiError?.data?.message || "Registration failed. Please try again."
      );
    }
  };

  return (
    <AuthLayoutWrapper
      title="Create Account"
      subtitle="Start your learning journey today. Join for free."
      linkText="Log in"
      linkHref="/auth/login"
    >
      <div className="space-y-4">
        {/* Social Login Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading || isRegistering}
            variant="outline"
            className="h-10 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-gray-700 font-medium text-sm"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </Button>

          <Button
            onClick={() => handleOAuthSignIn("github")}
            disabled={isLoading || isRegistering}
            variant="outline"
            className="h-10 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 text-gray-700 font-medium text-sm"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-gray-50 dark:bg-gray-900 px-2 text-gray-500">
              Or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleRegister} className="space-y-3">
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-earth-green transition-colors" />
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-9 h-10 bg-white border-gray-200 focus:border-earth-green focus:ring-earth-green/20 rounded-lg transition-all shadow-sm group-hover:border-gray-300 text-sm"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email address
            </label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-earth-green transition-colors" />
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="pl-9 h-10 bg-white border-gray-200 focus:border-earth-green focus:ring-earth-green/20 rounded-lg transition-all shadow-sm group-hover:border-gray-300 text-sm"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-earth-green transition-colors" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pl-9 pr-9 h-10 bg-white border-gray-200 focus:border-earth-green focus:ring-earth-green/20 rounded-lg transition-all shadow-sm group-hover:border-gray-300 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="passwordConfirm"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Confirm
              </label>
              <div className="relative group">
                <Check className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-earth-green transition-colors" />
                <Input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="pl-9 pr-9 h-10 bg-white border-gray-200 focus:border-earth-green focus:ring-earth-green/20 rounded-lg transition-all shadow-sm group-hover:border-gray-300 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-3 w-3" />
                  ) : (
                    <Eye className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500">
            Must be at least 8 characters.
          </p>

          <Button
            type="submit"
            disabled={isRegistering || isLoading}
            className="w-full h-10 bg-earth-green hover:bg-earth-green/90 text-white font-semibold rounded-lg shadow-md shadow-earth-green/20 hover:shadow-earth-green/40 transition-all duration-300 transform hover:-translate-y-0.5 mt-2 text-sm"
          >
            {isRegistering ? (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </div>
    </AuthLayoutWrapper>
  );
}
