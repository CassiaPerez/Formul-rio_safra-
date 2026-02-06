import { Customer, Crop, Region, HarvestRecord } from '../types';

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1',
    name: 'AGROPECUÁRIA BOA ESPERANÇA LTDA',
    tradeName: 'FAZENDA BOA ESPERANÇA',
    regional: Region.CENTRO_OESTE,
    managerName: 'Carlos Mendes',
    sellerName: 'Roberto Silva',
    city: 'Sorriso',
    state: 'MT',
  },
  {
    id: '2',
    name: 'JOSÉ ALMEIDA CAMPOS',
    tradeName: 'SÍTIO RECANTO VERDE',
    regional: Region.SUL,
    managerName: 'Ana Souza',
    sellerName: 'Fernando Torres',
    city: 'Cascavel',
    state: 'PR',
  },
  {
    id: '3',
    name: 'GRUPO VANGUARDA AGRÍCOLA',
    tradeName: 'FAZENDA HORIZONTE',
    regional: Region.NORDESTE,
    managerName: 'Pedro Alcantara',
    sellerName: 'Mariana Costa',
    city: 'Luís Eduardo Magalhães',
    state: 'BA',
  },
];

export const MOCK_CROPS: Crop[] = [
  { id: '1', name: 'Soja' },
  { id: '2', name: 'Milho' },
  { id: '3', name: 'Algodão' },
  { id: '4', name: 'Trigo' },
  { id: '5', name: 'Café' },
  { id: '6', name: 'Cana-de-açúcar' },
];

export const generateRecordId = (): string => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `REG-${year}-${random}`;
};

export const MOCK_SUBMITTED_RECORDS: HarvestRecord[] = [
  {
    recordNumber: 'REG-24-1092',
    submissionDate: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
    status: 'PENDING',
    customerId: '1',
    propertyName: 'FAZENDA BOA ESPERANÇA',
    locationUrl: 'https://maps.google.com',
    cropId: '1',
    totalArea: 1500,
    plantedArea: 1200,
    registrationNumber: 'MT-99281',
    cprfCoordinates: '-12.54, -55.72',
    visits: [
      {
        id: '101',
        date: new Date(Date.now() - 172800000).toISOString(),
        stage: 'V4 - Desenvolvimento Vegetativo',
        opinion: 'Lavoura com excelente stand. Controle de daninhas eficiente.',
        author: 'Roberto Silva'
      }
    ],
    regional: Region.CENTRO_OESTE,
    managerName: 'Carlos Mendes',
    sellerName: 'Roberto Silva',
    city: 'Sorriso',
    state: 'MT'
  },
  {
    recordNumber: 'REG-24-3321',
    submissionDate: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
    status: 'PENDING',
    customerId: '3',
    propertyName: 'FAZENDA HORIZONTE',
    locationUrl: 'https://maps.google.com',
    cropId: '2',
    totalArea: 500,
    plantedArea: 500,
    registrationNumber: 'BA-11223',
    cprfCoordinates: '-12.15, -45.00',
    visits: [
      {
        id: '102',
        date: new Date().toISOString(),
        stage: 'R1 - Início do Florescimento',
        opinion: 'Identificado foco inicial de lagarta. Recomendado monitoramento diário.',
        author: 'Mariana Costa'
      }
    ],
    regional: Region.NORDESTE,
    managerName: 'Pedro Alcantara',
    sellerName: 'Mariana Costa',
    city: 'Luís Eduardo Magalhães',
    state: 'BA'
  },
  {
    recordNumber: 'REG-24-1001',
    submissionDate: new Date(Date.now() - 604800000).toISOString(), // 7 dias atrás
    status: 'APPROVED',
    customerId: '2',
    propertyName: 'SÍTIO RECANTO VERDE',
    locationUrl: 'https://maps.google.com',
    cropId: '5',
    totalArea: 200,
    plantedArea: 180,
    registrationNumber: 'PR-55112',
    cprfCoordinates: '-24.95, -53.45',
    visits: [],
    regional: Region.SUL,
    managerName: 'Ana Souza',
    sellerName: 'Fernando Torres',
    city: 'Cascavel',
    state: 'PR'
  },
  {
    recordNumber: 'REG-24-0055',
    submissionDate: new Date(Date.now() - 1209600000).toISOString(), // 14 dias atrás
    status: 'REJECTED',
    customerId: '1',
    propertyName: 'FAZENDA BOA ESPERANÇA - GLEBA B',
    locationUrl: 'https://maps.google.com',
    cropId: '1',
    totalArea: 500,
    plantedArea: 500,
    registrationNumber: 'MT-99282',
    cprfCoordinates: '-12.55, -55.73',
    visits: [],
    regional: Region.CENTRO_OESTE,
    managerName: 'Carlos Mendes',
    sellerName: 'Roberto Silva',
    city: 'Sorriso',
    state: 'MT'
  }
];