"use client";

import React, { useState } from "react";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import {
  Lock,
  Smartphone,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  FileText,
  Users,
  Heart,
} from "lucide-react";
import "./style.css";

export const LoginContainer: React.FC = () => {
  const { login, loginError, isLoading: isContextLoading, clearError } = useLogin();
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!identifier.trim() || !password.trim()) {
      setLocalError("Please enter both your registered User ID/Mobile and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(identifier.trim(), password.trim());
      if (result.success && result.user) {
        if (result.user.role === "HEALTH_WORKER") {
          router.push("/health-worker/dashboard");
        } else {
          router.push("/doctor/dashboard");
        }
      }
    } catch {
      setLocalError("Authentication failed. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || loginError;

  return (
    <div className="sr-login-layout">
      {/* Background ambient accents */}
      <div className="sr-ambient-bg">
        <span className="sr-plus-icon sr-plus-1">+</span>
        <span className="sr-plus-icon sr-plus-2">+</span>
        <span className="sr-plus-icon sr-plus-3">+</span>
      </div>

      {/* Left Column: Brand & Value Proposition */}
      <div className="sr-left-section">
        <div className="sr-left-top-brand">
          <img
            src="/images/screening-refer-logo.png"
            alt="Screen & Refer Logo"
            className="sr-main-logo"
          />
        </div>

        <div className="sr-left-main-content">
          <h1 className="sr-hero-heading">
            <span>Early Detection.</span>
            <span>Better Outcomes.</span>
          </h1>

          <p className="sr-hero-subtitle">
            Empowering healthcare professionals with seamless screening and referral
            for healthier communities.
          </p>

          <div className="sr-features-list">
            <div className="sr-feature-item">
              <div className="sr-feature-icon-badge badge-screen">
                <FileText className="w-5 h-5" />
              </div>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Screen</span>
                <span className="sr-feature-desc">Identify health risks early</span>
              </div>
            </div>

            <div className="sr-feature-item">
              <div className="sr-feature-icon-badge badge-refer">
                <Users className="w-5 h-5" />
              </div>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Refer</span>
                <span className="sr-feature-desc">Connect patients to the right care</span>
              </div>
            </div>

            <div className="sr-feature-item">
              <div className="sr-feature-icon-badge badge-improve">
                <Heart className="w-5 h-5" />
              </div>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Improve Lives</span>
                <span className="sr-feature-desc">Stronger communities, healthier futures</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stethoscope Illustration at bottom left */}
        <div className="sr-stethoscope-wrap">
          <svg
            className="sr-stethoscope-svg"
            viewBox="0 0 360 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="tubeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0891b2" />
                <stop offset="50%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="50%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <path
              d="M-20 60 C 60 110, 140 10, 220 80 C 240 95, 270 95, 290 85"
              stroke="url(#tubeGrad)"
              strokeWidth="14"
              strokeLinecap="round"
            />
            <rect
              x="285"
              y="75"
              width="20"
              height="18"
              rx="4"
              fill="url(#metalGrad)"
              transform="rotate(15 285 75)"
            />
            <ellipse
              cx="315"
              cy="90"
              rx="22"
              ry="16"
              fill="url(#metalGrad)"
              stroke="#64748b"
              strokeWidth="2"
            />
            <ellipse
              cx="315"
              cy="90"
              rx="14"
              ry="9"
              fill="#0f172a"
              opacity="0.3"
            />
            <circle cx="315" cy="90" r="4" fill="#38bdf8" />
          </svg>
        </div>
      </div>

      {/* Right Column: Sign In Card */}
      <div className="sr-right-section">
        <div className="sr-auth-card animate-fade-in">
          <div className="sr-card-header">
            <div className="sr-card-logo-wrap">
              <img
                src="/images/screening-refer-logo.png"
                alt="Screen & Refer"
                className="sr-card-logo"
              />
            </div>
            <h2 className="sr-card-title">Welcome Back</h2>
            <p className="sr-card-subtitle">Sign in to your clinical portal</p>
          </div>

          {displayError && (
            <div className="sr-error-banner">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="sr-form">
            <div className="sr-form-group">
              <label htmlFor="registered-mobile" className="sr-form-label">
                User ID / Registered Mobile
              </label>
              <div className="sr-input-field-wrap">
                <Smartphone className="sr-field-icon w-4.5 h-4.5" />
                <input
                  id="registered-mobile"
                  type="text"
                  className="sr-form-input"
                  placeholder="Enter your user ID or mobile"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (displayError) {
                      setLocalError(null);
                      clearError();
                    }
                  }}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="sr-form-group">
              <label htmlFor="password-input" className="sr-form-label">
                Password
              </label>
              <div className="sr-input-field-wrap">
                <Lock className="sr-field-icon w-4.5 h-4.5" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="sr-form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (displayError) {
                      setLocalError(null);
                      clearError();
                    }
                  }}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="sr-toggle-pwd"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="sr-forgot-link-wrap">
              <a href="#forgot" className="sr-forgot-link">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="sr-btn-primary"
              disabled={isSubmitting || isContextLoading}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="sr-divider">
            <div className="sr-divider-line" />
            <span className="sr-divider-text">OR</span>
            <div className="sr-divider-line" />
          </div>

          <button
            type="button"
            className="sr-btn-otp"
            onClick={() => {
              if (!identifier.trim()) {
                setLocalError("Please enter your registered ID/mobile number first.");
              } else {
                setLocalError("OTP sent to your registered contact.");
              }
            }}
          >
            <ShieldCheck className="w-4.5 h-4.5 text-[#123B8C]" />
            <span>Login with OTP</span>
          </button>

          <div className="sr-card-footer">
            <span>Don&apos;t have an account? Contact your administrator</span>
          </div>
        </div>
      </div>
    </div>
  );
};