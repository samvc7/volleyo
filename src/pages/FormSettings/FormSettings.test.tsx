import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import FormSettings from "./FormSettings";

beforeEach(() => {
  render(<FormSettings />);
});

afterEach(() => {
  cleanup;
});

describe('renders FormSettings correctly', () => {
  test('it should have title', () => {
    const formSettings = screen.getByText(/game settings/i);

    expect(formSettings).toBeInTheDocument();
  });

  test('renders all input fields', () => {
    expect(screen.getByLabelText(/sets/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/points per set/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last set/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });
});

describe("sets input logic", () => {
  let sets: HTMLElement, error: HTMLElement;
  beforeEach(() => {
    sets = screen.getByRole(/spinbutton/i, { name: /sets/i});
    error = screen.getByTestId(/sets-error/i);
  })

  test('it should have proper default values', () => {
    expect(sets.getAttribute('value')).toBe('7');
    expect(error).toHaveTextContent('');
  });

  test("it should be valid", async () => {
    expect(sets).toBeValid();
    
    fireEvent.change(sets, { target: { value: 1 }})

    await waitFor(() => {
      expect(sets).toBeValid();
      expect(error).toHaveTextContent('');
    });
  });

  test("it should be invalid when value is over 7", async () => {
    expect(sets).toBeValid();

    fireEvent.change(sets, { target: { value: 8 }})
    //userEvent does not change the value of input, don't know why?
    //userEvent.type(sets, '5');

    await waitFor(() => {
      expect(sets).toBeInvalid();
      expect(error).toHaveTextContent('sets must be less than or equal to 7');
    })
  });

  test("it should be invalid when value ist under 1", async () => {
    expect(sets).toBeValid();

    fireEvent.change(sets, { target: { value: 0 }})

    await waitFor(() => {
      expect(sets).toBeInvalid();
      expect(error).toHaveTextContent('sets must be greater than or equal to 1')
    });
  });
});
