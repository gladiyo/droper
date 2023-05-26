import React, { useRef, useState } from "react";
import { Form, Card, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useHistory } from "react-router-dom";
import CenteredContainer from "./CenteredContainer";


const Login = () => {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const history = useHistory();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      history.push("/");
    } catch {
      setError("Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <CenteredContainer>
        <Card>
          <Card.Body className="login-page">
            <h2 className="logo-title">Login</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email">
                <Form.Control className="main-input" type="email" placeholder="Your Email" ref={emailRef} required />
              </Form.Group>
              <Form.Group id="password">
                <Form.Control className="main-input" type="password" placeholder="Password" ref={passwordRef} required />
              </Form.Group>
              <button disabled={loading} className="login-btn main-btn" type="submit">Login</button>
            </Form>
            <div className="text-center text-light w-100 mt-2">
              <Link to="/signup" style={{ color: "#fff" }}>Sign Up</Link>
            </div>
          </Card.Body>
        </Card>
      </CenteredContainer>
    </div>
  );
};

export default Login;
