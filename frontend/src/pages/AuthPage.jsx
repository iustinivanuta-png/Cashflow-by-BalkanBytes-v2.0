import { useEffect, useState } from "react";
import "./AuthPage.css";

const API = "http://localhost:4000";

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.add("light-mode");
    } else {
      document.body.classList.remove("light-mode");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleModeChange = (nextMode) => {
    setError("");
    setShowPassword(false);
    setIsLogin(nextMode);
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email.trim() || !form.password.trim() || (!isLogin && !form.name.trim())) {
      setError("Completează toate câmpurile.");
      return;
    }

    try {
      setLoading(true);

      const endpoint = isLogin ? "/auth/login" : "/auth/register";

      const payload = isLogin
        ? {
            email: form.email.trim(),
            password: form.password.trim(),
          }
        : {
            name: form.name.trim(),
            email: form.email.trim(),
            password: form.password.trim(),
          };

      const res = await fetch(`${API}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "A apărut o eroare");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page page-enter">
      <div className="auth-orb orb-a"></div>
      <div className="auth-orb orb-b"></div>

      <div className="auth-layout">
        <div className="auth-left glass-auth fade-up delay-1">
          <div className="auth-topbar">
            <span className="auth-badge">CashFlow</span>

            <button
              className="theme-btn"
              type="button"
              onClick={handleThemeToggle}
            >
              {theme === "dark" ? "☀ Light" : "🌙 Dark"}
            </button>
          </div>

          <h1>Manage your money with clarity.</h1>
          <p>
            Monitor income, expenses and balance in one modern dashboard.
            Secure login, personal data and a clean finance overview.
          </p>

          <div className="auth-features">
            <div className="feature-card fade-up delay-2">
              <strong>Secure login</strong>
              <span>Each user sees only their own transactions.</span>
            </div>

            <div className="feature-card fade-up delay-3">
              <strong>Smart tracking</strong>
              <span>Income, expenses and category charts in one place.</span>
            </div>

            <div className="feature-card fade-up delay-4">
              <strong>Clean dashboard</strong>
              <span>Modern interface with fast access to all data.</span>
            </div>
          </div>
        </div>

        <div className="auth-right glass-auth fade-up delay-2">
          <div className="tabs">
            <button
              className={isLogin ? "tab active" : "tab"}
              onClick={() => handleModeChange(true)}
              type="button"
              disabled={loading}
            >
              Login
            </button>
            <button
              className={!isLogin ? "tab active" : "tab"}
              onClick={() => handleModeChange(false)}
              type="button"
              disabled={loading}
            >
              Register
            </button>
          </div>

          <div key={isLogin ? "login" : "register"} className="auth-switch">
            <h2>{isLogin ? "Welcome back" : "Create account"}</h2>
            <p className="auth-subtitle">
              {isLogin
                ? "Login to access your personal finance dashboard."
                : "Create a new account and start tracking your budget."}
            </p>

            {error && <div className="auth-error">{error}</div>}

            <form className="auth-form" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="auth-field">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="auth-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="auth-field">
                <label>Password</label>
                <div className="password-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? (
                  <span className="btn-loader-wrap">
                    <span className="spinner small"></span>
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </span>
                ) : isLogin ? (
                  "Login"
                ) : (
                  "Create account"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;