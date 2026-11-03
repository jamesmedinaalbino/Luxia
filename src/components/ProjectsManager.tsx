import React, { useState } from 'react';
import {
  FolderKanban,
  Plus,
  Building2,
  Calendar,
  CheckCircle2,
  MapPin,
  Users,
  Award,
  X,
  Layers
} from 'lucide-react';
import { Project, ProjectStatus, Contractor, User, Task, TechnicalActa } from '../types';

interface ProjectsManagerProps {
  projects: Project[];
  contractors: Contractor[];
  supervisors: User[];
  tasks: Task[];
  actas: TechnicalActa[];
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onSelectProjectForTasks?: (projectId: string) => void;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  contractors,
  supervisors,
  tasks,
  actas,
  onAddProject,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientContact, setClientContact] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('Bogotá D.C.');
  const [supervisorId, setSupervisorId] = useState(supervisors[0]?.id || '');
  const [contractorId, setContractorId] = useState(contractors[0]?.id || '');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [estimatedEndDate, setEstimatedEndDate] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );
  const [systemTypes, setSystemTypes] = useState<string[]>(['CCTV IP', 'Control de Acceso']);

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'activo':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'en_pausa':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'entregado':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'en_garantia':
        return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
    }
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !clientName.trim()) return;

    const sup = supervisors.find((s) => s.id === supervisorId);
    const cont = contractors.find((c) => c.id === contractorId);
    const nextCode = `PRJ-LUX-${String(projects.length + 1).padStart(3, '0')}`;

    onAddProject({
      code: nextCode,
      name: name.trim(),
      clientName: clientName.trim(),
      clientContact: clientContact.trim(),
      clientPhone: clientPhone.trim(),
      location: location.trim(),
      city,
      status: 'activo',
      supervisorId,
      supervisorName: sup ? sup.name : 'Supervisor LUXIA',
      contractorId,
      contractorName: cont ? cont.name : 'Contratista Asignado',
      startDate,
      estimatedEndDate,
      progressPercent: 10,
      systemTypes,
    });

    setIsModalOpen(false);
    setName('');
    setClientName('');
    setLocation('');
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
        <div>
          <h1 className="text-base font-bold text-white flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-cyan-400" />
            Portafolio de Proyectos de Seguridad Electrónica
          </h1>
          <p className="text-xs text-slate-400">
            Control de frentes de obra, supervisión, contratistas y avance general
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proyecto</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {projects.map((proj) => {
          const projectTasks = tasks.filter((t) => t.projectId === proj.id);
          const projectActas = actas.filter((a) => a.projectId === proj.id);
          const completedTasks = projectTasks.filter((t) => t.status === 'completada').length;

          return (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition shadow-md space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-cyan-300 font-bold bg-slate-950 border border-cyan-800/40 px-2 py-0.5 rounded">
                      {proj.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadge(proj.status)}`}>
                      {proj.status.toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                    {proj.name}
                  </h3>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Avance de Obra</span>
                  <span className="font-bold text-cyan-400">{proj.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-500"
                    style={{ width: `${proj.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Metadata */}
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 text-xs space-y-1.5 text-slate-300">
                <p className="flex items-center gap-1.5 truncate">
                  <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span><strong>Cliente:</strong> {proj.clientName}</span>
                </p>
                <p className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  <span>{proj.location} - {proj.city}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Supervisor a cargo:</span>
                    <span className="font-semibold text-slate-200">{proj.supervisorName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contratista asignado:</span>
                    <span className="font-semibold text-amber-300 truncate block">
                      {proj.contractorName || 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Systems & Stats */}
              <div className="flex items-center justify-between text-[11px] pt-1">
                <div className="flex flex-wrap gap-1">
                  {proj.systemTypes.map((st, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-slate-800/70 text-slate-300 border border-slate-700/60 px-1.5 py-0.2 rounded"
                    >
                      {st}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-slate-400 font-mono text-[10px]">
                  <span>{completedTasks}/{projectTasks.length} Tareas</span>
                  <span>•</span>
                  <span>{projectActas.length} Actas</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Nuevo Proyecto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Registrar Nuevo Proyecto de Seguridad Electrónica
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nombre del Proyecto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sede Administrativa Colpatria - CCTV IP & Incendio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Empresa Cliente *</label>
                  <input
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contacto / Interventor</label>
                  <input
                    type="text"
                    value={clientContact}
                    onChange={(e) => setClientContact(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ubicación / Dirección</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ciudad</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Supervisor Responsable</label>
                  <select
                    value={supervisorId}
                    onChange={(e) => setSupervisorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    {supervisors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contratista Asignado</label>
                  <select
                    value={contractorId}
                    onChange={(e) => setContractorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} (Score: {c.averageScore} pts)
                      </option>
                    ))}
                  </select>
                </div>
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
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
