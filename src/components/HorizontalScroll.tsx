import { ReactNode, useRef } from 'react';

export default function HorizontalScroll({ children }: { children: ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div 
        ref={scrollRef} 
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700 scrollbar-track-transparent pb-2 scroll-smooth w-full"
        style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}


