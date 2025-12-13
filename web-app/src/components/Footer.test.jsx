import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer Component', () => {
  it('should render copyright text', () => {
    render(<Footer />);
    expect(screen.getByText(/© 2024 ElectroShop/i)).toBeInTheDocument();
  });
});
