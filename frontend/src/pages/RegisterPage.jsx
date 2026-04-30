import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser } from "../services/api";
import { BookOpen, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    userId: 0,
    userName: "",
    emailId: "",
    password: "",
    gender: "",
    address: "",
    phNo: "",
    role: "USER",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await createUser({ ...form, phNo: parseInt(form.phNo) || 0 });
      setSuccess("Account created successfully! Redirecting to login…");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center py-5"
      style={{
        background:
          "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: -80,
          right: -80,
          width: 350,
          height: 350,
          borderRadius: "50%",
          background: "rgba(249,115,22,0.1)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ maxWidth: 520 }}>
        <div
          className="card border-0 shadow-lg"
          style={{ borderRadius: 20, overflow: "hidden" }}
        >
          <div
            className="text-center py-4 px-4"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
            }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{ width: 56, height: 56, background: 'rgba(255,255,255,0.2)' }}
            >
              <BookOpen size={26} className="text-white" />
            </div>
            <h3 className="text-white fw-bold mb-1">Create Account</h3>
            <p className="text-white-50 mb-0" style={{ fontSize: "0.875rem" }}>
              Join Scanexus today
            </p>
          </div>

          <div className="card-body p-4 p-md-5">
            {error && (
              <div
                className="alert alert-danger border-0 rounded-3 mb-3"
                style={{ fontSize: "0.875rem" }}
              >
                ⚠ {error}
              </div>
            )}
            {success && (
              <div
                className="alert alert-success border-0 rounded-3 mb-3"
                style={{ fontSize: "0.875rem" }}
              >
                ✓ {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Username *
                  </label>
                  <input
                    id="reg-username"
                    name="userName"
                    type="text"
                    className="form-control border-0 bg-light"
                    placeholder="Choose a username"
                    value={form.userName}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-12">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Email Address *
                  </label>
                  <input
                    id="reg-email"
                    name="emailId"
                    type="email"
                    className="form-control border-0 bg-light"
                    placeholder="your@email.com"
                    value={form.emailId}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-12">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Password *
                  </label>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    className="form-control border-0 bg-light"
                    placeholder="Create a strong password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Gender
                  </label>
                  <select
                    id="reg-gender"
                    name="gender"
                    className="form-select border-0 bg-light"
                    value={form.gender}
                    onChange={handleChange}
                    style={{ borderRadius: 10 }}
                  >
                    <option value="">Select gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Phone Number
                  </label>
                  <input
                    id="reg-phone"
                    name="phNo"
                    type="number"
                    className="form-control border-0 bg-light"
                    placeholder="10-digit number"
                    value={form.phNo}
                    onChange={handleChange}
                    style={{ borderRadius: 10 }}
                  />
                </div>
                <div className="col-12">
                  <label
                    className="form-label fw-semibold"
                    style={{ fontSize: "0.83rem" }}
                  >
                    Address
                  </label>
                  <textarea
                    id="reg-address"
                    name="address"
                    className="form-control border-0 bg-light"
                    rows={2}
                    placeholder="Your address (optional)"
                    value={form.address}
                    onChange={handleChange}
                    style={{ borderRadius: 10 }}
                  />
                </div>
              </div>

              <button
                id="reg-submit"
                type="submit"
                className="btn btn-lg w-100 fw-semibold mt-4 text-white"
                disabled={loading}
                style={{
                  borderRadius: 12,
                  background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                  border: "none",
                }}
              >
                {loading ? (
                  <span>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating…
                  </span>
                ) : (
                  <span>
                    <UserPlus size={18} className="me-2" />
                    Create Account
                  </span>
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                Already have an account?{" "}
              </span>
              <Link
                to="/login"
                className="text-primary fw-semibold text-decoration-none"
                style={{ fontSize: "0.875rem" }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
