import React from 'react';
import { CheckSquare, FileText, FolderKanban, Award, Users, ShieldAlert } from 'lucide-react';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentUserRole: UserRole;
  pendingTasksCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  currentUserRole,
  pendingTasksCount,
}) => {
  const isDirector = currentUserRole === 'director';

  const navItems = [
    {
      id: 'tareas',
      label: 'Tareas',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
    },
    {
      id: 'actas',
      label: 'Actas en Vivo',
      icon: FileText,
      badge: null,
    },
    {
      id: 'proyectos',
      label: 'Proyectos',
      icon: FolderKanban,
      badge: null,
    },
    {
      id: 'contratistas',
      label: 'Contratistas',
      icon: Award,
      badge: !isDirector ? 'Confidencial' : null,
    },
  ];

  if (isDirector) {
    navItems.push({
      id: 'usuarios',
      label: 'Usuarios',
      icon: Users,
      badge: null,
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 safe-area-pb shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-4 sm:grid-cols-5 gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                isActive
                  ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-800/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2px] text-cyan-400 scale-105' : 'stroke-[1.8px]'}`} />
                {item.badge && typeof item.badge === 'number' && (
                  <span className="absolute -top-1.5 -right-2.5 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full min-w-4 h-4 flex items-center justify-center shadow">
                    {item.badge}
                  </span>
                )}
                {item.badge === 'Confidencial' && (
                  <span className="absolute -top-1.5 -right-2 text-amber-400">
                    <ShieldAlert className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 truncate max-w-full font-medium ${isActive ? 'text-cyan-300 font-semibold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
