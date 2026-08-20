import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/register.css";
import logo from "../../assets/icons/logo1.png";

const StudentRegister = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // must exist in AuthContext

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // role fixed as "student"
      await register(name, email, password, "student");
      navigate("/student/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* Left: Branding panel
      <div className="register-promo">
        <div className="register-promo-overlay" />
        <div className="register-promo-content">
          <div className="register-promo-panel glass-panel">
            <img src={logo} alt="BIT Sports Council Logo" className="logo-img" />
            <h2>Elevate Your Game.</h2>
            <p>
              Join the BIT Sports Council. Access elite tournaments, manage
              your team inventory, and track performance analytics in one
              unified platform.
            </p>
          </div>
        </div>
      </div> */}

      {/* Right: Registration form */}
      <div className="register-form-wrap">
        <div className="register-box glass-panel">
          <div className="register-header">
            <img
              className="register-logo-mobile"
              alt="BIT Sports Council Logo"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuvT-OF9ynY-gekYTAyeJ5KqC17oC1P11izMt7Krg_oVbnb0AsQVANZ8DOQWJBb7_dW6DFhl2yTRy7a0b7zlA2r2Dm-6xlNoU62e_rzv6eTZAB1UThDGVs5o6cmnGj2F4F5np015X5E70g0GVICc4XC5ErG_HvgVhJX7ZHDg8Qg2ESNtMqEmVEQy7b89NiQPT3VHy2w7F_OsnTCdxqyOioajTH9PAVjVxnXBD4lo3mz5rkO4Uw4aNOPDvo"
            />
            <h1>Create Account</h1>
            <p>Enter your details to join the council.</p>
          </div>

          {error && <p className="register-error">{error}</p>}

          <form onSubmit={handleSubmit} className="register-form">
            <div className="field">
              <label htmlFor="fullName">Full Name</label>
              <div className="field-input">
                <span className="material-symbols-outlined field-icon">
                  person
                </span>
                <input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="email">Institutional Email</label>
              <div className="field-input">
                <span className="material-symbols-outlined field-icon">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="john.doe@bit.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="field-input">
                <span className="material-symbols-outlined field-icon">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="register-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </form>

          <div className="register-links">
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/login")}>
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;