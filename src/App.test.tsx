import { render, screen } from '@testing-library/react';
import App from './App';

test('renders start button', () => {
  render(<App />);
  const button = screen.getByText(/start/i);
  expect(button).toBeInTheDocument();
});
