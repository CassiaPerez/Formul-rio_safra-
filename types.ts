export enum Region {
  SUL = 'SUL',
  SUDESTE = 'SUDESTE',
  CENTRO_OESTE = 'CENTRO_OESTE',
  NORTE = 'NORTE',
  NORDESTE = 'NORDESTE',
}

export interface Customer {
  id: string;
  name: string;
  tradeName: string; // Nome Fantasia
  regional: Region;
  managerName: string;
  sellerName: string; // Vendedor responsável
  city: string;
  state: string;
}

export interface Crop {
  id: string;
  name: string;
}

export interface TechnicalVisit {
  id: string;
  date: string; // ISO Date
  stage: string; // Estádio fenológico
  opinion: string; // Parecer técnico
  author: string; // Nome do técnico/vendedor que registrou
}

export interface HarvestImage {
  id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  url?: string;
}

export type RecordStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface HarvestRecord {
  recordNumber: string; // NR DO REGISTRO
  submissionDate?: string; // Data de envio
  status?: RecordStatus;
  customerId: string;
  customerName?: string; // Nome do Cliente (Razão Social) - Optional/Manual
  propertyName: string;
  locationUrl: string; // Link do Google Maps
  cropId: string;
  totalArea: number; // Hectares
  plantedArea: number; // Hectares
  registrationNumber: string; // Matrícula da Área
  cprfCoordinates: string; // Lat, Long da CPRF
  visits: TechnicalVisit[];
  images?: HarvestImage[];
  // Manual fields for snapshot
  regional: string;
  managerName: string;
  sellerName: string;
  city: string;
  state: string;
}