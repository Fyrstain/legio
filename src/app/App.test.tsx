import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

jest.mock('i18next-http-backend', () => ({
  __esModule: true,
  default: {
    type: 'backend',
    init: () => undefined,
    read: (_language: string, _namespace: string, callback: (error: null, data: object) => void) =>
      callback(null, {}),
  },
}));

test('renders the home page', async () => {
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>
  );

  expect(await screen.findByRole('img', { name: 'Home_image' })).toBeInTheDocument();
});
