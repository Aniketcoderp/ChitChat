import React, { useState } from "react";
import "./Login.css";
import assets from "../../assets/assets";
import { signup,login } from "../../config/firebase";

const Login = () => {
  const [currState, setCurrState] = useState("Sign Up");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmitHandler = (e) => {
    e.preventDefault();  
    if (currState==="Sign Up") {
      signup(username, email, password);  
    }
    else{
      login(email,password)
    }
  };

  return (
    <div className="login">
      <img src={assets.logo_sm} alt="Logo" className="logo" />
      <form className="login-form" onSubmit={onSubmitHandler}>
        <h2>{currState}</h2>
        {currState === "Sign Up" && (
          <input
            type="text"
            placeholder="Username"
            className="form-input"
            value={username}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email Address"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="form-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {currState === "Sign Up" ? "Create Account" : "Log In"}
        </button>
        <div className="login-term">
          <input type="checkbox" required />
          <p>Agree to the terms of use & privacy policy</p>
        </div>
        <div className="login-forgot">
          {currState === "Sign Up" ? (
            <p className="login-toggle">
              Already have an account?{" "}
              <span onClick={() => setCurrState("Log In")}>Login Here</span>
            </p>
          ) : (
            <p className="login-toggle">
              Create Account?{" "}
              <span onClick={() => setCurrState("Sign Up")}>Click Here</span>
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default Login;
