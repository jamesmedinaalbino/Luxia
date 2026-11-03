import React, { useState } from 'react';
import {
  Award,
  ShieldAlert,
  Star,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Sliders,
  FolderKanban,
  UserCheck,
  Building2,
  Lock,
  ChevronRight,
  X,
  FileCheck2
} from 'lucide-react';
import { Contractor, ContractorEvaluation, Project, User } from '../types';

interface ContractorEvaluationsProps {
  contractors: Contractor[];
  evaluations: ContractorEvaluation[];
  projects: Project[];
  currentUser: User;
  onAddEvaluation: (evalData: Omit<ContractorEvaluation, 'id'>) => void;
  onAssignProjectToContractor: (contractorId: string, projectId: string) => void;
}

export const ContractorEvaluations: React.FC<ContractorEvaluationsProps> = ({
  contractors,
  evaluations,
  projects,
  currentUser,
  onAddEvaluation,
  onAssignProjectToContractor,
}) => {
  const isDirector = currentUser.role === 'director';

  // Modal: Nueva Evaluación
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
  const [selectedContractorId, setSelectedContractorId] = useState(contractors[0]?.id || '');
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id || '');
  const [calidad, setCalidad] = useState<number>(90);
  const [cronograma, setCronograma] = useState<number>(85);
  const [sst, setSst] = useState<number>(95);
  const [rotulado, setRotulado] = useState<number>(90);
  const [orden, setOrden] = useState<number>(85);
  const [comments, setComments] = useState<string>('');
  const [approvedForNext, setApprovedForNext] = useState<boolean>(true);

  // Modal: Asignar Proyecto a Contratista (Director Only)
  const [assignModalContractor, setAssignModalContractor] = useState<Contractor | null>(null);
  const [targetProjectId, setTargetProjectId] = useState<string>(projects[0]?.id || '');

  // Calculate live weighted score for the form
  const liveTotalScore = Number(
    (
      calidad * 0.25 +
      cronograma * 0.20 +
      sst * 0.20 +
      rotulado * 0.20 +
      orden * 0.15
    ).toFixed(1)
  );

  // Consolidate contractor scores across all projects
  const consolidatedContractors = contractors.map((c) => {
    const cEvals = evaluations.filter((e) => e.contractorId === c.id);
    const count = cEvals.length;
    const avgScore =
      count > 0
        ? Number(
            (cEvals.reduce((acc, curr) => acc + curr.totalScore, 0) / count).toFixed(1)
          )
        : c.averageScore;

    return {
      ...c,
      totalProjects: count > 0 ? count : c.totalProjects,
      averageScore: avgScore,
      evaluationsList: cEvals,
    };
  });

  // Sort by average score descending to find ranking
  const sortedRanking = [...consolidatedContractors].sort(
    (a, b) => b.averageScore - a.averageScore
  );

  const handleOpenNewEval = () => {
    setSelectedContractorId(contractors[0]?.id || '');
    setSelectedProjectId(projects[0]?.id || '');
    setCalidad(90);
    setCronograma(85);
    setSst(95);
    setRotulado(90);
    setOrden(85);
    setComments('');
    setApprovedForNext(true);
    setIsEvalModalOpen(true);
  };

  const handleSubmitEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const cont = contractors.find((c) => c.id === selectedContractorId);
    const proj = projects.find((p) => p.id === selectedProjectId);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    onAddEvaluation({
      contractorId: selectedContractorId,
      contractorName: cont ? cont.name : 'Contratista LUXIA',
      projectId: selectedProjectId,
      projectName: proj ? proj.name : 'Proyecto en Curso',
      evaluatedById: currentUser.id,
      evaluatedByName: currentUser.name,
      evaluatedRole: currentUser.role,
      date: dateStr,
      calidadInstalacion: calidad,
      cumplimientoCronograma: cronograma,
      seguridadSST: sst,
      rotuladoYPruebas: rotulado,
      ordenYAseo: orden,
      totalScore: liveTotalScore,
      comments: comments.trim() || 'Evaluación técnica periódica de seguridad electrónica.',
      approvedForNextProjects: approvedForNext,
    });

    setIsEvalModalOpen(false);
  };

  const handleConfirmAssignment = () => {
    if (assignModalContractor && targetProjectId) {
      onAssignProjectToContractor(assignModalContractor.id, targetProjectId);
      setAssignModalContractor(null);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <h1 className="text-base font-bold text-white">
                Evaluación & Ranking de Contratistas
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Calificación por proyectos según calidad técnica, cronogramas, SST y rotulado
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenNewEval}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-950/40 active:scale-95 transition"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Evaluar Contratista en Proyecto</span>
            </button>
          </div>
        </div>
      </div>

      {/* CONFIDENTIALITY NOTICE IF NOT DIRECTOR */}
      {!isDirector ? (
        <div className="bg-slate-900/70 border-2 border-amber-500/30 rounded-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-7 h-7" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-white">
              Información Consolidada Confidencial
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              El <strong>ranking general consolidado</strong> y los puntajes acumulados para asignación estratégica de nuevos proyectos son de acceso exclusivo para la <strong>Dirección de Proyectos (James Medina Albino)</strong>.
            </p>
            <p className="text-[11px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 rounded-xl p-2.5">
              Como <strong>{currentUser.role.toUpperCase()}</strong>, usted puede calificar al contratista de su frente de obra haciendo clic en el botón superior <em>"Evaluar Contratista en Proyecto"</em>. Su calificación se enviará automáticamente al consolidado del Director.
            </p>
          </div>

          <div className="pt-2">
            <span className="text-[10px] text-slate-500">
              Para ver el ranking consolidado, cambie al perfil de <strong>Director de Proyectos</strong> en la barra superior.
            </span>
          </div>
        </div>
      ) : (
        /* DIRECTOR ONLY CONSOLIDATED VIEW */
        <div className="space-y-4 animate-fade-in">
          {/* Executive Summary Card */}
          <div className="bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                VISTA EXCLUSIVA DIRECTOR - CRITERIO DE ASIGNACIÓN
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {contractors.length} contratistas auditados
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-snug">
              Los contratistas acumulan evaluaciones técnicas de todos los proyectos ejecutados. El contratista posicionado en el <strong className="text-amber-300">Puesto #1</strong> obtiene la calificación prioritaria para ser adjudicado en los próximos contratos de seguridad electrónica de LUXIA.
            </p>
          </div>

          {/* PODIUM OF CONTRACTORS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedRanking.map((contractor, index) => {
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rankBadgeClass = 'bg-slate-800 text-slate-300 border-slate-700';
              if (isFirst) rankBadgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/50';
              if (isSecond) rankBadgeClass = 'bg-slate-300/20 text-slate-200 border-slate-400/50';
              if (isThird) rankBadgeClass = 'bg-amber-700/20 text-amber-400 border-amber-700/50';

              return (
                <div
                  key={contractor.id}
                  className={`bg-slate-900 border rounded-2xl p-4 transition shadow-lg space-y-3 relative overflow-hidden ${
                    isFirst
                      ? 'border-amber-500/60 shadow-amber-950/20 ring-1 ring-amber-500/20'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isFirst && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-black px-3 py-1 rounded-bl-xl shadow-md flex items-center gap-1">
                      <Star className="w-3 h-3 fill-slate-950" />
                      #1 ASIGNACIÓN PRIORITARIA
                    </div>
                  )}

                  {/* Header info */}
                  <div className="flex items-start justify-between gap-2 pr-12">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg border ${rankBadgeClass}`}>
                          #{index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white">
                          {contractor.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        NIT: {contractor.nit} • Contacto: {contractor.contactPerson}
                      </p>
                    </div>
                  </div>

                  {/* Consolidated Score Big Display */}
                  <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Puntaje Consolidado:
                      </span>
                      <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span className={`text-2xl font-black ${
                          contractor.averageScore >= 90
                            ? 'text-amber-400'
                            : contractor.averageScore >= 80
                            ? 'text-cyan-400'
                            : 'text-slate-300'
                        }`}>
                          {contractor.averageScore}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">/ 100 pts</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Proyectos Auditados:
                      </span>
                      <p className="text-base font-bold text-white mt-0.5">
                        {contractor.totalProjects} {contractor.totalProjects === 1 ? 'Proyecto' : 'Proyectos'}
                      </p>
                    </div>
                  </div>

                  {/* Specialties tags */}
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {contractor.specialty.map((s, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-950 text-cyan-300/90 border border-slate-800 px-2 py-0.5 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* History of Project Evaluations */}
                  {contractor.evaluationsList && contractor.evaluationsList.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <p className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <FileCheck2 className="w-3.5 h-3.5 text-cyan-400" />
                        Historial de Evaluaciones por Proyecto:
                      </p>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {contractor.evaluationsList.map((ev) => (
                          <div
                            key={ev.id}
                            className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-2 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-200 truncate max-w-[200px]">
                                {ev.projectName}
                              </span>
                              <span className="font-mono font-bold text-cyan-400 text-xs">
                                {ev.totalScore} pts
                              </span>
                            </div>
                            <div className="grid grid-cols-5 gap-1 text-[9px] text-slate-400 text-center bg-slate-900/60 p-1 rounded-lg">
                              <div>Cal: <strong className="text-slate-200">{ev.calidadInstalacion}</strong></div>
                              <div>Cron: <strong className="text-slate-200">{ev.cumplimientoCronograma}</strong></div>
                              <div>SST: <strong className="text-slate-200">{ev.seguridadSST}</strong></div>
                              <div>Rot: <strong className="text-slate-200">{ev.rotuladoYPruebas}</strong></div>
                              <div>Aseo: <strong className="text-slate-200">{ev.ordenYAseo}</strong></div>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">
                              "{ev.comments}"
                            </p>
                            <p className="text-[9px] text-slate-500 text-right">
                              Por {ev.evaluatedByName} ({ev.evaluatedRole}) • {ev.date}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Assign Project Button for Director */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500">
                      Estado: <strong className="text-emerald-400 uppercase">{contractor.recommendationLevel.replace('_', ' ')}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setAssignModalContractor(contractor)}
                      className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 transition flex items-center gap-1"
                    >
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Asignar a Nuevo Proyecto</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: Formulario de Nueva Evaluación de Proyecto */}
      {isEvalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    Evaluar Desempeño de Contratista
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    Ponderación técnica de seguridad electrónica por proyecto
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEvalModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitEvaluation} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contratista *</label>
                  <select
                    value={selectedContractorId}
                    onChange={(e) => setSelectedContractorId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    {contractors.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proyecto Asignado *</label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sliders for the 5 Weighted Criteria */}
              <div className="space-y-3 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <span className="font-bold text-slate-200">Criterios de Evaluación Técnica</span>
                  <span className="font-mono text-cyan-400 font-bold">Puntaje Ponderado: {liveTotalScore} / 100</span>
                </div>

                {/* 1. Calidad (25%) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">1. Calidad de instalación y peinado de cableado / racks (25%)</span>
                    <span className="font-bold text-cyan-300">{calidad} pts</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={calidad}
                    onChange={(e) => setCalidad(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* 2. Cronograma (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">2. Cumplimiento de cronogramas y tiempos (20%)</span>
                    <span className="font-bold text-cyan-300">{cronograma} pts</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={cronograma}
                    onChange={(e) => setCronograma(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* 3. SST (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">3. Seguridad y Salud en el Trabajo, EPPs y alturas (20%)</span>
                    <span className="font-bold text-cyan-300">{sst} pts</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={sst}
                    onChange={(e) => setSst(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* 4. Rotulado y Pruebas (20%) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">4. Rotulado TIA-606 y pruebas técnicas / Fluke (20%)</span>
                    <span className="font-bold text-cyan-300">{rotulado} pts</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={rotulado}
                    onChange={(e) => setRotulado(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                {/* 5. Orden y Aseo (15%) */}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-300 font-medium">5. Orden, aseo y entrega limpia de obra (15%)</span>
                    <span className="font-bold text-cyan-300">{orden} pts</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={orden}
                    onChange={(e) => setOrden(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Observaciones y Justificación de Calificación *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detalle aspectos destacados o no conformidades encontradas durante la supervisión..."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="approveNext"
                  checked={approvedForNext}
                  onChange={(e) => setApprovedForNext(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700"
                />
                <label htmlFor="approveNext" className="text-slate-300 font-medium cursor-pointer">
                  Recomiendo a este contratista para ser asignado en futuros proyectos de LUXIA
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEvalModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-950/40"
                >
                  Registrar Evaluación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Asignar Proyecto a Contratista */}
      {assignModalContractor && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-cyan-400" />
                Asignación de Proyecto a Contratista
              </h3>
              <button
                type="button"
                onClick={() => setAssignModalContractor(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="font-bold text-cyan-300">{assignModalContractor.name}</p>
              <p className="text-slate-400">Puntaje Consolidado: <strong className="text-amber-400">{assignModalContractor.averageScore} pts</strong></p>
              <p className="text-slate-500">NIT: {assignModalContractor.nit}</p>
            </div>

            <div>
              <label className="block text-xs text-slate-300 font-semibold mb-1.5">
                Seleccionar Proyecto a Adjudicar:
              </label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAssignModalContractor(null)}
                className="px-3.5 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAssignment}
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-bold shadow-md shadow-emerald-950/40"
              >
                Confirmar Asignación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
