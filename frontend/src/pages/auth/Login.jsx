// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";

// const Login = () => {

//     const navigate = useNavigate();

//     const { login } = useAuth();

//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");

//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {

//         e.preventDefault();

//         setError("");
//         setLoading(true);

//         try {

//             const user = await login(
//                 email,
//                 password
//             );

//             // Redirect based on role
//             if (user.role === "admin") {
//                 navigate("/admin/dashboard");
//             }
//             else if (user.role === "coach") {
//                 navigate("/coach/dashboard");
//             }
//             else if (user.role === "student") {
//                 navigate("/student/dashboard");
//             }

//         } catch (error) {

//             setError(
//                 error.response?.data?.message ||
//                 "Login failed"
//             );

//         } finally {

//             setLoading(false);
//         }
//     };

//     return (
//         <div className="login-container">

//             <div className="login-box">

//                 <h1>BIT Sports Council</h1>

//                 <h2>Login</h2>

//                 {error && (
//                     <p className="error">
//                         {error}
//                     </p>
//                 )}

//                 <form onSubmit={handleSubmit}>

//                     <div>
//                         <label>Email</label>

//                         <input
//                             type="email"
//                             placeholder="Enter your email"
//                             value={email}
//                             onChange={(e) =>
//                                 setEmail(e.target.value)
//                             }
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label>Password</label>

//                         <input
//                             type="password"
//                             placeholder="Enter your password"
//                             value={password}
//                             onChange={(e) =>
//                                 setPassword(e.target.value)
//                             }
//                             required
//                         />
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                     >
//                         {loading ? "Logging in..." : "Login"}
//                     </button>
//                     <div className="login-links">

//     <button
//         type="button"
//         onClick={() => navigate("/forgot-password")}
//     >
//         Forgot Password?
//     </button>

//     <button
//         type="button"
//         onClick={() => navigate("/register")}
//     >
//         Student Registration
//     </button>

// </div>

//                 </form>

//             </div>

//         </div>
//     );
// };

// export default Login;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/login.css";
import logo from "../../assets/icons/logo1.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (user.role === "coach") {
        navigate("/coach/dashboard");
      } else if (user.role === "student") {
        navigate("/student/dashboard");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg-grid" />
      <div className="login-glow login-glow-top" />
      <div className="login-glow login-glow-bottom" />

      <main className="login-main">
        {/* Left: Branding panel */}
        <div className="login-promo glass-panel">
          <div className="login-promo-content">
            <img src={logo} alt="BIT Sports Council Logo" className="logo-img" />
            <h1>
              Command
              <br />
              Your Game.
            </h1>
            <p>
              Access the central intelligence hub for sports management,
              tournament logistics, and athlete data tracking.
            </p>
          </div>
          <div className="login-promo-tags">
            <span>
              <span className="material-symbols-outlined">speed</span>
              High Performance
            </span>
            <span className="login-dot" />
            <span>
              <span className="material-symbols-outlined">security</span>
              Secure Access
            </span>
          </div>
        </div>

        {/* Right: Form panel */}
        <div className="login-form-wrap">
          <div className="login-box glass-panel">
            <img
              className="login-logo-mobile"
              alt="BIT Sports Council Logo"
              src="https://lh3.googleusercontent.com/aida/AP1WRLuvT-OF9ynY-gekYTAyeJ5KqC17oC1P11izMt7Krg_oVbnb0AsQVANZ8DOQWJBb7_dW6DFhl2yTRy7a0b7zlA2r2Dm-6xlNoU62e_rzv6eTZAB1UThDGVs5o6cmnGj2F4F5np015X5E70g0GVICc4XC5ErG_HvgVhJX7ZHDg8Qg2ESNtMqEmVEQy7b89NiQPT3VHy2w7F_OsnTCdxqyOioajTH9PAVjVxnXBD4lo3mz5rkO4Uw4aNOPDvo"
            />

            <div className="login-header">
              <h2>Welcome Back</h2>
              <p>Sign in to the BIT Sports Council portal.</p>
            </div>

            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="field">
                <label htmlFor="email">Email Address</label>
                <div className="field-input">
                  <span className="material-symbols-outlined field-icon">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="field">
                <div className="field-label-row">
                  <label htmlFor="password">Password</label>
                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="field-input">
                  <span className="material-symbols-outlined field-icon">
                    lock
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* <div className="remember-row">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="remember-me">Remember me for 30 days</label>
              </div> */}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </form>

            <div className="login-links">
              <p>
                Don't have an account?{" "}
                <button type="button" onClick={() => navigate("/register")}>
                  Sign Up
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;