import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
// import axios from 'axios';
import axios from 'axios';

// Mock axios
jest.mock('axios');

describe('App Component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValueOnce({
      data: {
        labels: ['Label1', 'Label2'],
        models: [
          { label: 'Model1', value: 'model1' },
          { label: 'Model2', value: 'model2' },
        ],
      },
    });
  });

  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/CoreRec/i)).toBeInTheDocument();
  });

  test('fetches and displays labels and models', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Select model/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Select node label/i)).toBeInTheDocument();
    });

    fireEvent.mouseDown(screen.getByLabelText(/Select model/i));
    expect(screen.getByText(/Model1/i)).toBeInTheDocument();
    expect(screen.getByText(/Model2/i)).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByLabelText(/Select node label/i));
    expect(screen.getByText(/Label1/i)).toBeInTheDocument();
    expect(screen.getByText(/Label2/i)).toBeInTheDocument();
  });

  test('displays error message if model or label is not selected', async () => {
    render(<App />);

    fireEvent.click(screen.getByText(/Run Model/i));

    await waitFor(() => {
      expect(screen.getByText(/Please select both a model and a label before running the model./i)).toBeInTheDocument();
    });
  });

  test('runs model and displays recommendations', async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        recommendations: ['Node1', 'Node2'],
      },
    });

    render(<App />);

    // Select model and label
    fireEvent.mouseDown(screen.getByLabelText(/Select model/i));
    fireEvent.click(screen.getByText(/Model1/i));

    fireEvent.mouseDown(screen.getByLabelText(/Select node label/i));
    fireEvent.click(screen.getByText(/Label1/i));

    fireEvent.click(screen.getByText(/Run Model/i));

    await waitFor(() => {
      expect(screen.getByText(/Node1/i)).toBeInTheDocument();
      expect(screen.getByText(/Node2/i)).toBeInTheDocument();
    });
  });

  test('toggles dark mode', () => {
    render(<App />);

    const switchElement = screen.getByLabelText(/Dark Mode/i);
    fireEvent.click(switchElement);

    expect(switchElement).toBeChecked();
  });
});