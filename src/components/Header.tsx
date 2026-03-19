import { Search, Github, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ isSidebarOpen, onToggleSidebar, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/70 backdrop-blur-xl">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={onToggleSidebar}
            className="p-2 hover:bg-zinc-100 rounded-xl lg:hidden transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col -space-y-1">
              <span className="font-bold text-lg tracking-tight text-zinc-900">Streamyy</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:relative md:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
            <input 
              type="text" 
              placeholder="Search docs..."
              className="pl-11 pr-4 py-2 bg-zinc-100 border border-transparent focus:bg-white focus:border-zinc-200 rounded-xl text-sm w-64 transition-all outline-none"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-zinc-200 bg-white text-[10px] font-bold text-zinc-400 tracking-widest pointer-events-none">
              ⌘K
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://github.com/Haryomidey/streamyy" 
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="View the Streamyy GitHub repository"
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/Haryomidey/streamyy"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:block px-4 py-2 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200/50 active:scale-95"
            >
              View Repository
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}