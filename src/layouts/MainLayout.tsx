import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const mainRef = useRef<HTMLElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const mainElement = mainRef.current;

    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: 'smooth' });
    }

    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-zinc-50 selection:bg-zinc-900 selection:text-white">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          searchQuery={searchQuery}
        />
        
        <main ref={mainRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-20 max-w-5xl">
            {children}
            
            <footer className="mt-32 pt-12 border-t border-zinc-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight">Streamyy</span>
                  </div>
                  <p className="text-xs text-zinc-400">© 2026 Streamyy. All rights reserved.</p>
                </div>
                
              </div>
            </footer>
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-zinc-900/20 backdrop-blur-sm z-30 lg:hidden transition-all duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}