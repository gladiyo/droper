import React, { useState } from "react";
import { Card, Button, Alert } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useHistory } from "react-router-dom";
import CenteredContainer from "./CenteredContainer";

const Profile = () => {
  const [error, setError] = useState("");
  const { currentUser, logout } = useAuth();
  const history = useHistory();

  const handleLogout = async () => {
    setError("");
    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  }

  return (
    <div style={{ backgroundColor: "#004ce4" }}>
      <CenteredContainer>
        <Card className="bg-primary border border-light rounded">
          <Card.Body>
            <h2 className="text-center text-light mb-4">Profile</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <strong className="text-light">Email:</strong> {currentUser.email}
            <div className="bg-primary text-center border border-light w-100 mt-2 rounded">
              <Button variant="link" className="btn btn-info text-light w-100" onClick={handleLogout}>
                Log Out
              </Button>
            </div>
          </Card.Body>
        </Card>
      </CenteredContainer>
    </div>
  );
}

export default Profile;
