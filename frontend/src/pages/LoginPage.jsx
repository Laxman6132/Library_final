import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/api";
import { Eye, EyeOff, BookOpen, User, Lock, ArrowRight } from "lucide-react";
import bgImage from "../assets/library_image_for_background.jpg";
import SplashScreen from "../components/SplashScreen";

export default function LoginPage() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSplash, setShowSplash] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login(form.userName, form.password);
      loginUser(res.data);
      setShowSplash(true);
    } catch (err) {
      setError(err.response?.data || "Login failed. Please check your credentials.");
      setLoading(false);
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => navigate("/home")} />;
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      fontFamily: "'Inter', sans-serif",
      overflow: "hidden",
    }}>
      {/* Full-screen blurred background */}
      <img
        src={bgImage}
        alt=""
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          filter: "blur(6px) brightness(0.35) saturate(0.6)",
          transform: "scale(1.05)",
        }}
      />

      {/* Orange radial glow top-left */}
      <div style={{
        position: "absolute", top: -120, left: -120,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,140,0,0.25) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 440,
        margin: "0 16px",
      }}>
        {/* Logo + brand */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 60, height: 60,
            background: "linear-gradient(135deg, #ff8c00 0%, #ff6b00 100%)",
            borderRadius: 18,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 32px rgba(255,140,0,0.4)",
            marginBottom: 14,
          }}>
            <BookOpen size={28} color="#fff" />
          </div>
          <div style={{
            color: "#ff8c00", fontWeight: 800,
            fontSize: "0.8rem", letterSpacing: "0.18em",
            textTransform: "uppercase", marginBottom: 4,
          }}>
            SCANEXUS
          </div>
          <h1 style={{
            color: "#fff", fontWeight: 800,
            fontSize: "1.8rem", margin: 0,
            letterSpacing: "-0.02em",
          }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem", marginTop: 6 }}>
            Sign in to continue your reading journey
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#fff",
          borderRadius: 24,
          padding: "36px 36px 28px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)",
        }}>
          {/* Error */}
          {error && (
            <div style={{
              background: "#fff5f5",
              border: "1px solid #fecaca",
              borderRadius: 10,
              padding: "11px 14px",
              marginBottom: 20,
              color: "#dc2626",
              fontSize: "0.85rem",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Username field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block",
                color: "#374151",
                fontSize: "0.83rem",
                fontWeight: 600,
                marginBottom: 7,
              }}>
                Username
              </label>
              <div style={{ position: "relative" }}>
                <User size={16} color="#9ca3af"
                  style={{ position: "absolute", top: "50%", left: 13, transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={form.userName}
                  onChange={e => setForm({ ...form, userName: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    background: "#f9fafb",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px 14px 12px 40px",
                    color: "#111827",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#ff8c00";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255,140,0,0.12)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 10 }}>
              <label style={{
                display: "block",
                color: "#374151",
                fontSize: "0.83rem",
                fontWeight: 600,
                marginBottom: 7,
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} color="#9ca3af"
                  style={{ position: "absolute", top: "50%", left: 13, transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  style={{
                    width: "100%",
                    background: "#f9fafb",
                    border: "1.5px solid #e5e7eb",
                    borderRadius: 12,
                    padding: "12px 44px 12px 40px",
                    color: "#111827",
                    fontSize: "0.95rem",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "#ff8c00";
                    e.target.style.boxShadow = "0 0 0 3px rgba(255,140,0,0.12)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "#e5e7eb";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", top: "50%", right: 12,
                    transform: "translateY(-50%)",
                    background: "none", border: "none",
                    cursor: "pointer", color: "#9ca3af",
                    display: "flex", padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <span style={{ color: "#ff8c00", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>
                Forgot Password?
              </span>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading
                  ? "rgba(255,140,0,0.5)"
                  : "linear-gradient(135deg, #ff8c00 0%, #ff6200 100%)",
                border: "none",
                borderRadius: 12,
                padding: "13px",
                color: "#fff",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 20px rgba(255,140,0,0.35)",
                letterSpacing: "0.01em",
                transition: "opacity 0.15s, transform 0.1s",
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.opacity = "0.92"; e.currentTarget.style.transform = "translateY(-1px)"; }}}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm" style={{ width: 17, height: 17, borderWidth: 2 }} />
                  Signing in…
                </>
              ) : (
                <>Sign In <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0 18px" }}>
            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
            <span style={{ color: "#d1d5db", fontSize: "0.78rem" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "#f3f4f6" }} />
          </div>

          {/* Register */}
          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#6b7280", fontSize: "0.9rem" }}>
              Don't have an account?{" "}
            </span>
            <Link
              to="/register"
              style={{ color: "#ff8c00", fontWeight: 700, fontSize: "0.9rem", textDecoration: "none" }}
            >
              Sign Up →
            </Link>
          </div>
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: "0.75rem", marginTop: 20 }}>
          © 2025 Scanexus Library Management
        </p>
      </div>
    </div>
  );
}
