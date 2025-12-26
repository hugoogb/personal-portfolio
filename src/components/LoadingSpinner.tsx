import { useContext } from 'react';
import { ColorContext } from "@/contexts/color.context";

export function LoadingSpinner() {
  const { color } = useContext(ColorContext);
  
  return (
    <div className="flex items-center justify-center p-8">
      <div 
        className="w-12 h-12 border-4 border-muted/20 border-t-primary rounded-full animate-spin"
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
}
