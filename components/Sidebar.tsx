import React from 'react';
import { LayoutDashboard, PenTool, LogOut, User, ChevronRight } from 'lucide-react';

interface SidebarProps {
  currentView: 'form' | 'admin';
  onChangeView: (view: 'form' | 'admin') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
  username: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  onChangeView, 
  isAuthenticated, 
  onLogout,
  username 
}) => {
  
  const NavItem = ({ view, icon: Icon, label }: { view: 'form' | 'admin', icon: any, label: string }) => {
    const isActive = currentView === view;
    return (
      <button
        onClick={() => onChangeView(view)}
        className={`group relative w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium transition-all duration-300 rounded-xl mx-2 my-1 w-[calc(100%-1rem)] ${
          isActive 
            ? 'bg-agro-800 text-white shadow-lg shadow-agro-900/20' 
            : 'text-agro-200 hover:bg-agro-800/30 hover:text-white'
        }`}
      >
        <Icon size={20} className={`transition-colors duration-300 ${isActive ? 'text-agro-400' : 'text-agro-400/70 group-hover:text-agro-400'}`} />
        <span>{label}</span>
        {isActive && <ChevronRight size={16} className="ml-auto text-agro-400" />}
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-72 bg-agro-950 text-white h-screen fixed left-0 top-0 shadow-2xl z-50 border-r border-agro-900">
      {/* Brand */}
      <div className="p-8 pb-6">
        <div className="flex items-center gap-3.5">
          <div className="bg-white p-2 rounded-xl shadow-lg">
             <img
               src="/gcf_logo_01_(1).png"
               alt="GCF Logo"
               className="w-10 h-10 object-contain"
             />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-tight text-white">Gestão Safra</h1>
            <p className="text-[10px] text-agro-400 font-bold tracking-widest uppercase mt-0.5">Sistema de Controle</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-2 space-y-1">
        <div className="px-4 mb-4">
            <p className="text-[11px] font-bold text-agro-500 uppercase tracking-widest opacity-80">Navegação Principal</p>
        </div>
        <NavItem view="form" icon={PenTool} label="Nova Visita" />
        <NavItem view="admin" icon={LayoutDashboard} label="Painel Administrativo" />
      </nav>

      {/* User Footer */}
      <div className="p-4 mx-2 mb-2 bg-agro-900/50 rounded-2xl border border-agro-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-agro-800 flex items-center justify-center text-agro-200 border border-agro-700 shadow-inner">
                <User size={20} />
            </div>
            <div className="overflow-hidden">
                <p className="text-sm font-bold truncate text-white">{username}</p>
                <p className="text-xs text-agro-400 truncate">
                    {isAuthenticated && currentView === 'admin' ? 'Administrador' : 'Colaborador'}
                </p>
            </div>
        </div>
        
        {isAuthenticated && currentView === 'admin' && (
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 py-2.5 rounded-lg text-xs font-bold transition-all border border-red-500/10 hover:border-red-500/30 uppercase tracking-wide"
            >
                <LogOut size={14} />
                Sair
            </button>
        )}
      </div>
    </aside>
  );
};