"use client";

import React, { useState } from "react";
import { useLogin } from "@/context/LoginContext";
import { useRouter } from "next/navigation";
import {
  Lock,
  Smartphone,
  AlertCircle,
  ArrowRight,
  UserPlus,
  Eye,
  EyeOff,
  FileText,
  Users,
  Heart,
  Sparkles,
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

  const handleCreateUser = () => {
    router.push("/create-user");
  };

  const displayError = localError || loginError;

  return (
    <div className="sr-login-layout">
      {/* Ambient decorative shapes */}
      <div className="sr-ambient" aria-hidden="true">
        <span className="sr-orb sr-orb--1" />
        <span className="sr-orb sr-orb--2" />
        <span className="sr-orb sr-orb--3" />
        <span className="sr-plus sr-plus--1">+</span>
        <span className="sr-plus sr-plus--2">+</span>
        <span className="sr-plus sr-plus--3">+</span>
        <span className="sr-plus sr-plus--4">+</span>
      </div>

      {/* ---------------- Left / Branding panel ---------------- */}
      <section className="sr-brand-panel">
        <header className="sr-brand-header">
          <img
            src="/images/screening-refer-logo.png"
            alt="Screen & Refer"
            className="sr-brand-logo"
          />
        </header>

        <div className="sr-brand-body">
          <span className="sr-brand-chip">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Clinical Screening Platform</span>
          </span>

          <h1 className="sr-brand-heading">
            <span>Early Detection.</span>
            <span className="sr-brand-heading-accent">Better Outcomes.</span>
          </h1>

          <p className="sr-brand-subtitle">
            Empowering healthcare professionals with seamless screening and
            referral workflows for healthier communities.
          </p>

          <ul className="sr-brand-features">
            <li className="sr-feature">
              <span className="sr-feature-icon sr-feature-icon--blue">
                <FileText className="w-4 h-4" />
              </span>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Screen</span>
                <span className="sr-feature-desc">Identify health risks early</span>
              </div>
            </li>

            <li className="sr-feature">
              <span className="sr-feature-icon sr-feature-icon--teal">
                <Users className="w-4 h-4" />
              </span>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Refer</span>
                <span className="sr-feature-desc">Connect patients to the right care</span>
              </div>
            </li>

            <li className="sr-feature">
              <span className="sr-feature-icon sr-feature-icon--violet">
                <Heart className="w-4 h-4" />
              </span>
              <div className="sr-feature-text">
                <span className="sr-feature-title">Improve Lives</span>
                <span className="sr-feature-desc">Stronger communities, healthier futures</span>
              </div>
            </li>
          </ul>
        </div>

        {/* ECG line accent */}
        <div className="sr-brand-ecg" aria-hidden="true">
          <svg
            viewBox="0 0 360 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0 42 H96 L112 42 L128 34 L143 55 L160 14 L178 58 L194 42 H360"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* ---------------- Right / Auth card ---------------- */}
      <section className="sr-auth-panel">
        <div className="sr-auth-card">
          <header className="sr-auth-header">
            <div className="sr-auth-logo-wrap">
              <img
                src="/images/screening-refer-logo.png"
                alt="Screen & Refer"
                className="sr-auth-logo"
              />
            </div>
            <h2 className="sr-auth-title">Welcome Back</h2>
            <p className="sr-auth-subtitle">Sign in to your clinical portal</p>
          </header>

          {displayError && (
            <div className="sr-alert" role="alert">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="sr-form">
            <div className="sr-form-group">
              <label htmlFor="registered-mobile" className="sr-form-label">
                Registered Mobile / User ID
              </label>
              <div className="sr-input-wrap">
                <Smartphone className="sr-input-icon" />
                <input
                  id="registered-mobile"
                  type="text"
                  className="sr-input"
                  placeholder="Enter your mobile number or user ID"
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
              <div className="sr-input-wrap">
                <Lock className="sr-input-icon" />
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  className="sr-input"
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
                  className="sr-pwd-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="sr-forgot-row">
              <a href="#forgot" className="sr-forgot-link">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              className="sr-btn sr-btn--primary"
              disabled={isSubmitting || isContextLoading}
            >
              {isSubmitting ? (
                <>
                  <span className="sr-spinner" aria-hidden="true" />
                  <span>Signing In…</span>
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
            <span className="sr-divider-line" />
            <span className="sr-divider-text">OR</span>
            <span className="sr-divider-line" />
          </div>

          <button
            type="button"
            className="sr-btn sr-btn--ghost"
            onClick={handleCreateUser}
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Your Own User</span>
          </button>

          <p className="sr-demo-note">
            Only for demo purpose
          </p>

        </div>
      </section>
    </div>
  );
};