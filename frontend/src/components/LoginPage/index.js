import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "./index.css";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showSubmitError, setShowSubmitError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [haveAnAccount, setHaveAnAccount] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const jwtToken = Cookies.get("jwt_token");
    if (jwtToken) {
      navigate("/");
    }
  }, [navigate]); // Runs once on mount and if `navigate` changes

  const onChangeUsername = (event) => setUsername(event.target.value);

  const onChangePassword = (event) => setPassword(event.target.value);

  const onSubmitSuccess = (jwtToken) => {
    Cookies.set("jwt_token", jwtToken, { expires: 30 });
    navigate("/");
    setShowSubmitError(false);
    setErrorMsg("");
    setUsername("");
    setPassword("");
    console.log("Login success", jwtToken);
  };

  const onSubmitFailure = (errorMsg) => {
    setShowSubmitError(true);
    setErrorMsg(errorMsg);
  };

  const toggleAuthMode = () => setHaveAnAccount((prev) => !prev);

  const submitForm = async (event) => {
    event.preventDefault();

    if (username === "") {
      setShowSubmitError(true);
      setErrorMsg("Required Username field");
      return;
    }

    if (password === "") {
      setShowSubmitError(true);
      setErrorMsg("Required Password field");
      return;
    }

    const userDetails = { username, password };
    const apiDomain = "http://localhost:3000";
    console.log(apiDomain);
    const url = haveAnAccount
      ? `${apiDomain}/api/login`
      : `${apiDomain}/api/register`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userDetails),
    };

    const response = await fetch(url, options);
    const data = await response.json();

    if (response.ok) {
      onSubmitSuccess(data.token);
    } else {
      onSubmitFailure(data.error_msg);
    }
  };

  const renderPasswordField = () => (
    <>
      <label className="input-label" htmlFor="password">
        PASSWORD
      </label>
      <input
        type="password"
        id="password"
        className="password-input-field"
        value={password}
        onChange={onChangePassword}
        placeholder="Password"
      />
    </>
  );

  const renderUsernameField = () => (
    <>
      <label className="input-label" htmlFor="username">
        USERNAME
      </label>
      <input
        type="text"
        id="username"
        className="username-input-field"
        value={username}
        onChange={onChangeUsername}
        placeholder="Username"
      />
    </>
  );

  return (
    <div className="login-form-container">
      <form className="form-container" onSubmit={submitForm}>
        <div className="input-container">{renderUsernameField()}</div>
        <div className="input-container">{renderPasswordField()}</div>
        <button type="submit" className="login-button">
          {haveAnAccount ? "Login" : "Sign up"}
        </button>
        {showSubmitError && <p className="error-message">*{errorMsg}</p>}
        <p onClick={toggleAuthMode} className="account-login-signup-details">
          {haveAnAccount
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
