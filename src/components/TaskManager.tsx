import React, { useState } from 'react';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  MessageSquare,
  Search,
  Filter,
  CheckSquare,
  MapPin,
  Calendar,
  X,
  FileText,
  UserCheck
} from 'lucide-react';
import { Task, Project, User, TaskStatus, TaskPriority, TaskPhoto } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  projects: Project[];
  users: User[];
  currentUser: User;
  onUpdateTask: (task: Task) => void;
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'photos' | 'comments'>) => void;
  onCreateActaFromTask?: (task: Task) => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  tasks,
  projects,
  users,
  currentUser,
  onUpdateTask,
  onAddTask,
  onCreateActaFromTask,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedProject, setSelectedProject] = useState<string>('todos');
  const [filterOnlyMine, setFilterOnlyMine] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'cards' | 'kanban'>('cards');

  // Modals
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState(projects[0]?.id || '');
  const [newAssignedId, setNewAssignedId] = useState(currentUser.id);
  const [newPriority, setNewPriority] = useState<TaskPriority>('alta');
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [newLocationTag, setNewLocationTag] = useState('');
  const [checklistItems, setChecklistItems] = useState<string[]>([
    'Inspección visual de sitio y canalizaciones',
    'Conectorización y montaje de equipos',
    'Pruebas de continuidad y energización',
  ]);
  const [newChecklistInput, setNewChecklistInput] = useState('');

  // Comment input state inside task detail
  const [commentInput, setCommentInput] = useState('');

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (selectedStatus !== 'todos' && t.status !== selectedStatus) return false;
    if (selectedProject !== 'todos' && t.projectId !== selectedProject) return false;
    if (filterOnlyMine && t.assignedToId !== currentUser.id) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchProject = t.projectName.toLowerCase().includes(q);
      const matchAssignee = t.assignedToName.toLowerCase().includes(q);
      const matchDesc = t.description.toLowerCase().includes(q);
      if (!matchTitle && !matchProject && !matchAssignee && !matchDesc) return false;
    }
    return true;
  });

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'alta':
        return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'media':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'baja':
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const getStatusBadge = (s: TaskStatus) => {
    switch (s) {
      case 'pendiente':
        return { label: 'Pendiente', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'en_progreso':
        return { label: 'En Progreso', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'en_revision':
        return { label: 'En Revisión', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' };
      case 'completada':
        return { label: 'Completada', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    }
  };

  const handleToggleChecklist = (task: Task, itemId: string) => {
    const updatedChecklist = task.checklist.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    // If all are done, optionally move to completada or en_revision
    const allDone = updatedChecklist.every((i) => i.done);
    const updatedTask = {
      ...task,
      checklist: updatedChecklist,
      status: allDone && task.status === 'en_progreso' ? ('en_revision' as TaskStatus) : task.status,
    };
    onUpdateTask(updatedTask);
    if (selectedTask?.id === task.id) {
      setSelectedTask(updatedTask);
    }
  };

  const handleStatusChange = (task: Task, newStatus: TaskStatus) => {
    const updated = { ...task, status: newStatus };
    onUpdateTask(updated);
    if (selectedTask?.id === task.id) {
      setSelectedTask(updated);
    }
  };

  const handleAddComment = (task: Task) => {
    if (!commentInput.trim()) return;
    const now = new Date();
    const timestamp = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newComment = {
      id: `cmt-${Date.now()}`,
      authorName: currentUser.name,
      authorRole: currentUser.role.toUpperCase(),
      text: commentInput.trim(),
      timestamp: `Hoy a las ${timestamp}`,
    };
    const updated = {
      ...task,
      comments: [...task.comments, newComment],
    };
    onUpdateTask(updated);
    if (selectedTask?.id === task.id) {
      setSelectedTask(updated);
    }
    setCommentInput('');
  };

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const project = projects.find((p) => p.id === newProjectId);
    const assignee = users.find((u) => u.id === newAssignedId);

    onAddTask({
      title: newTitle.trim(),
      description: newDescription.trim(),
      projectId: newProjectId,
      projectName: project ? project.name : 'Proyecto General',
      assignedToId: newAssignedId,
      assignedToName: assignee ? assignee.name : 'Técnico LUXIA',
      assignedRole: assignee ? assignee.role : 'tecnico',
      priority: newPriority,
      status: 'pendiente',
      dueDate: newDueDate,
      locationTag: newLocationTag || 'En sitio de obra',
      checklist: checklistItems.map((text, idx) => ({
        id: `chk-${Date.now()}-${idx}`,
        text,
        done: false,
      })),
    });

    setIsNewTaskModalOpen(false);
    setNewTitle('');
    setNewDescription('');
    setNewLocationTag('');
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistInput.trim()) return;
    setChecklistItems([...checklistItems, newChecklistInput.trim()]);
    setNewChecklistInput('');
  };

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  // Add photo to current selected task
  const handleAddPhotoToTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedTask) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const photo: TaskPhoto = {
        id: `pht-task-${Date.now()}`,
        url: reader.result as string,
        caption: `Evidencia agregada por ${currentUser.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      const updated = {
        ...selectedTask,
        photos: [...selectedTask.photos, photo],
      };
      onUpdateTask(updated);
      setSelectedTask(updated);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Controls Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-cyan-400" />
              Seguimiento de Tareas Diarias
            </h1>
            <p className="text-xs text-slate-400">
              Control de avance de técnicos, supervisores e ingenieros en campo
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Nueva Tarea</span>
          </button>
        </div>

        {/* Search & Quick filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          {/* Search bar */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por tarea, técnico o proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          {/* Project selector filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            >
              <option value="todos">Todos los Proyectos ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Mine vs All & View Mode */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterOnlyMine(!filterOnlyMine)}
              className={`flex-1 py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition ${
                filterOnlyMine
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Mis Tareas</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'cards' ? 'kanban' : 'cards')}
              className="p-2 bg-slate-950 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs"
              title="Cambiar vista Lista/Tablero"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'todos', label: 'Todas', count: tasks.length },
            { id: 'en_progreso', label: 'En Progreso', count: tasks.filter((t) => t.status === 'en_progreso').length },
            { id: 'pendiente', label: 'Pendientes', count: tasks.filter((t) => t.status === 'pendiente').length },
            { id: 'en_revision', label: 'En Revisión', count: tasks.filter((t) => t.status === 'en_revision').length },
            { id: 'completada', label: 'Completadas', count: tasks.filter((t) => t.status === 'completada').length },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedStatus(item.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedStatus === item.id
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-950/70 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <span>{item.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedStatus === item.id ? 'bg-cyan-900/60 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards List View */}
      {viewMode === 'cards' ? (
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No hay tareas que coincidan con el filtro</p>
              <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otro proyecto o limpiando la búsqueda.</p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const statusInfo = getStatusBadge(task.status);
              const doneCount = task.checklist.filter((i) => i.done).length;
              const totalItems = task.checklist.length;
              const progressPct = totalItems > 0 ? Math.round((doneCount / totalItems) * 100) : 0;

              return (
                <div
                  key={task.id}
                  className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-md space-y-3"
                >
                  {/* Top card metadata */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getPriorityBadge(task.priority)}`}>
                          Prioridad {task.priority}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <span className="text-[11px] text-cyan-400 font-medium">
                          {task.projectName}
                        </span>
                      </div>
                      <h3
                        onClick={() => setSelectedTask(task)}
                        className="text-sm font-bold text-white hover:text-cyan-300 cursor-pointer transition leading-snug"
                      >
                        {task.title}
                      </h3>
                    </div>

                    {/* Quick status selector */}
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                      className="bg-slate-950 border border-slate-800 text-[11px] text-slate-300 rounded-lg px-2 py-1 focus:ring-1 focus:ring-cyan-500"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_progreso">En Progreso</option>
                      <option value="en_revision">En Revisión</option>
                      <option value="completada">Completada</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {task.description}
                  </p>

                  {/* Checklist preview (clickable items) */}
                  {totalItems > 0 && (
                    <div className="bg-slate-950/70 border border-slate-800/60 rounded-xl p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-300">Checklist Operativo:</span>
                        <span>{doneCount} de {totalItems} ({progressPct}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-1 pt-1">
                        {task.checklist.slice(0, 3).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => handleToggleChecklist(task, item.id)}
                            className="flex items-center gap-2 text-left text-xs py-0.5 text-slate-300 hover:text-white group"
                          >
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition ${
                              item.done
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                : 'border-slate-600 group-hover:border-cyan-400'
                            }`}>
                              {item.done && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                            </span>
                            <span className={`truncate text-[11px] ${item.done ? 'line-through text-slate-500' : ''}`}>
                              {item.text}
                            </span>
                          </button>
                        ))}
                        {totalItems > 3 && (
                          <p
                            onClick={() => setSelectedTask(task)}
                            className="text-[10px] text-cyan-400 font-medium hover:underline cursor-pointer pt-0.5"
                          >
                            + {totalItems - 3} puntos más en checklist...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer metadata */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-300 font-medium">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        {task.assignedToName} ({task.assignedRole})
                      </span>
                      {task.locationTag && (
                        <span className="hidden sm:flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-cyan-500" />
                          {task.locationTag}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {task.dueDate}
                      </span>
                      {task.photos.length > 0 && (
                        <span className="flex items-center gap-1 text-cyan-400 font-mono">
                          <Camera className="w-3 h-3" />
                          {task.photos.length}
                        </span>
                      )}
                      {task.comments.length > 0 && (
                        <span className="flex items-center gap-1 text-purple-400 font-mono">
                          <MessageSquare className="w-3 h-3" />
                          {task.comments.length}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setSelectedTask(task)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium"
                      >
                        Detalle
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View (Mobile Scrollable Columns) */
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 overflow-x-auto pb-4">
          {(['pendiente', 'en_progreso', 'en_revision', 'completada'] as TaskStatus[]).map((statusKey) => {
            const columnTasks = filteredTasks.filter((t) => t.status === statusKey);
            const statusInfo = getStatusBadge(statusKey);
            return (
              <div key={statusKey} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 space-y-2 min-w-[260px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{columnTasks.length}</span>
                </div>

                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-slate-950 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-2.5 cursor-pointer transition space-y-1.5 shadow-sm"
                    >
                      <p className="text-[10px] text-cyan-400 font-semibold truncate">{task.projectName}</p>
                      <p className="text-xs font-bold text-white leading-tight">{task.title}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>{task.assignedToName.split(' ')[0]}</span>
                        <span className="text-slate-500">{task.dueDate}</span>
                      </div>
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-600">
                      Sin tareas en esta etapa
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Nueva Tarea */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-5 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                Asignar Nueva Tarea Operativa
              </h2>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Título de la Tarea *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Montaje y calibración de cámara PTZ perimetral"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Descripción técnica *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Instrucciones específicas, herramientas necesarias o normas de seguridad..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proyecto Asignado</label>
                  <select
                    value={newProjectId}
                    onChange={(e) => setNewProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Responsable en Campo</label>
                  <select
                    value={newAssignedId}
                    onChange={(e) => setNewAssignedId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Prioridad</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  >
                    <option value="alta">Alta (Crítica)</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Fecha Límite</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ubicación / Zona</label>
                  <input
                    type="text"
                    placeholder="Ej. IDF Piso 3"
                    value={newLocationTag}
                    onChange={(e) => setNewLocationTag(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-200"
                  />
                </div>
              </div>

              {/* Dynamic Checklist builder */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-slate-300 font-semibold">
                  Puntos de Verificación / Checklist ({checklistItems.length})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Agregar punto (ej. Conectorizado, Pruebas PoE, Rotulado)..."
                    value={newChecklistInput}
                    onChange={(e) => setNewChecklistInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklistItem();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklistItem}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold"
                  >
                    Añadir
                  </button>
                </div>

                <div className="max-h-28 overflow-y-auto space-y-1 pt-1">
                  {checklistItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300"
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveChecklistItem(idx)}
                        className="text-slate-500 hover:text-red-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-900/30"
                >
                  Crear y Asignar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Tarea & Comentarios & Evidencias */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[11px] text-cyan-400 font-semibold">{selectedTask.projectName}</span>
                <h2 className="text-base font-bold text-white mt-0.5">{selectedTask.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick status bar */}
            <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400">Estado actual:</span>
              <div className="flex gap-1.5">
                {(['pendiente', 'en_progreso', 'en_revision', 'completada'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedTask, st)}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold transition ${
                      selectedTask.status === st
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {getStatusBadge(st).label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
              <p className="font-semibold text-slate-200 mb-1">Descripción de la actividad:</p>
              <p>{selectedTask.description}</p>
              <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-[11px] text-slate-400">
                <span><strong>Asignado a:</strong> {selectedTask.assignedToName} ({selectedTask.assignedRole})</span>
                <span><strong>Límite:</strong> {selectedTask.dueDate}</span>
                {selectedTask.locationTag && <span><strong>Ubicación:</strong> {selectedTask.locationTag}</span>}
              </div>
            </div>

            {/* Interactive Checklist */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center justify-between">
                <span>Checklist de Validación Técnica ({selectedTask.checklist.filter(i => i.done).length}/{selectedTask.checklist.length})</span>
              </h4>
              <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                {selectedTask.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2.5 text-xs text-slate-200 cursor-pointer p-1 rounded hover:bg-slate-900 transition"
                  >
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() => handleToggleChecklist(selectedTask, item.id)}
                      className="w-4 h-4 rounded text-cyan-600 focus:ring-0 bg-slate-800 border-slate-700"
                    />
                    <span className={item.done ? 'line-through text-slate-500' : ''}>{item.text}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Photos & Evidence in Real-Time */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-cyan-400" />
                  Evidencias Fotográficas ({selectedTask.photos.length})
                </h4>
                <label className="cursor-pointer px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Subir Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleAddPhotoToTask}
                  />
                </label>
              </div>

              {selectedTask.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedTask.photos.map((p) => (
                    <div key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1 text-[9px] text-slate-300 truncate">
                        {p.caption}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800 text-center">
                  Aún no hay fotos adjuntas a esta tarea.
                </p>
              )}
            </div>

            {/* Field Comments */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Bitácora de Observaciones y Comentarios
              </h4>

              <div className="max-h-36 overflow-y-auto space-y-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                {selectedTask.comments.length > 0 ? (
                  selectedTask.comments.map((c) => (
                    <div key={c.id} className="text-xs bg-slate-900 p-2 rounded-lg border border-slate-800/60">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                        <span className="font-semibold text-cyan-300">{c.authorName} ({c.authorRole})</span>
                        <span>{c.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{c.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-[11px] text-slate-500 italic text-center py-1">Sin comentarios registrados.</p>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Escribir nota de campo o novedad..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddComment(selectedTask);
                    }
                  }}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(selectedTask)}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold"
                >
                  Enviar
                </button>
              </div>
            </div>

            {/* Create Acta action shortcut */}
            {onCreateActaFromTask && (
              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => {
                    const taskToConvert = selectedTask;
                    setSelectedTask(null);
                    onCreateActaFromTask(taskToConvert);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generar Acta Técnica Oficial desde esta Tarea</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
