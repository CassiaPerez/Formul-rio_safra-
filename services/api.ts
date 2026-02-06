import { Customer, Region } from '../types';
import { MOCK_CUSTOMERS } from './mockData';

const API_URL = "https://arabella-pulverable-davon.ngrok-free.dev/api/Clientes?nome_fixo=Clientes&page=1&limit=1000&format=json&api_key=a4d8c7f12e3b4c9a9f6e9e2a1b4d7c8f2a3e6d1f8b9c0a2e5f7a8d9c3e4b";

export const fetchCustomers = async (): Promise<Customer[]> => {
  try {
    // Adiciona Timeout de 5 segundos para evitar hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(API_URL, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`API Indisponível (${response.status}). Utilizando dados locais.`);
      return MOCK_CUSTOMERS;
    }
    
    const json = await response.json();
    
    // Tenta identificar onde está a lista de dados (data, items, ou raiz)
    const list = Array.isArray(json) ? json : (json.data || json.items || []);

    if (!list || list.length === 0) {
        return MOCK_CUSTOMERS;
    }

    return list.map((item: any) => ({
      id: String(item.id || item.Id || item.codigo || item.Codigo || Math.random()),
      name: item.RazaoSocial || item.razao_social || item.nome || item.Nome || "Nome Desconhecido",
      tradeName: item.NomeFantasia || item.nome_fantasia || item.tradeName || item.Fantasia || item.RazaoSocial || "",
      regional: mapRegional(item.Regional || item.regional),
      managerName: item.Gerente || item.gerente || item.Manager || "",
      sellerName: item.Vendedor || item.vendedor || item.Seller || "",
      city: item.Cidade || item.cidade || item.City || "",
      state: item.UF || item.uf || item.State || ""
    }));
  } catch (error) {
    // Silencia o erro 'Failed to fetch' tratando como modo offline
    console.warn("Modo Offline: API não acessível. Carregando dados de demonstração.");
    return MOCK_CUSTOMERS;
  }
};

const mapRegional = (val: string): Region => {
  if (!val) return Region.CENTRO_OESTE;
  
  const normalized = String(val).toUpperCase().trim();
  
  if (normalized.includes('SUL')) return Region.SUL;
  if (normalized.includes('NORDESTE')) return Region.NORDESTE;
  if (normalized.includes('NORTE')) return Region.NORTE;
  if (normalized.includes('SUDESTE')) return Region.SUDESTE;
  
  return Region.CENTRO_OESTE;
};