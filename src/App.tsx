import "./App.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BrowserRouter as Router, 
  Switch, 
  Route
} from "react-router-dom";
import Home from "./pages/Home/Home";
import FormSettings from "./pages/FormSettings/FormSettings";


function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/form-settings">
            <FormSettings />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

export default App;
