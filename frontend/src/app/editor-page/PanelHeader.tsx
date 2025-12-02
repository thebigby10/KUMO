const PanelHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`flex items-center justify-between px-4 py-2 bg-[#333333] border-b border-[#4a4a4a] ${className}`}>
    {children}
  </div>
);

export default PanelHeader;