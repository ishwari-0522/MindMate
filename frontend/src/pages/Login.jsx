import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { IconEye, IconEyeOff } from "../components/Icons.jsx";

export default function Login() {
  const { logIn } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = email.trim().length > 3 && password.length >= 4;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    logIn(email.trim());
    navigate("/home");
  };

  return (
    <div>
      <div className="auth-header">
        <h1>Welcome Back</h1>
        <p>Log in to continue your wellness journey.</p>
      </div>

      <form onSubmit={handleSubmit}>
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

        <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
          Log In
        </button>
      </form>

      <p className="auth-footer" style={{ marginTop: 22 }}>
        New here? <Link to="/signup" className="link-btn">Create an account</Link>
      </p>
    </div>
  );
}
