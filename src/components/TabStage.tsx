import React from 'react';

interface TabStageProps {
  active: string;
  direction: number;
  children: React.ReactNode;
}

export const TabStage: React.FC<TabStageProps> = ({ direction, children }) => {
  return (
    <div className="tab-stage" data-direction={direction < 0 ? 'back' : 'forward'}>
      {children}
    </div>
  );
};
