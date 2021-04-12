import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FormSettings from './FormSettings';

describe('<FormSettings />', () => {
  test('it should mount', () => {
    render(<FormSettings />);
    
    const formSettings = screen.getByTestId('FormSettings');

    expect(formSettings).toBeInTheDocument();
  });
});