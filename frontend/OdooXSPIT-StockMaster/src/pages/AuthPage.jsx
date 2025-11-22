// src/pages/AuthPage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { postJSON, postFormUrlEncoded, saveToken } from "../lib/api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");

  const fieldBaseStyles =
    "mt-1 w-full rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition duration-150";

  const navigate = useNavigate();

  // --- Validation Logic (Frontend UX Feedback) ---

  // Password checks [cite: image_294500.png]: length > 8, small/large/special char
  const isLengthValid = password.length >= 9; // "more than 8 characters" is >= 9
  const hasLowerCase = /[a-z]/.test(password); // Checks for small case
  const hasUpperCase = /[A-Z]/.test(password); // Checks for large case
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Checks for special character
  const passwordsMatch = password === rePassword;

  const handleAuth = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const runFinally = (fn) => {
      try {
        fn();
      } finally {
        setLoading(false);
      }
    };

    if (!isLogin) {
      // --- Frontend Sign Up Validation ---
      if (!isLengthValid || !hasLowerCase || !hasUpperCase || !hasSpecialChar) {
        setError(
          "Password must be 9+ characters and contain a small case, large case, and special character."
        );
        runFinally(() => {});
        return;
      }
      if (!passwordsMatch) {
        setError("Passwords do not match.");
        runFinally(() => {});
        return;
      }

      // Call backend to register
      (async () => {
        try {
          const userPayload = {
            email,
            password,
            full_name: fullName || undefined,
          };
          await postJSON("/users/", userPayload);
          // Auto-login: fetch token
          const tokenResp = await postFormUrlEncoded("/token", {
            username: email,
            password,
          });
          saveToken(tokenResp.access_token);
          setSuccess("Account created and signed in. Redirecting...");
          setTimeout(() => navigate("/dashboard"), 600);
        } catch (err) {
          setError(formatApiError(err) || "Sign up failed");
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    // LOGIN flow
    (async () => {
      try {
        // backend expects email as username
        if (!loginId.includes("@")) {
          throw new Error("Please use your email address to sign in.");
        }
        const tokenResp = await postFormUrlEncoded("/token", {
          username: loginId,
          password,
        });
        saveToken(tokenResp.access_token);
        setSuccess("Signed in. Redirecting...");
        setTimeout(() => navigate("/dashboard"), 300);
      } catch (err) {
        setError(formatApiError(err) || "Sign in failed");
      } finally {
        setLoading(false);
      }
    })();
  };

  const handlePasswordReset = () => {
    // Show inline reset panel instead of browser prompt
    setError(null);
    setSuccess(null);
    setResetVisible(true);
    setResetStep(1);
  };

  // Password reset UI state
  const [resetVisible, setResetVisible] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1=request, 2=confirm
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetReNewPassword, setResetReNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState(null);
  const [resetSuccess, setResetSuccess] = useState(null);

  const requestReset = async (e) => {
    e && e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    if (!resetEmail) {
      setResetError("Enter your registered email.");
      return;
    }
    setResetLoading(true);
    try {
      await postJSON("/password-reset/request", { email: resetEmail });
      setResetSuccess(
        "If the email is registered, a reset code has been sent."
      );
      setResetStep(2);
    } catch (err) {
      setResetError(formatApiError(err) || "Request failed");
    } finally {
      setResetLoading(false);
    }
  };

  const confirmReset = async (e) => {
    e && e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    // client-side checks
    if (!resetOtp) {
      setResetError("Enter the OTP sent to your email.");
      return;
    }
    if (resetNewPassword.length < 9) {
      setResetError("Password must be at least 9 characters.");
      return;
    }
    if (
      !/[a-z]/.test(resetNewPassword) ||
      !/[A-Z]/.test(resetNewPassword) ||
      !/[!@#$%^&*(),.?":{}|<>]/.test(resetNewPassword)
    ) {
      setResetError(
        "Password must include upper, lower and special character."
      );
      return;
    }
    if (resetNewPassword !== resetReNewPassword) {
      setResetError("Passwords do not match.");
      return;
    }
    setResetLoading(true);
    try {
      await postJSON("/password-reset/confirm", {
        email: resetEmail,
        otp: resetOtp,
        new_password: resetNewPassword,
      });
      setResetSuccess("Password has been reset. You can sign in now.");
      // clear and close after short delay
      setTimeout(() => {
        setResetVisible(false);
        setResetStep(1);
        setResetEmail("");
        setResetOtp("");
        setResetNewPassword("");
        setResetReNewPassword("");
        setSuccess("Password reset successful. Please sign in.");
      }, 700);
    } catch (err) {
      setResetError(formatApiError(err) || "Reset failed");
    } finally {
      setResetLoading(false);
    }
  };

  // UI state for feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Helper: format API errors into a readable string
  const formatApiError = (err) => {
    if (!err) return "Unknown error";
    // If body.detail is an array of validation errors from FastAPI
    const body = err.body || err?.body || err;
    const detail = body && body.detail;
    if (Array.isArray(detail)) {
      // join pydantic error messages
      return detail
        .map((d) => {
          if (typeof d === "string") return d;
          if (d.msg)
            return d.msg + (d.loc ? ` (at ${d.loc.join(" -> ")})` : "");
          return JSON.stringify(d);
        })
        .join("; ");
    }
    if (typeof body === "string") return body;
    if (err.message) return err.message;
    return JSON.stringify(err);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-600 blur-3xl" />
        <div className="absolute top-1/2 right-0 h-96 w-96 translate-x-1/3 rounded-full bg-purple-700 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500 blur-[120px]" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-5xl gap-10 rounded-[32px] bg-white/5 p-8 shadow-2xl shadow-indigo-900/40 ring-1 ring-white/10 backdrop-blur-2xl lg:grid-cols-[1.1fr_0.9fr] lg:p-12">
          <div className="hidden flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-10 text-white lg:flex">
            <div className="space-y-6">
              <p className="inline-flex items-center rounded-full border border-white/30 px-3 py-1 text-xs tracking-[0.2em] uppercase text-white/70">
                StockMaster
              </p>
              <h1 className="text-4xl font-semibold leading-tight">
                Modular IMS that keeps{" "}
                <span className="text-cyan-300">every stock move</span> live and
                traceable.
              </h1>
              <p className="text-base text-white/70">
                A centralized, real-time cockpit anyone can drive.
              </p>

              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=60"
                  alt="Warehouse operators collaborating with digital dashboards"
                  className="h-36 w-full object-cover opacity-90"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          <div className="w-full rounded-3xl border border-white/10 bg-white/95 p-8 shadow-2xl shadow-indigo-900/20 sm:p-10">
            <div className="space-y-1 text-center text-slate-900">
              <p className="text-sm uppercase tracking-[0.3em] text-indigo-600">
                StockMaster
              </p>
              <h2 className="text-3xl font-bold">
                {isLogin ? "Welcome back" : "Sign up"}
              </h2>
            </div>

            {/* If reset flow is visible, show reset panel */}
            {resetVisible ? (
              <form
                className="mt-8 space-y-6"
                onSubmit={resetStep === 1 ? requestReset : confirmReset}
              >
                {(resetError || resetSuccess) && (
                  <div className="rounded-md p-3 text-sm">
                    {resetError && (
                      <div className="text-red-600">{resetError}</div>
                    )}
                    {resetSuccess && (
                      <div className="text-green-600">{resetSuccess}</div>
                    )}
                  </div>
                )}

                {resetStep === 1 && (
                  <div>
                    <label
                      htmlFor="resetEmail"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Enter Email Id
                    </label>
                    <input
                      id="resetEmail"
                      type="email"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className={fieldBaseStyles}
                    />
                  </div>
                )}

                {resetStep === 2 && (
                  <>
                    <div>
                      <label
                        htmlFor="resetOtp"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Enter OTP
                      </label>
                      <input
                        id="resetOtp"
                        type="text"
                        required
                        value={resetOtp}
                        onChange={(e) => setResetOtp(e.target.value)}
                        className={fieldBaseStyles}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="resetNewPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        New Password
                      </label>
                      <input
                        id="resetNewPassword"
                        type="password"
                        required
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className={fieldBaseStyles}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="resetReNewPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Re-Enter New Password
                      </label>
                      <input
                        id="resetReNewPassword"
                        type="password"
                        required
                        value={resetReNewPassword}
                        onChange={(e) => setResetReNewPassword(e.target.value)}
                        className={fieldBaseStyles}
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setResetVisible(false);
                      setResetStep(1);
                      setResetError(null);
                      setResetSuccess(null);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className={`rounded-2xl border border-transparent bg-gradient-to-r from-indigo-600 to-purple-600 py-2 px-4 text-sm font-semibold text-white shadow-lg ${
                      resetLoading ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {resetLoading
                      ? resetStep === 1
                        ? "Sending..."
                        : "Confirming..."
                      : resetStep === 1
                      ? "Send Reset Code"
                      : "Confirm Reset"}
                  </button>
                </div>
              </form>
            ) : (
              <form className="mt-8 space-y-6" onSubmit={handleAuth}>
                {/* feedback messages */}
                {(error || success) && (
                  <div className="rounded-md p-3 text-sm">
                    {error && <div className="text-red-600">{error}</div>}
                    {success && <div className="text-green-600">{success}</div>}
                  </div>
                )}
                {/* LOGIN ID (only for Sign In) */}
                {isLogin && (
                  <div>
                    <label
                      htmlFor="loginId"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Login Id
                    </label>
                    <input
                      id="loginId"
                      type="text"
                      required
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      className={fieldBaseStyles}
                    />
                  </div>
                )}

                {/* EMAIL ID Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Enter Email Id
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={fieldBaseStyles}
                    />
                  </div>
                )}

                {/* FULL NAME Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={fieldBaseStyles}
                    />
                  </div>
                )}

                {/* PASSWORD Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    {isLogin ? "Password" : "Enter Password"}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={fieldBaseStyles}
                  />
                </div>

                {/* RE-ENTER PASSWORD Field (Sign Up Only) */}
                {!isLogin && (
                  <div>
                    <label
                      htmlFor="rePassword"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Re-Enter Password
                    </label>
                    <input
                      id="rePassword"
                      type="password"
                      required
                      autoComplete="off"
                      value={rePassword}
                      onChange={(e) => setRePassword(e.target.value)}
                      className={fieldBaseStyles}
                    />
                    {rePassword.length > 0 && !passwordsMatch && (
                      <p className="mt-1 text-xs text-red-500">
                        Passwords do not match.
                      </p>
                    )}
                  </div>
                )}

                {/* Forgot Password / Sign Up Toggle */}
                {isLogin && (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition duration-150"
                    >
                      Forgot Password ? (OTP Reset)
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center rounded-2xl border border-transparent py-3 text-lg font-semibold text-white shadow-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 active:scale-[0.98] ${
                    loading
                      ? "opacity-60 cursor-not-allowed from-indigo-500 to-purple-500"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.01] hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/30"
                  }`}
                >
                  {loading
                    ? isLogin
                      ? "Signing in..."
                      : "Signing up..."
                    : isLogin
                    ? "SIGN IN"
                    : "SIGN UP"}
                </button>
              </form>
            )}

            <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-100 p-4 text-sm">
              <span className="text-gray-500">
                {isLogin ? "Need an account?" : "Already onboarded?"}
              </span>
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
