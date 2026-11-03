import React, { useState } from 'react';
import {
  Users,
  Plus,
  ShieldCheck,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Award,
  Lock,
  X,
  FileCheck2,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import { User, UserRole } from '../types';

interface UserManagerProps {
  users: User[];
  currentUser: User;
  onAddUser: (user: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onResetData: () => void;
}

export const UserManager: React.FC<UserManagerProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onResetData,
}) => {
  const isDirector = currentUser.role === 'director';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [role, setRole] = useState<UserRole>('tecnico');
  const [specialty, setSpecialty] = useState('');

  if (!isDirector) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
        <Lock className="w-8 h-8 text-amber-400 mx-auto" />
        <h3 className="text-base font-bold text-white">Módulo Restringido</h3>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          La gestión y creación de usuarios es exclusiva para el Director de Proyectos de LUXIA.
        </p>
      </div>
    );
  }

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    onAddUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || '+57 300 000 0000',
      documentId: documentId.trim() || 'CC 1.000.000.000',
      role,
      specialty: specialty.trim() || 'Sistemas de Seguridad Electrónica',
      active: true,
      avatar: `https://images.unsplash.com/photo-${role === 'tecnico' ? '1500648767791-00dcc994a43e' : '1507003211169-0a1dd7228f2d'}?w=150&auto=format&fit=crop&q=80`,
    });

    setIsModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setSpecialty('');
    setDocumentId('');
  };

  const handleToggleActive = (user: User) => {
    if (user.id === currentUser.id) return; // don't disable self
    onUpdateUser({
      ...user,
      active: !user.active,
    });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-base font-bold text-white">
              Gestión de Personal & Roles LUXIA
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Administración de Técnicos de Campo, Supervisores de Obra e Ingenieros Residentes
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Usuario</span>
          </button>
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {users.map((u) => {
          const isCurrentUser = u.id === currentUser.id;
          return (
            <div
              key={u.id}
              className={`bg-slate-900 border rounded-2xl p-4 transition shadow-md space-y-3 ${
                u.active ? 'border-slate-800' : 'border-red-900/40 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{u.name}</h3>
                      {isCurrentUser && (
                        <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded font-semibold">
                          TÚ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                      {u.role.toUpperCase()} LUXIA
                    </span>
                    <p className="text-[11px] text-slate-400">{u.documentId}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleActive(u)}
                  disabled={isCurrentUser}
                  className={`text-[10px] px-2 py-1 rounded-lg border font-semibold transition ${
                    u.active
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-red-500/10 hover:text-red-400'
                      : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                  }`}
                >
                  {u.active ? 'ACTIVO' : 'INACTIVO'}
                </button>
              </div>

              <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1 text-slate-300">
                <p className="text-[11px] text-slate-400 font-medium">
                  <strong>Especialidad:</strong> {u.specialty || 'Técnico de Seguridad Electrónica'}
                </p>
                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-cyan-400" />
                    {u.email}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {u.phone}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Database Maintenance and Reset Box */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-slate-400" />
          <span>Almacenamiento local seguro persistente en navegador</span>
        </div>
        <button
          type="button"
          onClick={onResetData}
          className="flex items-center gap-1 text-slate-400 hover:text-cyan-400 transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Restablecer Datos de Demostración</span>
        </button>
      </div>

      {/* MODAL: Crear Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Registrar Nuevo Colaborador LUXIA
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ing. Andrés Beltrán"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Rol Operativo *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    <option value="tecnico">Técnico de Campo</option>
                    <option value="supervisor">Supervisor de Obra</option>
                    <option value="ingeniero">Ingeniero Residente</option>
                    <option value="director">Director de Proyectos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cédula / Documento</label>
                  <input
                    type="text"
                    placeholder="CC 1.020.999.888"
                    value={documentId}
                    onChange={(e) => setDocumentId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="nombre@luxiaseguridad.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Teléfono Móvil</label>
                  <input
                    type="text"
                    placeholder="+57 310 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Especialidad Técnica</label>
                <input
                  type="text"
                  placeholder="Ej. CCTV IP Darkfighter, Detección Incendio Notifier, Biometría ZKTeco"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold"
                >
                  Crear Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
