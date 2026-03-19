import { Link, useLocation } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Book, 
  Package, 
  Database, 
  Download, 
  Server, 
  Layers, 
  Monitor, 
  GitBranch,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { DOCS } from '../docs';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getIcon = (id: string) => {
  switch (id) {
    case 'introduction': return <Book className="w-4 h-4" />;
    case 'packages': return <Package className="w-4 h-4" />;
    case 'persistence': return <Database className="w-4 h-4" />;
    case 'install': return <Download className="w-4 h-4" />;
    case 'backend-usage': return <Server className="w-4 h-4" />;
    case 'adapters': return <Layers className="w-4 h-4" />;
    case 'frameworks': return <GitBranch className="w-4 h-4" />;
    case 'http-api': return <ExternalLink className="w-4 h-4" />;
    case 'frontend-usage': return <Monitor className="w-4 h-4" />;
    case 'flow': return <ChevronRight className="w-4 h-4" />;
    default: return <ChevronRight className="w-4 h-4" />;
  }
};

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
}

export function Sidebar({ isOpen, onClose, searchQuery }: SidebarProps) {
  const location = useLocation();
  const currentPath = location.pathname === '/' ? 'introduction' : location.pathname.replace('/', '');

  const filteredDocs = DOCS.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200 bg-white/80 backdrop-blur-xl transition-all duration-300 lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="h-full overflow-y-auto px-6 py-8">
        <div className="mb-8 px-2">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Documentation</h4>
          <nav className="space-y-1">
            {filteredDocs.map((doc) => (
              <Link
                key={doc.id}
                to={doc.id === 'introduction' ? '/' : `/${doc.id}`}
                onClick={onClose}
                className={cn(
                  "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  currentPath === doc.id 
                    ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200/50" 
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                <span className={cn(
                  "transition-colors duration-200",
                  currentPath === doc.id ? "text-white" : "text-zinc-400 group-hover:text-zinc-900"
                )}>
                  {getIcon(doc.id)}
                </span>
                {doc.title}
              </Link>
            ))}
            {filteredDocs.length === 0 && (
              <p className="px-3 py-4 text-xs text-zinc-400 italic">No matches found</p>
            )}
          </nav>
        </div>

        <div className="pt-8 border-t border-zinc-100 px-2">
          <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4">Resources</h4>
          <div className="space-y-1">
            <a href="#" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all group">
              Changelog 
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all group">
              Community 
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a href="#" className="flex items-center justify-between px-3 py-2.5 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all group">
              Support 
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
