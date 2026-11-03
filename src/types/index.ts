export type UserRole = 'director' | 'supervisor' | 'ingeniero' | 'tecnico';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  specialty?: string;
  active: boolean;
  documentId?: string;
}

export type ProjectStatus = 'activo' | 'en_pausa' | 'entregado' | 'en_garantia';

export interface Project {
  id: string;
  code: string;
  name: string;
  clientName: string;
  clientContact: string;
  clientPhone: string;
  location: string;
  city: string;
  status: ProjectStatus;
  supervisorId: string;
  supervisorName: string;
  contractorId?: string;
  contractorName?: string;
  startDate: string;
  estimatedEndDate: string;
  progressPercent: number;
  systemTypes: string[];
}

export type TaskPriority = 'alta' | 'media' | 'baja';
export type TaskStatus = 'pendiente' | 'en_progreso' | 'en_revision' | 'completada';

export interface TaskChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface TaskPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
}

export interface TaskComment {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  timestamp: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  assignedToId: string;
  assignedToName: string;
  assignedRole: UserRole;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  locationTag?: string;
  checklist: TaskChecklistItem[];
  photos: TaskPhoto[];
  comments: TaskComment[];
  createdAt: string;
}

export type ActaType = 'visita_tecnica' | 'servicio_mantenimiento' | 'entrega_satisfaccion';

export interface EquipmentItem {
  id: string;
  type: string; // e.g. "Cámara IP", "NVR", "Controladora", "Lector Biométrico", "Panel Incendio"
  brand: string;
  model: string;
  serial: string;
  location: string;
  status: 'operativo' | 'instalado' | 'reparado' | 'pendiente_cambio';
}

export interface PhotoEvidence {
  id: string;
  url: string;
  caption: string;
  category: 'antes' | 'durante' | 'despues' | 'detalle_rack' | 'equipos';
  timestamp: string;
}

export interface SignatureData {
  signatureBase64: string;
  signerName: string;
  signerDocument: string;
  signerRoleOrJob: string;
  date: string;
}

export interface TechnicalActa {
  id: string;
  code: string; // e.g. ACT-LUX-2026-042
  type: ActaType;
  projectId: string;
  projectName: string;
  clientName: string;
  clientContact: string;
  clientPhone: string;
  address: string;
  city: string;
  createdById: string;
  createdByName: string;
  createdRole: UserRole;
  createdAt: string;
  systemTypes: string[];
  objective: string;
  workDone: string;
  observations: string;
  recommendations: string;
  equipment: EquipmentItem[];
  photos: PhotoEvidence[];
  clientSignature?: SignatureData;
  luxiaSignature?: SignatureData;
  status: 'borrador' | 'firmada' | 'archivada';
}

export interface ContractorEvaluation {
  id: string;
  contractorId: string;
  contractorName: string;
  projectId: string;
  projectName: string;
  evaluatedById: string;
  evaluatedByName: string;
  evaluatedRole: UserRole;
  date: string;
  // Criteria (0 - 100)
  calidadInstalacion: number;       // Peso 25%
  cumplimientoCronograma: number;   // Peso 20%
  seguridadSST: number;             // Peso 20%
  rotuladoYPruebas: number;         // Peso 20%
  ordenYAseo: number;               // Peso 15%
  totalScore: number;               // 0 - 100
  comments: string;
  approvedForNextProjects: boolean;
}

export interface Contractor {
  id: string;
  name: string;
  nit: string;
  contactPerson: string;
  phone: string;
  email: string;
  specialty: string[];
  active: boolean;
  totalProjects: number;
  averageScore: number;
  rankingPosition?: number;
  recommendationLevel: 'prioritario' | 'estandar' | 'en_observacion' | 'no_recomendado';
  notes?: string;
}
