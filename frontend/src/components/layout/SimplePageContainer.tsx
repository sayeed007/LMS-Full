import Container from '@/components/ui/Container';
import React from 'react';

interface SimplePageContainerProps {
  children: React.ReactNode;

  // Layout customization
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  containerPadding?: 'none' | 'sm' | 'md' | 'lg';

  className?: string;
}

export default function SimplePageContainer({
  children,
  containerSize = 'xl',
  containerPadding = 'lg',
  className
}: SimplePageContainerProps) {
  return (
    <Container
      size={containerSize}
      padding={containerPadding}
      className={className}
    >
      <div className="space-y-6">
        {children}
      </div>
    </Container>
  );
}