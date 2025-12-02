const ResizeHandle = ({ 
  onMouseDown, 
  direction, 
  className = "" 
}: { 
  onMouseDown: (e: React.MouseEvent) => void; 
  direction: "horizontal" | "vertical"; 
  className?: string; 
}) => {
  const baseClasses = direction === "horizontal" 
    ? "w-1 cursor-ew-resize hover:bg-gray-700" 
    : "h-2 -my-3 z-10 cursor-ns-resize flex items-center justify-center group";

  return (
    <div
      onMouseDown={onMouseDown}
      className={`${baseClasses} transition-colors rounded opacity-0 hover:opacity-100 ${className}`}
      style={{ touchAction: "none" }}
    >
      {direction === "vertical" && (
        <div className="w-12 h-1 transition-opacity bg-gray-600 rounded-full opacity-0 group-hover:opacity-100" />
      )}
    </div>
  );
};


export default ResizeHandle;