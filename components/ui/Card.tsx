import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200 ${props.onClick ? 'cursor-pointer hover:border-primary-300 hover:shadow-md' : ''} ${className}`} 
      {...props}
    >
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  );
};

export default Card;