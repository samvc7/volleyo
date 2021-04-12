import "./App.scss";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/container";
import Col from "react-bootstrap/col";
import Row from "react-bootstrap/row";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <div className="App">
      <main className="main">
        <Container className="container">
          <Row>
            <Col>
              <div className="start-text">
                <h1>Volleyo</h1>
                <h2>A web app to track a volleyball game.</h2>
                <Button className="start-button" size="lg">Start</Button>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}

export default App;
