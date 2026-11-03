import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Camera,
  X,
  ChevronRight,
  ChevronLeft,
  PenTool,
  Printer,
  Trash2
} from 'lucide-react';
import { TechnicalActa, ActaType, Project, User, EquipmentItem, PhotoEvidence, SignatureData } from '../types';
import { PhotoUploader } from './PhotoUploader';
import { SignaturePad } from './SignaturePad';
import { generateActaPDF } from '../utils/pdfGenerator';

interface ActasManagerProps {
  actas: TechnicalActa[];
  projects: Project[];
  currentUser: User;
  onSaveActa: (acta: TechnicalActa) => void;
  initialNewActaData?: Partial<TechnicalActa> | null;
  onClearInitialData?: () => void;
}

export const ActasManager: React.FC<ActasManagerProps> = ({
  actas,
  projects,
  currentUser,
  onSaveActa,
  initialNewActaData,
  onClearInitialData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [selectedProject, setSelectedProject] = useState<string>('todos');
  const [viewingActa, setViewingActa] = useState<TechnicalActa | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<string | null>(null);

  // New Acta Wizard Modal State
  const [isWizardOpen, setIsWizardOpen] = useState(Boolean(initialNewActaData));
  const [step, setStep] = useState<number>(1);

  // Wizard form state
  const [formType, setFormType] = useState<ActaType>(initialNewActaData?.type || 'servicio_mantenimiento');
  const [formProjectId, setFormProjectId] = useState<string>(initialNewActaData?.projectId || projects[0]?.id || '');
  const [formClientName, setFormClientName] = useState<string>(initialNewActaData?.clientName || '');
  const [formClientContact, setFormClientContact] = useState<string>(initialNewActaData?.clientContact || '');
  const [formClientPhone, setFormClientPhone] = useState<string>(initialNewActaData?.clientPhone || '');
  const [formAddress, setFormAddress] = useState<string>(initialNewActaData?.address || '');
  const [formCity, setFormCity] = useState<string>(initialNewActaData?.city || 'Bogotá D.C.');
  const [formSystemTypes, setFormSystemTypes] = useState<string[]>(
    initialNewActaData?.systemTypes || ['CCTV IP', 'Control de Acceso']
  );
  const [formObjective, setFormObjective] = useState<string>(initialNewActaData?.objective || '');
  const [formWorkDone, setFormWorkDone] = useState<string>(initialNewActaData?.workDone || '');
  const [formObservations, setFormObservations] = useState<string>(
    initialNewActaData?.observations || 'Equipos quedan en estado 100% operativo y energizados con respaldo UPS.'
  );
  const [formRecommendations, setFormRecommendations] = useState<string>(
    initialNewActaData?.recommendations || 'Realizar mantenimiento preventivo periódico trimestral según cronograma LUXIA.'
  );

  // Equipment list in wizard
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>(
    initialNewActaData?.equipment || [
      {
        id: 'eq-temp-1',
        type: 'Cámara IP Domo',
        brand: 'Hikvision',
        model: 'DS-2CD2143G2-I',
        serial: 'HKV-2026-9011',
        location: 'Hall de entrada',
        status: 'instalado',
      },
    ]
  );
  const [newEqType, setNewEqType] = useState('Cámara IP');
  const [newEqBrand, setNewEqBrand] = useState('Hikvision');
  const [newEqModel, setNewEqModel] = useState('');
  const [newEqSerial, setNewEqSerial] = useState('');
  const [newEqLocation, setNewEqLocation] = useState('');
  const [newEqStatus, setNewEqStatus] = useState<EquipmentItem['status']>('instalado');

  // Photos
  const [photos, setPhotos] = useState<PhotoEvidence[]>(initialNewActaData?.photos || []);

  // Signatures
  const [clientSigBase64, setClientSigBase64] = useState<string>('');
  const [clientSigName, setClientSigName] = useState<string>('');
  const [clientSigDoc, setClientSigDoc] = useState<string>('');
  const [clientSigRole, setClientSigRole] = useState<string>('Responsable del Cliente / Interventor');

  const [luxiaSigBase64, setLuxiaSigBase64] = useState<string>('');
  const [luxiaSigName, setLuxiaSigName] = useState<string>(currentUser.name);
  const [luxiaSigDoc, setLuxiaSigDoc] = useState<string>(currentUser.documentId || 'CC 1.020.345.678');
  const [luxiaSigRole, setLuxiaSigRole] = useState<string>(
    `${currentUser.role.toUpperCase()} DE PROYECTOS LUXIA`
  );

  // When project changes in wizard, auto-fill client details
  const handleProjectSelect = (projId: string) => {
    setFormProjectId(projId);
    const p = projects.find((x) => x.id === projId);
    if (p) {
      setFormClientName(p.clientName);
      setFormClientContact(p.clientContact);
      setFormClientPhone(p.clientPhone);
      setFormAddress(p.location);
      setFormCity(p.city);
      setClientSigName(p.clientContact);
    }
  };

  const handleOpenNewWizard = () => {
    const p = projects[0];
    if (p) {
      setFormProjectId(p.id);
      setFormClientName(p.clientName);
      setFormClientContact(p.clientContact);
      setFormClientPhone(p.clientPhone);
      setFormAddress(p.location);
      setFormCity(p.city);
      setClientSigName(p.clientContact);
    }
    setFormObjective('');
    setFormWorkDone('');
    setPhotos([]);
    setClientSigBase64('');
    setLuxiaSigBase64('');
    setStep(1);
    setIsWizardOpen(true);
  };

  const handleAddEquipment = () => {
    if (!newEqModel.trim() && !newEqSerial.trim()) return;
    const item: EquipmentItem = {
      id: `eq-${Date.now()}`,
      type: newEqType,
      brand: newEqBrand,
      model: newEqModel || 'Standard',
      serial: newEqSerial || 'S/N',
      location: newEqLocation || 'Área General',
      status: newEqStatus,
    };
    setEquipmentList([...equipmentList, item]);
    setNewEqModel('');
    setNewEqSerial('');
    setNewEqLocation('');
  };

  const handleRemoveEquipment = (id: string) => {
    setEquipmentList(equipmentList.filter((e) => e.id !== id));
  };

  const toggleSystemType = (st: string) => {
    if (formSystemTypes.includes(st)) {
      setFormSystemTypes(formSystemTypes.filter((x) => x !== st));
    } else {
      setFormSystemTypes([...formSystemTypes, st]);
    }
  };

  const handleFinalizeActa = () => {
    const proj = projects.find((p) => p.id === formProjectId);
    const now = new Date();
    const dateFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const consecNumber = String(actas.length + 90).padStart(3, '0');
    const isSigned = Boolean(clientSigBase64 && luxiaSigBase64);

    const newActa: TechnicalActa = {
      id: `act-${Date.now()}`,
      code: `ACT-LUX-2026-${consecNumber}`,
      type: formType,
      projectId: formProjectId,
      projectName: proj ? proj.name : 'Proyecto LUXIA',
      clientName: formClientName || (proj ? proj.clientName : 'Cliente Corporativo'),
      clientContact: formClientContact || (proj ? proj.clientContact : 'Interventor'),
      clientPhone: formClientPhone || '+57 300 000 0000',
      address: formAddress || (proj ? proj.location : 'Bogotá D.C.'),
      city: formCity,
      createdById: currentUser.id,
      createdByName: currentUser.name,
      createdRole: currentUser.role,
      createdAt: dateFormatted,
      systemTypes: formSystemTypes.length > 0 ? formSystemTypes : ['Seguridad Electrónica Integral'],
      objective: formObjective || 'Prestación de servicios técnicos y verificación de seguridad electrónica.',
      workDone: formWorkDone || 'Actividades de campo ejecutadas a satisfacción técnica.',
      observations: formObservations,
      recommendations: formRecommendations,
      equipment: equipmentList,
      photos,
      clientSignature: clientSigBase64
        ? {
            signatureBase64: clientSigBase64,
            signerName: clientSigName || 'Cliente / Interventor',
            signerDocument: clientSigDoc || 'Documento en registro',
            signerRoleOrJob: clientSigRole,
            date: dateFormatted,
          }
        : undefined,
      luxiaSignature: luxiaSigBase64
        ? {
            signatureBase64: luxiaSigBase64,
            signerName: luxiaSigName || currentUser.name,
            signerDocument: luxiaSigDoc || currentUser.documentId || 'Certificado LUXIA',
            signerRoleOrJob: luxiaSigRole,
            date: dateFormatted,
          }
        : undefined,
      status: isSigned ? 'firmada' : 'borrador',
    };

    onSaveActa(newActa);
    setIsWizardOpen(false);
    if (onClearInitialData) onClearInitialData();
  };

  const handleDownloadPdf = async (acta: TechnicalActa) => {
    setIsGeneratingPdf(acta.id);
    try {
      await generateActaPDF(acta);
    } catch (err) {
      console.error('Error generando PDF', err);
    } finally {
      setIsGeneratingPdf(null);
    }
  };

  // Filter list
  const filteredActas = actas.filter((a) => {
    if (selectedType !== 'todos' && a.type !== selectedType) return false;
    if (selectedProject !== 'todos' && a.projectId !== selectedProject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = a.code.toLowerCase().includes(q);
      const matchClient = a.clientName.toLowerCase().includes(q);
      const matchProj = a.projectName.toLowerCase().includes(q);
      const matchCreated = a.createdByName.toLowerCase().includes(q);
      if (!matchCode && !matchClient && !matchProj && !matchCreated) return false;
    }
    return true;
  });

  const getActaTypeBadge = (t: ActaType) => {
    switch (t) {
      case 'entrega_satisfaccion':
        return { label: 'Entrega a Satisfacción', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
      case 'servicio_mantenimiento':
        return { label: 'Servicio / Mantenimiento', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
      case 'visita_tecnica':
      default:
        return { label: 'Visita Técnica / Levantamiento', bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30' };
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Top Banner and Quick Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div>
            <h1 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cyan-400" />
              Actas Técnicas Digitales en Tiempo Real
            </h1>
            <p className="text-xs text-slate-400">
              Levantamientos, servicios y entregas con registro fotográfico, doble firma y descarga en PDF
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenNewWizard}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Acta en Tiempo Real</span>
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por acta, cliente o proyecto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
            >
              <option value="todos">Todos los Proyectos ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300"
            >
              <option value="todos">Todos los Tipos ({actas.length})</option>
              <option value="entrega_satisfaccion">Entregas a Satisfacción</option>
              <option value="servicio_mantenimiento">Servicios / Mantenimiento</option>
              <option value="visita_tecnica">Visitas Técnicas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Actas List */}
      <div className="space-y-3">
        {filteredActas.length === 0 ? (
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 text-center">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No se encontraron actas</p>
            <p className="text-xs text-slate-500 mt-1">Crea una nueva acta digital para registrar el servicio con firmas y fotos.</p>
          </div>
        ) : (
          filteredActas.map((acta) => {
            const typeInfo = getActaTypeBadge(acta.type);
            const isSigned = acta.status === 'firmada';
            const isDownloading = isGeneratingPdf === acta.id;

            return (
              <div
                key={acta.id}
                className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-md space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs bg-slate-950 text-cyan-300 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
                      {acta.code}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${typeInfo.bg}`}>
                      {typeInfo.label}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isSigned
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}>
                      {isSigned ? '✓ FIRMADA Y CERTIFICADA' : 'BORRADOR / PENDIENTE FIRMA'}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {acta.createdAt}
                  </span>
                </div>

                {/* Main Content */}
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">
                    {acta.projectName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 pt-1">
                    <div>
                      <p><strong className="text-slate-400">Cliente:</strong> {acta.clientName}</p>
                      <p><strong className="text-slate-400">Atendió:</strong> {acta.clientContact} ({acta.clientPhone})</p>
                      <p><strong className="text-slate-400">Ubicación:</strong> {acta.address} - {acta.city}</p>
                    </div>
                    <div>
                      <p><strong className="text-slate-400">Responsable LUXIA:</strong> {acta.createdByName} ({acta.createdRole.toUpperCase()})</p>
                      <p><strong className="text-slate-400">Sistemas:</strong> {acta.systemTypes.join(', ')}</p>
                      <p><strong className="text-slate-400">Equipos registrados:</strong> {acta.equipment.length} items</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 pt-1 line-clamp-2">
                    <strong className="text-slate-300">Trabajos: </strong>{acta.workDone}
                  </p>
                </div>

                {/* Photo & Signature chips */}
                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                  <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Camera className="w-3 h-3 text-cyan-400" />
                    {acta.photos.length} fotos de evidencia
                  </span>

                  <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    acta.clientSignature
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    <PenTool className="w-3 h-3" />
                    {acta.clientSignature ? `Firma Cliente: ${acta.clientSignature.signerName.split(' ')[0]}` : 'Sin firma cliente'}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                    acta.luxiaSignature
                      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                      : 'bg-slate-950 text-slate-500 border-slate-800'
                  }`}>
                    <ShieldCheck className="w-3 h-3" />
                    {acta.luxiaSignature ? `Firma LUXIA: ${acta.luxiaSignature.signerName.split(' ')[0]}` : 'Sin firma LUXIA'}
                  </span>
                </div>

                {/* Actions: Download PDF, View Details */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewingActa(acta)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Detalles / Firmas</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(acta)}
                    disabled={isDownloading}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Generando PDF...' : 'Descargar PDF Oficial'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL: Wizard para Crear Acta en Tiempo Real */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-6">
            {/* Wizard Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                  LUXIA SEGURIDAD ELECTRÓNICA
                </span>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  Nueva Acta Digital en Tiempo Real
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsWizardOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress */}
            <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
              {[
                { s: 1, label: '1. Proyecto' },
                { s: 2, label: '2. Equipos' },
                { s: 3, label: '3. Trabajos' },
                { s: 4, label: '4. Fotos' },
                { s: 5, label: '5. Firmas' },
              ].map((stepObj) => (
                <button
                  key={stepObj.s}
                  type="button"
                  onClick={() => setStep(stepObj.s)}
                  className={`py-1.5 px-1 rounded-lg font-semibold transition ${
                    step === stepObj.s
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : step > stepObj.s
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                      : 'bg-slate-950 text-slate-500'
                  }`}
                >
                  {stepObj.label}
                </button>
              ))}
            </div>

            {/* STEP 1: Proyecto y Datos del Cliente */}
            {step === 1 && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tipo de Acta *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'visita_tecnica', label: 'Visita / Levantamiento' },
                      { id: 'servicio_mantenimiento', label: 'Servicio / Mantenimiento' },
                      { id: 'entrega_satisfaccion', label: 'Entrega a Satisfacción' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFormType(item.id as ActaType)}
                        className={`p-2.5 rounded-xl text-center border font-semibold transition ${
                          formType === item.id
                            ? 'bg-cyan-600/20 text-cyan-300 border-cyan-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Proyecto Relacionado *</label>
                  <select
                    value={formProjectId}
                    onChange={(e) => handleProjectSelect(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Empresa / Cliente *</label>
                    <input
                      type="text"
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Persona de Contacto / Interventor *</label>
                    <input
                      type="text"
                      value={formClientContact}
                      onChange={(e) => {
                        setFormClientContact(e.target.value);
                        setClientSigName(e.target.value);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Teléfono de Contacto</label>
                    <input
                      type="text"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Dirección / Sede de Instalación</label>
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Sistemas de Seguridad Involucrados</label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'CCTV IP',
                      'Videoanalítica AI',
                      'Control de Acceso',
                      'Biometría Facial',
                      'Detección de Incendio',
                      'Alarma de Intrusión',
                      'Cableado Cat6A',
                      'Fibra Óptica',
                      'Cerca Eléctrica',
                    ].map((st) => {
                      const active = formSystemTypes.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => toggleSystemType(st)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition ${
                            active
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                          }`}
                        >
                          {active ? '✓ ' : '+ '}{st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Equipos Registrados */}
            {step === 2 && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-200">Añadir Equipo o Dispositivo</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Tipo (Cámara, NVR, Panel)"
                      value={newEqType}
                      onChange={(e) => setNewEqType(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Marca (Hikvision, Notifier...)"
                      value={newEqBrand}
                      onChange={(e) => setNewEqBrand(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Modelo"
                      value={newEqModel}
                      onChange={(e) => setNewEqModel(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                    <input
                      type="text"
                      placeholder="Serial / N° Activo"
                      value={newEqSerial}
                      onChange={(e) => setNewEqSerial(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Ubicación física (ej. Piso 2 Hall)"
                      value={newEqLocation}
                      onChange={(e) => setNewEqLocation(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    />
                    <select
                      value={newEqStatus}
                      onChange={(e) => setNewEqStatus(e.target.value as EquipmentItem['status'])}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                    >
                      <option value="instalado">Instalado nuevo</option>
                      <option value="operativo">Operativo / Revisado</option>
                      <option value="reparado">Reparado en sitio</option>
                      <option value="pendiente_cambio">Pendiente de cambio</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddEquipment}
                      className="col-span-2 sm:col-span-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-bold py-1.5"
                    >
                      + Agregar Equipo
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-slate-300">
                    Equipos en esta Acta ({equipmentList.length})
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {equipmentList.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800 text-slate-300"
                      >
                        <div>
                          <p className="font-bold text-white text-xs">{item.type} - {item.brand} {item.model}</p>
                          <p className="text-[10px] text-slate-400">
                            Serial: <span className="font-mono text-cyan-300">{item.serial}</span> | Ubicación: {item.location} | Estado: <span className="text-emerald-400 uppercase">{item.status}</span>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveEquipment(item.id)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Alcance y Trabajos Realizados */}
            {step === 3 && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Objetivo del Servicio / Visita *</label>
                  <input
                    type="text"
                    placeholder="Ej. Levantamiento técnico para migración de CCTV analógico a IP..."
                    value={formObjective}
                    onChange={(e) => setFormObjective(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Descripción de Trabajos Realizados en Sitio *</label>
                  <textarea
                    rows={4}
                    placeholder="Detalle de actividades técnicas ejecutadas, pruebas de enlace, ponchado, energización, calibración de lentes, etc..."
                    value={formWorkDone}
                    onChange={(e) => setFormWorkDone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Observaciones Técnicas</label>
                    <textarea
                      rows={2}
                      value={formObservations}
                      onChange={(e) => setFormObservations(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Recomendaciones al Cliente</label>
                    <textarea
                      rows={2}
                      value={formRecommendations}
                      onChange={(e) => setFormRecommendations(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Registro Fotográfico en Tiempo Real */}
            {step === 4 && (
              <div className="space-y-3 text-xs animate-fade-in">
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-white mb-1">Fotografías de las Instalaciones en Sitio</p>
                  <p className="text-[11px] text-slate-400">
                    Capture imágenes en tiempo real directamente con la cámara de su celular o seleccione de la galería. Se integrarán automáticamente en el PDF oficial.
                  </p>
                </div>

                <PhotoUploader photos={photos} onChange={setPhotos} maxPhotos={6} />
              </div>
            )}

            {/* STEP 5: Doble Firma Digital en Tiempo Real */}
            {step === 5 && (
              <div className="space-y-4 text-xs animate-fade-in">
                <div className="bg-cyan-950/30 border border-cyan-800/60 p-3 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
                  <p className="text-[11px] text-cyan-200">
                    <strong>Certificación Legal Digital:</strong> Las firmas manuscritas capturadas en esta pantalla quedarán estampadas de forma inmutable en el acta y en el PDF descargable.
                  </p>
                </div>

                {/* FIRMA 1: CLIENTE */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                    <PenTool className="w-4 h-4 text-cyan-400" />
                    1. Firma de Conformidad del Cliente / Interventor
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre del Cliente"
                      value={clientSigName}
                      onChange={(e) => setClientSigName(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Cédula / Documento"
                      value={clientSigDoc}
                      onChange={(e) => setClientSigDoc(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Cargo en la empresa"
                      value={clientSigRole}
                      onChange={(e) => setClientSigRole(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                  </div>
                  <SignaturePad
                    label="Firma Manuscrita del Cliente"
                    initialValue={clientSigBase64}
                    onSave={setClientSigBase64}
                  />
                </div>

                {/* FIRMA 2: RESPONSABLE LUXIA */}
                <div className="space-y-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <h4 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    2. Firma del Encargado / Ingeniero LUXIA
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nombre del Responsable"
                      value={luxiaSigName}
                      onChange={(e) => setLuxiaSigName(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Documento / Matrícula Profesional"
                      value={luxiaSigDoc}
                      onChange={(e) => setLuxiaSigDoc(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Cargo en LUXIA"
                      value={luxiaSigRole}
                      onChange={(e) => setLuxiaSigRole(e.target.value)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs"
                    />
                  </div>
                  <SignaturePad
                    label="Firma Manuscrita del Responsable LUXIA"
                    initialValue={luxiaSigBase64}
                    onSave={setLuxiaSigBase64}
                  />
                </div>
              </div>
            )}

            {/* Stepper Navigation buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </button>
              ) : (
                <div></div>
              )}

              {step < 5 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="flex items-center gap-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold shadow-md shadow-cyan-900/30"
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinalizeActa}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-xl shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar y Emitir Acta Oficial</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Visualización Detallada del Acta y Firmas */}
      {viewingActa && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-mono text-cyan-300 font-bold bg-slate-950 border border-cyan-800 px-2 py-0.5 rounded text-xs">
                  {viewingActa.code}
                </span>
                <h2 className="text-sm sm:text-base font-bold text-white">
                  {viewingActa.projectName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingActa(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <p><strong>Cliente:</strong> {viewingActa.clientName}</p>
                <p><strong>Contacto:</strong> {viewingActa.clientContact}</p>
                <p><strong>Dirección:</strong> {viewingActa.address}</p>
                <p><strong>Fecha:</strong> {viewingActa.createdAt}</p>
              </div>

              <div>
                <p className="font-bold text-slate-200 mb-0.5">Trabajos Realizados:</p>
                <p className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">{viewingActa.workDone}</p>
              </div>

              {/* Photos */}
              {viewingActa.photos.length > 0 && (
                <div>
                  <p className="font-bold text-slate-200 mb-1.5">Evidencias Fotográficas ({viewingActa.photos.length}):</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {viewingActa.photos.map((p) => (
                      <div key={p.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                        <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/75 p-1 text-[9px] text-slate-300 truncate">
                          {p.caption}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Signatures preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-300 text-[11px]">Firma del Cliente:</p>
                  {viewingActa.clientSignature?.signatureBase64 ? (
                    <div className="bg-white rounded-lg p-2 h-20 flex items-center justify-center">
                      <img
                        src={viewingActa.clientSignature.signatureBase64}
                        alt="Firma cliente"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 italic py-4 text-center">Sin firma registrada</p>
                  )}
                  <p className="font-semibold text-slate-200">{viewingActa.clientSignature?.signerName}</p>
                  <p className="text-[10px] text-slate-400">{viewingActa.clientSignature?.signerRoleOrJob}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <p className="font-bold text-slate-300 text-[11px]">Firma de LUXIA:</p>
                  {viewingActa.luxiaSignature?.signatureBase64 ? (
                    <div className="bg-white rounded-lg p-2 h-20 flex items-center justify-center">
                      <img
                        src={viewingActa.luxiaSignature.signatureBase64}
                        alt="Firma LUXIA"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-slate-500 italic py-4 text-center">Sin firma registrada</p>
                  )}
                  <p className="font-semibold text-slate-200">{viewingActa.luxiaSignature?.signerName}</p>
                  <p className="text-[10px] text-slate-400">{viewingActa.luxiaSignature?.signerRoleOrJob}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewingActa(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => handleDownloadPdf(viewingActa)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-900/30"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
