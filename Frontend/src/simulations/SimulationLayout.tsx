import React from 'react';

interface SimulationLayoutProps {
  children: React.ReactNode;
  className?: string;
  isDashboard?: boolean; // New prop for full-screen dashboards
}

export const SimulationLayout: React.FC<SimulationLayoutProps> = ({ children, className = "", isDashboard = false }) => {
  if (isDashboard) {
    return (
      <div className={`h-full overflow-hidden bg-[#020617] ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <div className={`h-full overflow-y-auto p-4 md:p-8 space-y-12 bg-[#020617] ${className}`}>
      {React.Children.map(children, (child) => (
        <section className="max-w-7xl mx-auto w-full">
          {child}
        </section>
      ))}
    </div>
  );
};

export default SimulationLayout;
