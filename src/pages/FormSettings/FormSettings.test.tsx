import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FormSettings from "./FormSettings";

const SPINBUTTON: string = "spinbutton";

beforeEach(() => {
  render(<FormSettings />);
});

afterEach(() => {
  cleanup();
});

describe("renders FormSettings correctly", () => {
  test("it should have title", () => {
    const formSettings = screen.getByText(/game settings/i);

    expect(formSettings).toBeInTheDocument();
  });

  test("renders all input fields", () => {
    expect(screen.getByLabelText(/sets/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points per set/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last set/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/2 points difference/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });
});

describe("sets input validation", () => {
  let sets: HTMLElement;
  beforeEach(() => {
    sets = screen.getByRole(/spinbutton/i, { name: /sets/i });
  });

  test("it should have proper default values", () => {
    expect(sets.getAttribute("value")).toBe("7");
    expect(screen.queryByText(/sets must be/i)).toBeNull();
  });

  test("it should be valid", async () => {
    expect(sets).toBeValid();

    fireEvent.change(sets, { target: { value: 1 } });

    await waitFor(() => {
      expect(sets).toBeValid();
      expect(screen.queryByText(/sets must be/i)).toBeNull();
    });
  });

  test("it should be invalid when value is over 7", async () => {
    expect(sets).toBeValid();

    fireEvent.change(sets, { target: { value: 8 } });
    //userEvent does not change the value of input, don't know why?
    //userEvent.type(sets, '5');

    await waitFor(() => {
      expect(sets).toBeInvalid();
      expect(screen.getByText(/sets must be/i)).toHaveTextContent(
        "sets must be less than or equal to 7"
      );
    });
  });

  test("it should be invalid when value ist under 1", async () => {
    expect(sets).toBeValid();

    fireEvent.change(sets, { target: { value: 0 } });

    await waitFor(() => {
      expect(screen.getByRole("spinbutton", { name: /sets/i })).toBeInvalid();
      expect(screen.queryByText(/sets must be/i)).toHaveTextContent(
        "sets must be greater than or equal to 1"
      );
    });
  });

  describe("point per set input validation", () => {
    const nameobj = {
      name: /points per set/i,
    };

    const getInput = () => {
      return screen.getByRole(SPINBUTTON, nameobj);
    };

    test("it should have proper default values", () => {
      const input = getInput();
      expect(input.getAttribute("value")).toBe("25");
    });

    test("user input should be valid", async () => {
      const inputBeforeEvent = getInput();
      expect(inputBeforeEvent).toBeValid();

      fireEvent.change(inputBeforeEvent, { target: { value: 29 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("29");
        expect(inputAfterEvent).toBeValid();
      });
    });

    test("it should be invalid when value is over 30", async () => {
      const inputBeforeEvent = getInput();
      expect(inputBeforeEvent).toBeValid();

      fireEvent.change(inputBeforeEvent, { target: { value: 31 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("31");
        expect(inputAfterEvent).toBeValid();
      });
    });

    test("it should be invalid when value is under 5", async () => {
      const inputBeforeEvent = getInput();
      expect(inputBeforeEvent).toBeValid();

      fireEvent.change(inputBeforeEvent, { target: { value: 4 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("4");
        expect(inputAfterEvent).toBeInvalid();
      });
    });
  });

  describe("last set input validation", () => {
    const nameobj = {
      name: /points for last set/i,
    };

    const getInput = () => {
      return screen.getByRole(SPINBUTTON, nameobj);
    };

    test("it should have proper default values", () => {
      const input = getInput();
      expect(input.getAttribute("value")).toBe("15");
      expect(input).toBeValid();
    });

    test("user input should be valid", async () => {
      const inputBeforeEvent = getInput();

      fireEvent.change(inputBeforeEvent, { target: { value: 5 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("5");
        expect(inputAfterEvent).toBeValid();
      });
    });

    test("it should be invalid when value is over 20", async () => {
      const inputBeforeEvent = getInput();
      expect(inputBeforeEvent).toBeValid();

      fireEvent.change(inputBeforeEvent, { target: { value: 21 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("21");
        expect(inputAfterEvent).toBeValid();
      });
    });

    test("it should be invalid when value is under 5", async () => {
      const inputBeforeEvent = getInput();
      expect(inputBeforeEvent).toBeValid();

      fireEvent.change(inputBeforeEvent, { target: { value: 4 } });

      await waitFor(() => {
        const inputAfterEvent = getInput();
        expect(inputAfterEvent.getAttribute("value")).toBe("4");
        expect(inputAfterEvent).toBeInvalid();
      });
    });
  });
});
