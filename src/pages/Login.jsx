import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import "../styles/login.css";

export default function Login() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      await login(password);

      navigate("/choose");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login Failed"
      );
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="loginPage">

      <div className="loginCard">

        <h1>🌸Surprise For YOU🌸</h1>

        <p>
          Enter your password to continue
        </p>

        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          onKeyDown={handleKeyDown}
        />

        <button
          className="showBtn"
          onClick={() =>
            setShowPassword(!showPassword)
          }
        >
          {showPassword
            ? "Hide Password"
            : "Show Password"}
        </button>

        <button
          className="loginBtn"
          onClick={handleLogin}
          disabled={loading}
        >
          {loading
            ? "Please Wait..."
            : "Unlock"}
        </button>

        {error && (
          <p className="error">
            {error}
          </p>
        )}

      </div>

    </div>
  );
}