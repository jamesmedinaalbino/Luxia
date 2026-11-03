import React from 'react';
import { ShieldCheck, UserCheck, Lock, ChevronDown, CheckCircle2 } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User;
  allUsers: User[];
  onSelectUser: (user: User) => void;
  activeTab: string;
  tasksCount: number;
  actasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  allUsers,
  onSelectUser,
  tasksCount,
  actasCount,
}) => {
  const isDirector = currentUser.role === 'director';

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'director':
        return {
          label: 'Director de Proyectos',
          bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        };
      case 'supervisor':
        return {
          label: 'Supervisor de Obra',
          bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
        };
      case 'ingeniero':
        return {
          label: 'Ingeniero Residente',
          bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
        };
      case 'tecnico':
      default:
        return {
          label: 'Técnico de Campo',
          bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <ShieldCheck className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg tracking-wider text-white">LUXIA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest bg-cyan-950 text-cyan-300 border border-cyan-800/60 px-1.5 py-0.5 rounded">
                OPS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Seguridad Electrónica & Telecomunicaciones
            </p>
          </div>
        </div>

        {/* User Switcher / Profile selector */}
        <div className="flex items-center gap-2">
          {/* Quick Counter Badges */}
          <div className="hidden md:flex items-center gap-2 mr-2">
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              <span className="text-slate-400">Tareas activas:</span>
              <span className="font-semibold text-white">{tasksCount}</span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span className="text-slate-400">Actas firmadas:</span>
              <span className="font-semibold text-white">{actasCount}</span>
            </div>
          </div>

          {/* User selector dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-850 border border-slate-800 rounded-xl p-1.5 pr-3 cursor-pointer transition shadow-sm">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-lg object-cover border border-slate-700"
              />
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate max-w-[110px] sm:max-w-[150px]">
                    {currentUser.name.split(' ')[0]} {currentUser.name.split(' ')[1] || ''}
                  </span>
                  {isDirector ? (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded flex items-center gap-0.5">
                      <UserCheck className="w-2.5 h-2.5" /> Dir
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-800 text-slate-400 px-1 rounded flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Campo
                    </span>
                  )}
                </div>
                <span className={`text-[10px] border px-1.5 py-0.2 rounded font-medium inline-block ${roleInfo.bg}`}>
                  {roleInfo.label}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </div>

            {/* Dropdown menu to switch role/user */}
            <div className="absolute right-0 mt-1 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block z-50 animate-fade-in">
              <div className="px-2 py-1.5 border-b border-slate-800 mb-1">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Cambiar Perfil de Usuario
                </p>
                <p className="text-[11px] text-slate-500">
                  Prueba la app como Director, Supervisor o Técnico
                </p>
              </div>

              <div className="space-y-1">
                {allUsers.map((u) => {
                  const isSelected = u.id === currentUser.id;
                  const uRole = getRoleBadge(u.role);
                  return (
                    <button
                      key={u.id}
                      onClick={() => onSelectUser(u)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left transition ${
                        isSelected
                          ? 'bg-cyan-500/15 border border-cyan-500/30'
                          : 'hover:bg-slate-800/70 border border-transparent'
                      }`}
                    >
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-7 h-7 rounded-md object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {uRole.label}
                        </p>
                      </div>
                      {u.role === 'director' && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.5 rounded font-mono">
                          ADMIN
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
