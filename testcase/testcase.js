import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/CoreRec/i)).toBeInTheDocument();
  });

  test('toggles dark mode', () => {
    render(<App />);

    const switchElement = screen.getByLabelText(/Dark Mode/i);
    act(() => {
      fireEvent.click(switchElement);
    });

    expect(switchElement).toBeChecked();
  });
});