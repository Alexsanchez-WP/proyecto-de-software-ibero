import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('should render children', () => {
    render(
      <Card>
        <div>Test Content</div>
      </Card>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Card className="custom-class">
        <div>Content</div>
      </Card>
    );
    expect(container.firstChild).toHaveClass('card custom-class');
  });
});
