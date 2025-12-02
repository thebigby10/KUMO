const PanelContainer = ({ 
  children, 
  className = "", 
  style = {} 
}: { 
  children: React.ReactNode; 
  className?: string; 
  style?: React.CSSProperties; 
}) => (
  <div 
    className={`flex flex-col overflow-hidden bg-[#262626] border border-[#4a4a4a] rounded-lg ${className}`}
    style={style}
  >
    {children}
  </div>
);

export default PanelContainer;