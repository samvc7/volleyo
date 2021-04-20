import "@testing-library/jest-dom/extend-expect";
import Home from "./Home";
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { shallow, ShallowWrapper } from "enzyme";
import { BrowserRouter, Route, Switch } from "react-router-dom";

describe("Home Component (with ezyme)", () => {
  let wrapper: ShallowWrapper;
  beforeEach(() => 
    wrapper = shallow(<Home />)
  );

  test("start button should render", () => {
    const button: ShallowWrapper = wrapper.find(".start-button");
    expect(button.length).toBe(1);
  });

  test("click on start button renders redirect with proper to attribute", () => {
    const button = wrapper.find(".start-button")
    button.simulate('click');    
    expect(wrapper.find(`Redirect[to="/form-settings"]`).length).toBe(1);    
  });

});

describe("Home Component (with react-testing-library)", () =>{
  beforeEach(() => {
    render(
      <BrowserRouter>
        <Home />
        <Switch>
          <Route path="/form-settings">Form Settings</Route>
        </Switch>
      </BrowserRouter>
    );
  });

  afterEach(() => {
    cleanup();
  });

  test("start button should render", () => {
    expect(screen.getByText("Start")).toBeTruthy();
    
  });

  test("click on start button render redirect with proper to attribute", () => {
    const button = screen.getByText("Start");
    fireEvent.click(button);
    expect(screen.getByText(/form/i)).toBeTruthy();
  })

});
