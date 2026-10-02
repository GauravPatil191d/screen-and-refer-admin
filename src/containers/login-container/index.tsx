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
  ShieldCheck,
} from "lucide-react";
import "./style.css";

/*
  Clean ECG trace. Three identical P-QRS-T complexes with the R-peaks
  landing exactly under the three milestone markers (x = 90, 290, 490).
  Baseline y = 150, R-peak y = 58 (24.2% of the 240 viewBox height).

  Beat shape (relative to R-peak at x = R):
    P wave:  R-45 … R-15   (soft rounded bump, +10 above baseline)
    Q dip:   R-3           (small sharp dip, +8 below baseline)
    R peak:  R             (tall spike, -92 above baseline)
    S dip:   R+3           (deep dip, +25 below baseline)
    T wave:  R+25 … R+55   (larger rounded bump, +20 above baseline)
*/
const TRACE_PATH = [
  "M0 150",
  // Beat 1 — R-peak at x = 90
  "L45 150",
  "Q52 140 60 140",
  "Q68 140 75 150",
  "L85 150",
  "L87 158",
  "L90 58",
  "L93 175",
  "L96 150",
  "L115 150",
  "Q122 130 130 130",
  "Q138 130 145 150",
  // Beat 2 — R-peak at x = 290
  "L245 150",
  "Q252 140 260 140",
  "Q268 140 275 150",
  "L285 150",
  "L287 158",
  "L290 58",
  "L293 175",
  "L296 150",
  "L315 150",
  "Q322 130 330 130",
  "Q338 130 345 150",
  // Beat 3 — R-peak at x = 490
  "L445 150",
  "Q452 140 460 140",
  "Q468 140 475 150",
  "L485 150",
  "L487 158",
  "L490 58",
  "L493 175",
  "L496 150",
  "L515 150",
  "Q522 130 530 130",
  "Q538 130 545 150",
  // Flat tail runs behind the sign-in card
  "L1000 150",
].join(" ");

const MILESTONES = [
  { x: 9, title: "Screen", desc: "Identify health risks early", delay: 0.55 },
  { x: 29, title: "Refer", desc: "Connect patients to the right care", delay: 1.5 },
  { x: 49, title: "Improve lives", desc: "Stronger communities, healthier futures", delay: 2.4 },
];

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

  const clearErrors = () => {
    if (localError || loginError) {
      setLocalError(null);
      clearError();
    }
  };

  const displayError = localError || loginError;

  return (
    <div className="sr-login-layout">
      {/* ---------------- Top bar ---------------- */}
      <header className="sr-topbar">
        <img
          src="/images/full-logo.png"
          alt="Screen & Refer"
          className="sr-topbar-logo"
        />
        <span className="sr-topbar-divider" aria-hidden="true" />
        <span className="sr-topbar-tag">Clinical Screening Platform</span>
      </header>

      <main className="sr-main">
        {/* ---------------- Hero + heartbeat chart ---------------- */}
        <section className="sr-hero">
          <h1 className="sr-hero-title">
            <span>Early detection.</span>
            <span className="sr-hero-title-2">Better outcomes.</span>
          </h1>
          <p className="sr-hero-sub">
            Screening and referral workflows built for doctors and health
            workers, so no patient is missed.
          </p>

          <div className="sr-strip" aria-hidden="true">
            <div className="sr-plot">
              <svg viewBox="0 0 1000 240" preserveAspectRatio="none" className="sr-trace-svg">
                <defs>
                  {/* Fading tail behind the sweep head, like a patient monitor */}
                  <linearGradient id="srTail" x1="0" x2="1" y1="0" y2="0">
                    <stop offset="0" stopColor="#fff" stopOpacity="0" />
                    <stop offset="0.7" stopColor="#fff" stopOpacity="0.3" />
                    <stop offset="0.96" stopColor="#fff" stopOpacity="1" />
                    <stop offset="1" stopColor="#fff" stopOpacity="1" />
                  </linearGradient>
                  <mask id="srLiveMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="240">
                    <rect x="-420" y="0" width="420" height="240" fill="url(#srTail)">
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="0 0"
                        to="1420 0"
                        dur="6s"
                        begin="0.2s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  </mask>
                  <mask id="srHeadMask" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="240">
                    <rect x="-8" y="0" width="8" height="240" fill="#fff">
                      <animateTransform
                        attributeName="transform"
                        type="translate"
                        from="0 0"
                        to="1420 0"
                        dur="6s"
                        begin="0.2s"
                        repeatCount="indefinite"
                      />
                    </rect>
                  </mask>
                </defs>
                <path className="sr-trace-base" d={TRACE_PATH} />
                <path className="sr-trace" d={TRACE_PATH} mask="url(#srLiveMask)" />
                <path className="sr-trace-head" d={TRACE_PATH} mask="url(#srHeadMask)" />
              </svg>

              {MILESTONES.map((m) => (
                <div
                  key={m.title}
                  className="sr-mark"
                  style={{ "--x": m.x, animationDelay: `${m.delay}s` } as React.CSSProperties}
                >
                  <span className="sr-mark-dot" />
                  <div className="sr-mark-text">
                    <span className="sr-mark-title">{m.title}</span>
                    <span className="sr-mark-desc">{m.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Sign-in sheet ---------------- */}
        <section className="sr-auth-card">
          <div className="sr-ruler" aria-hidden="true" />

          <header className="sr-auth-header">
            <h2 className="sr-auth-title">Welcome back</h2>
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
                    clearErrors();
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
                    clearErrors();
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
                  <span>Signing in…</span>
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

          <button type="button" className="sr-btn sr-btn--ghost" onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4" />
            <span>Create Your Own User</span>
          </button>

          <p className="sr-demo-note">Only for demo purpose</p>

          <div className="sr-secure-note">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure access for doctors and health workers</span>
          </div>
        </section>
      </main>
    </div>
  );
};