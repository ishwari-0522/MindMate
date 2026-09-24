import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { IconLock, IconEye, IconEyeOff } from "../components/Icons.jsx";

export default function SignUp() {
  const { signUp } = useApp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = firstName.trim().length > 0 && email.trim().length > 3 && password.length >= 4;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    signUp({ firstName: firstName.trim(), email: email.trim() });
    navigate("/home");
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
            placeholder="Asavari"
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
            placeholder="asavari@design.com"
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
              placeholder="••••••••••••"
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

        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          Create Private Account
        </button>
      </form>

      <p className="divider-text">or sign up with</p>

      <div className="oauth-row">
        <button className="oauth-btn" type="button" onClick={() => { signUp({ firstName: "Asavari", email: "asavari@mindmate.co" }); navigate("/home"); }}>
          Google
        </button>
        <button className="oauth-btn" type="button" onClick={() => { signUp({ firstName: "Asavari", email: "asavari@mindmate.co" }); navigate("/home"); }}>
          Apple
        </button>
      </div>

      <p className="auth-footer">
        Already have an account? <Link to="/login" className="link-btn">Log in</Link>
      </p>
    </div>
  );
}
