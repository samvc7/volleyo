import React, { useState } from "react";
import "./Home.scss";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/container";
import Col from "react-bootstrap/col";
import Row from "react-bootstrap/row";
import { Redirect } from "react-router-dom";

const Home: React.FC = () => {
  const [redirect, setRedirect] = useState(false);

  return (
    <main className="main" data-testid="Home">
      {redirect ? <Redirect to="/form-settings" /> :
      <Container className="container">
        <Row>
          <Col>
            <div className="start-text">
              <h1>Volleyo</h1>
              <h2>A web app to track a volleyball game.</h2>
              <Button onClick={() => setRedirect(true)} className="start-button" size="lg">
                Start
              </Button>
            </div>
          </Col>
        </Row>
      </Container>}
    </main>
  );
};

export default Home;
