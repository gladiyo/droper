import React from "react";
import { Container } from "react-bootstrap";

const CenteredContainer = ({ children }) => (
  <Container className="CenteredContainer">
    <div className="center-inner">{children}</div>
  </Container>
);

export default CenteredContainer;
