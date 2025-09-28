import { render, screen } from '@testing-library/react';
import App from './App';

test('renders authentication screen when not signed in', () => {
  render(<App />);
  expect(
    screen.getByRole('heading', { name: /little stars routine builder/i })
  ).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
});
