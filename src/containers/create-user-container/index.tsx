"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  UserPlus,
} from "lucide-react";
import { UserRole, UserService } from "@/service/userService";
import "./style.css";

export const CreateUserContainer: React.FC = () => {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("HEALTH_WORKER");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUserId, setCreatedUserId] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const createdUser = await UserService.createUser({
        user_id: userId.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });
      setCreatedUserId(createdUser.user_id);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to create your account. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdUserId) {
    return (
      <main className="create-user-page">
        <section className="create-user-card create-user-success" aria-live="polite">
          <span className="create-user-success-icon">
            <CheckCircle2 aria-hidden="true" />
          </span>
          <p className="create-user-eyebrow">Account created</p>
          <h1>You&apos;re ready to sign in.</h1>
          <p className="create-user-description">
            Your user ID is <strong>{createdUserId}</strong>.
          </p>
          <Link className="create-user-submit" href="/login">
            <span>Continue to sign in</span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="create-user-page">
      <section className="create-user-card">
        <Link className="create-user-back" href="/login" aria-label="Back to sign in">
          <ArrowLeft aria-hidden="true" />
          <span>Back to sign in</span>
        </Link>

        <div className="create-user-heading">
          <img src="/images/screening-refer-logo.png" alt="Screen & Refer" />
          <span className="create-user-icon">
            <UserPlus aria-hidden="true" />
          </span>
          <p className="create-user-eyebrow">Demo access</p>
          <h1>Create your user</h1>
          <p className="create-user-description">
            Set up an account to enter the Screen &amp; Refer portal.
          </p>
        </div>

        {error && (
          <div className="create-user-error" role="alert">
            <AlertCircle aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        <form className="create-user-form" onSubmit={handleSubmit}>
          <label className="create-user-field">
            <span>Full name</span>
            <input
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label className="create-user-field">
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <div className="create-user-field-row">
            <label className="create-user-field">
              <span>User ID</span>
              <input
                autoComplete="username"
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                required
              />
            </label>

            <label className="create-user-field">
              <span>Role</span>
              <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
                <option value="HEALTH_WORKER">Health worker</option>
                <option value="DOCTOR">Doctor</option>
              </select>
            </label>
          </div>

          <label className="create-user-field">
            <span>Password</span>
            <span className="create-user-password-wrap">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                className="create-user-password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              </button>
            </span>
          </label>

          <label className="create-user-field">
            <span>Confirm password</span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </label>

          <button className="create-user-submit" type="submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Creating account..." : "Create account"}</span>
            {!isSubmitting && <ArrowRight aria-hidden="true" />}
          </button>
        </form>
      </section>
    </main>
  );
};