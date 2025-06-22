import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'colored' | 'stats' | 'navigation';
  hoverable?: boolean;
  onClick?: () => void;
  href?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  hoverable = false,
  onClick,
  href,
}) => {
  const variants = {
    default: 'card-glass',
    colored: 'card-glass',
    stats: 'card-stats',
    navigation: 'card-navigation',
  };

  const hoverClasses = hoverable ? 'cursor-pointer' : '';

  const finalClasses = `${variants[variant]} ${hoverClasses} ${className}`;

  // Si tiene href, renderizar como Link
  if (href) {
    return (
      <a href={href} className={finalClasses} onClick={onClick}>
        {children}
      </a>
    );
  }

  // Si tiene onClick, renderizar como button
  if (onClick) {
    return (
      <button className={finalClasses} onClick={onClick}>
        {children}
      </button>
    );
  }

  // Renderizar como div normal
  return <div className={finalClasses}>{children}</div>;
};

export default Card;
