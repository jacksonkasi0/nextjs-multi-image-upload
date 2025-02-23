import React from "react";

const Background: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="absolute inset-0 -z-10 h-full w-full 
        bg-white dark:bg-gray-950 
        bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] 
        dark:bg-[radial-gradient(#4b5563_1px,transparent_1px)] 
        [background-size:16px_16px]"
    >
      {children && <div className="relative">{children}</div>}
    </div>
  );
};

export default Background;