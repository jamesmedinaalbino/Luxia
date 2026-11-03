import React, { useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_PROJECTS,
  INITIAL_CONTRACTORS,
  INITIAL_EVALUATIONS,
  INITIAL_TASKS,
  INITIAL_ACTAS,
} from './data/mockData';
import {
  User,
  Project,
  Task,
  TechnicalActa,
  Contractor,
  ContractorEvaluation,
} from './types';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { TaskManager } from './components/TaskManager';
import { ActasManager } from './components/ActasManager';
import { ContractorEvaluations } from './components/ContractorEvaluations';
import { ProjectsManager } from './components/ProjectsManager';
import { UserManager } from './components/UserManager';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  // Load from localStorage or use initial data
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('luxia_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const savedId = localStorage.getItem('luxia_current_user_id');
    const found = savedId ? users.find((u) => u.id === savedId) : null;
    return found || users[0] || INITIAL_USERS[0];
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('luxia_projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('luxia_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [actas, setActas] = useState<TechnicalActa[]>(() => {
    const saved = localStorage.getItem('luxia_actas');
    return saved ? JSON.parse(saved) : INITIAL_ACTAS;
  });

  const [contractors, setContractors] = useState<Contractor[]>(() => {
    const saved = localStorage.getItem('luxia_contractors');
    return saved ? JSON.parse(saved) : INITIAL_CONTRACTORS;
  });

  const [evaluations, setEvaluations] = useState<ContractorEvaluation[]>(() => {
    const saved = localStorage.getItem('luxia_evaluations');
    return saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
  });

  // Current tab
  const [activeTab, setActiveTab] = useState<string>('tareas');

  // Pre-filled data when creating an acta from a task
  const [prefilledActa, setPrefilledActa] = useState<Partial<TechnicalActa> | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('luxia_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('luxia_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('luxia_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('luxia_actas', JSON.stringify(actas));
  }, [actas]);

  useEffect(() => {
    localStorage.setItem('luxia_contractors', JSON.stringify(contractors));
  }, [contractors]);

  useEffect(() => {
    localStorage.setItem('luxia_evaluations', JSON.stringify(evaluations));
  }, [evaluations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('luxia_current_user_id', currentUser.id);
    }
  }, [currentUser]);

  // Recalculate contractor scores whenever evaluations change
  useEffect(() => {
    const updated = contractors.map((c) => {
      const cEvals = evaluations.filter((e) => e.contractorId === c.id);
      if (cEvals.length === 0) return c;
      const avg = Number(
        (cEvals.reduce((acc, curr) => acc + curr.totalScore, 0) / cEvals.length).toFixed(1)
      );
      let level: Contractor['recommendationLevel'] = 'estandar';
      if (avg >= 90) level = 'prioritario';
      else if (avg >= 75) level = 'estandar';
      else if (avg >= 60) level = 'en_observacion';
      else level = 'no_recomendado';

      return {
        ...c,
        totalProjects: cEvals.length,
        averageScore: avg,
        recommendationLevel: level,
      };
    });
    setContractors(updated);
  }, [evaluations]);

  // Handlers
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    showToast(`Sesión cambiada a ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((t) => (t.id === updatedTask.id ? updatedTask : t)));
    showToast('Tarea actualizada correctamente');
  };

  const handleAddTask = (newTaskData: Omit<Task, 'id' | 'createdAt' | 'photos' | 'comments'>) => {
    const task: Task = {
      ...newTaskData,
      id: `tsk-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      photos: [],
      comments: [],
    };
    setTasks([task, ...tasks]);
    showToast('Nueva tarea asignada en campo con éxito');
  };

  const handleCreateActaFromTask = (task: Task) => {
    const project = projects.find((p) => p.id === task.projectId);
    setPrefilledActa({
      projectId: task.projectId,
      projectName: task.projectName,
      clientName: project?.clientName || 'Cliente Corporativo',
      clientContact: project?.clientContact || 'Interventor en Sitio',
      clientPhone: project?.clientPhone || '',
      address: project?.location || task.locationTag || '',
      city: project?.city || 'Bogotá D.C.',
      objective: `Cierre y validación técnica de la tarea: "${task.title}"`,
      workDone: `${task.description}\n\nPuntos validados:\n${task.checklist.map((c) => `• ${c.text}: ${c.done ? 'Completado' : 'Pendiente'}`).join('\n')}`,
      photos: task.photos.map((p) => ({
        id: `pht-acta-${p.id}`,
        url: p.url,
        caption: p.caption,
        category: 'durante',
        timestamp: p.timestamp,
      })),
      systemTypes: project?.systemTypes || ['CCTV IP'],
    });
    setActiveTab('actas');
    showToast('Datos de la tarea precargados en el formulario de Acta', 'info');
  };

  const handleSaveActa = (newActa: TechnicalActa) => {
    // If already exists, update, otherwise prepend
    const exists = actas.some((a) => a.id === newActa.id);
    if (exists) {
      setActas(actas.map((a) => (a.id === newActa.id ? newActa : a)));
      showToast(`Acta ${newActa.code} actualizada correctamente`);
    } else {
      setActas([newActa, ...actas]);
      showToast(`Acta oficial ${newActa.code} emitida y firmada con éxito`);
    }
  };

  const handleAddEvaluation = (evalData: Omit<ContractorEvaluation, 'id'>) => {
    const newEval: ContractorEvaluation = {
      ...evalData,
      id: `eval-${Date.now()}`,
    };
    setEvaluations([newEval, ...evaluations]);
    showToast(`Evaluación de ${newEval.contractorName} registrada (${newEval.totalScore} pts)`);
  };

  const handleAssignProjectToContractor = (contractorId: string, projectId: string) => {
    const cont = contractors.find((c) => c.id === contractorId);
    if (!cont) return;

    setProjects(
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              contractorId: cont.id,
              contractorName: cont.name,
            }
          : p
      )
    );
    showToast(`Proyecto asignado exitosamente al contratista ${cont.name}`);
  };

  const handleAddProject = (newProjectData: Omit<Project, 'id'>) => {
    const newProj: Project = {
      ...newProjectData,
      id: `prj-${Date.now()}`,
    };
    setProjects([newProj, ...projects]);
    showToast(`Proyecto ${newProj.name} registrado en LUXIA`);
  };

  const handleAddUser = (newUserData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...newUserData,
      id: `usr-${Date.now()}`,
    };
    setUsers([...users, newUser]);
    showToast(`Usuario ${newUser.name} registrado exitosamente`);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    showToast(`Estado del usuario ${updatedUser.name} actualizado`);
  };

  const handleResetData = () => {
    localStorage.removeItem('luxia_users');
    localStorage.removeItem('luxia_projects');
    localStorage.removeItem('luxia_tasks');
    localStorage.removeItem('luxia_actas');
    localStorage.removeItem('luxia_contractors');
    localStorage.removeItem('luxia_evaluations');
    localStorage.removeItem('luxia_current_user_id');

    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    setProjects(INITIAL_PROJECTS);
    setTasks(INITIAL_TASKS);
    setActas(INITIAL_ACTAS);
    setContractors(INITIAL_CONTRACTORS);
    setEvaluations(INITIAL_EVALUATIONS);
    showToast('Datos de demostración restablecidos', 'info');
  };

  const pendingTasksCount = tasks.filter((t) => t.status === 'en_progreso' || t.status === 'pendiente').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-16 right-4 z-50 animate-bounce-short">
          <div className="bg-slate-900 border border-cyan-500/50 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold backdrop-blur-md">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header with Role and Fast User Switcher */}
      <Header
        currentUser={currentUser}
        allUsers={users}
        onSelectUser={handleSelectUser}
        activeTab={activeTab}
        tasksCount={pendingTasksCount}
        actasCount={actas.filter((a) => a.status === 'firmada').length}
      />

      {/* Desktop Navigation Tabs */}
      <div className="hidden sm:block border-b border-slate-800/80 bg-slate-900/60 sticky top-14 z-30 backdrop-blur-md px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          {[
            { id: 'tareas', label: 'Seguimiento de Tareas', count: tasks.length },
            { id: 'actas', label: 'Actas en Tiempo Real', count: actas.length },
            { id: 'proyectos', label: 'Proyectos Activos', count: projects.length },
            { id: 'contratistas', label: 'Evaluación Contratistas', count: contractors.length },
            ...(currentUser.role === 'director' ? [{ id: 'usuarios', label: 'Gestión de Personal', count: users.length }] : []),
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === tab.id ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6">
        {activeTab === 'tareas' && (
          <TaskManager
            tasks={tasks}
            projects={projects}
            users={users}
            currentUser={currentUser}
            onUpdateTask={handleUpdateTask}
            onAddTask={handleAddTask}
            onCreateActaFromTask={handleCreateActaFromTask}
          />
        )}

        {activeTab === 'actas' && (
          <ActasManager
            actas={actas}
            projects={projects}
            currentUser={currentUser}
            onSaveActa={handleSaveActa}
            initialNewActaData={prefilledActa}
            onClearInitialData={() => setPrefilledActa(null)}
          />
        )}

        {activeTab === 'proyectos' && (
          <ProjectsManager
            projects={projects}
            contractors={contractors}
            supervisors={users.filter((u) => u.role === 'supervisor' || u.role === 'ingeniero' || u.role === 'director')}
            tasks={tasks}
            actas={actas}
            onAddProject={handleAddProject}
          />
        )}

        {activeTab === 'contratistas' && (
          <ContractorEvaluations
            contractors={contractors}
            evaluations={evaluations}
            projects={projects}
            currentUser={currentUser}
            onAddEvaluation={handleAddEvaluation}
            onAssignProjectToContractor={handleAssignProjectToContractor}
          />
        )}

        {activeTab === 'usuarios' && (
          <UserManager
            users={users}
            currentUser={currentUser}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentUserRole={currentUser.role}
        pendingTasksCount={pendingTasksCount}
      />
    </div>
  );
}
