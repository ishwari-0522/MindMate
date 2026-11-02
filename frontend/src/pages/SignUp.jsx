import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { errorMessage } from "../api/client.js";
import { IconLock, IconEye, IconEyeOff } from "../components/Icons.jsx";

export default function SignUp() {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = firstName.trim().length > 0 && email.trim().length > 3 && password.length >= 8;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError("");
    try {
      await signUp({ firstName: firstName.trim(), email: email.trim(), password });
      navigate("/home");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="auth-header">
        <h1>Begin Your Journey</h1>
        <p>Let's set up your private, secure wellness hub.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            className="input"
            placeholder="Name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            className="input"
            placeholder="Email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-wrap">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="input"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>
        </div>

        <div className="privacy-note">
          <IconLock />
          <span>Your data is 100% private, clinically encrypted, and HIPAA-compliant.</span>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={!canSubmit || submitting}>
          {submitting ? "Creating account..." : "Create Private Account"}
        </button>
      </form>

      <p className="auth-footer" style={{ marginTop: 26 }}>
        Already have an account? <Link to="/login" className="link-btn">Log in</Link>
      </p>
    </div>
  );
}
