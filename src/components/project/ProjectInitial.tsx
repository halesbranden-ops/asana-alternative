import React from 'react';

interface ProjectInitialProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export const ProjectInitial: React.FC<ProjectInitialProps> = ({ name, color, size = 32, className = '' }) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const fontSize = Math.round(size * 0.42);

  return (
    <div
      className={`rounded-lg flex items-center justify-center font-bold flex-shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color + '22',
        border: `1.5px solid ${color}`,
        color: color,
        fontSize,
        lineHeight: 1,
      }}
    >
      {letter}
    </div>
  );
};
