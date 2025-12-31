import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import App from '../src/App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/TODO アプリ/i)).toBeDefined();
  });
});
