import { useState, ReactNode } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 selection:bg-zinc-900 selection:text-white">
      <Header 
        isSidebarOpen={isSidebarOpen} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          searchQuery={searchQuery}
        />
        
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="container mx-auto px-6 py-12 lg:px-16 lg:py-20 max-w-5xl">
            {children}
            
            <footer className="mt-32 pt-12 border-t border-zinc-200">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-zinc-900 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-[10px]">S</span>
                    </div>
                    <span className="font-bold text-sm tracking-tight">Streamyy</span>
                  </div>
                  <p className="text-xs text-zinc-400">© 2026 Streamyy Infrastructure. All rights reserved.</p>
                </div>
                
                <div className="flex flex-wrap justify-center gap-x-8 gap-y-4">
                  <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Privacy</a>
                  <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Terms</a>
                  <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">License</a>
                  <a href="#" className="text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Security</a>
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
