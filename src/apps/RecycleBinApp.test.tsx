import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RecycleBinApp } from './RecycleBinApp';

describe('RecycleBinApp', () => {
  it('renders the joke "abandoned side-projects" contents', () => {
    render(<RecycleBinApp />);
    expect(screen.getByText(/abandoned/i)).toBeInTheDocument();
  });
});
