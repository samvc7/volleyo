import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import InputGroup from './InputGroup';
import userEvent from '@testing-library/user-event';

const onChange = jest.fn()

describe('valid InputGroup', () => {
  let inputGroup: HTMLElement;
  beforeEach(() => {
    render(
      <InputGroup 
        label="label"
        type="number"
        name="name"
        value="4"
        onChange={onChange}
        mdSize="3"
      />
    );
    inputGroup = screen.getByLabelText('label');
  })

  test('it should render with label', () => {
    expect(inputGroup).toBeInTheDocument();
    expect(inputGroup).toBeValid();
  });

  test('it should call onChange 2 times', () => {
    expect(onChange).toHaveBeenCalledTimes(0);
    userEvent.type(inputGroup, '25');
    expect(onChange).toHaveBeenCalledTimes(2);
  })
});

describe('invalid InputGroup', () => {
  beforeEach(() => {
    render(
      <InputGroup 
        label="label"
        type="number"
        name="name"
        value="4"
        onChange={onChange}
        isInvalid={true}
        ariaInvalid={true}
        error="error message"
        mdSize="3"
      />
    );
  })

  test('it should render error message', () => {
    const error = screen.getByText('error message');
    expect(error).toBeInTheDocument();
  })

  test('input should be invalid', () => {
    const input = screen.getByLabelText('label');
    
    expect(input).toBeInvalid();
  });
});