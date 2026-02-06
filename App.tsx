import React, { useState, useEffect } from 'react';
import { Customer, HarvestRecord, TechnicalVisit } from './types';
import { generateRecordId } from './services/mockData';
import { fetchCustomers, fetchCrops, fetchHarvestRecords, saveHarvestRecord } from './services/api';
import { Input, Select } from './components/Input';
import { HistorySection } from './components/HistorySection';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { Sidebar } from './components/Sidebar';
import { MapPin, Save, Building2, Map, Share2, Menu, X, Sprout } from 'lucide-react';
import { supabase } from './lib/supabase';

// Initial empty state for new form
const INITIAL_RECORD: HarvestRecord = {
  recordNumber: '',
  customerId: 'MANUAL',
  customerName: '',
  propertyName: '',
  locationUrl: '',
  cropId: '',
  totalArea: 0,
  plantedArea: 0,
  registrationNumber: '',
  cprfCoordinates: '',
  visits: [],
  regional: '',
  managerName: '',
  sellerName: '',
  city: '',
  state: ''
};

const App: React.FC = () => {
  // Navigation State
  const [currentView, setCurrentView] = useState<'form' | 'admin'>('form');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Auth State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Data State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [crops, setCrops] = useState<{ id: string; name: string }[]>([]);

  // Form State
  const [record, setRecord] = useState<HarvestRecord>(INITIAL_RECORD);
  const [isLoadingLoc, setIsLoadingLoc] = useState(false);
  const [isLoadingCprf, setIsLoadingCprf] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Validation State
  const [submittedRecords, setSubmittedRecords] = useState<HarvestRecord[]>([]);

  useEffect(() => {
    setRecord(prev => ({ ...prev, recordNumber: generateRecordId() }));

    const loadData = async () => {
      const [customersData, cropsData, recordsData] = await Promise.all([
        fetchCustomers(),
        fetchCrops(),
        fetchHarvestRecords()
      ]);
      setCustomers(customersData);
      setCrops(cropsData);
      setSubmittedRecords(recordsData);
    };

    loadData();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        if (session?.user) {
          const isAdmin = session.user.user_metadata?.is_admin === true;
          setIsAdminAuthenticated(isAdmin);
        } else {
          setIsAdminAuthenticated(false);
        }
      })();
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleRecordChange = (field: keyof HarvestRecord, value: string | number) => {
    setRecord(prev => ({ ...prev, [field]: value }));
  };

  const getGeolocation = (targetField: 'locationUrl' | 'cprfCoordinates') => {
    const loadingSetter = targetField === 'locationUrl' ? setIsLoadingLoc : setIsLoadingCprf;

    if (!navigator.geolocation) {
      alert("Geolocalização não é suportada neste navegador.");
      return;
    }

    loadingSetter(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        if (targetField === 'locationUrl') {
          const link = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
          handleRecordChange('locationUrl', link);
        } else {
          handleRecordChange('cprfCoordinates', `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        loadingSetter(false);
      },
      (error) => {
        console.error(error);
        alert("Erro ao obter localização. Verifique as permissões.");
        loadingSetter(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleAddVisit = (visit: TechnicalVisit) => {
    setRecord(prev => ({
      ...prev,
      visits: [...prev.visits, visit]
    }));
  };

  const handleSave = async () => {
    if (!record.customerName || !record.cropId) {
      alert("Por favor, preencha o Nome do Cliente e a Cultura.");
      return;
    }

    setSaveStatus('saving');

    try {
      const newRecord = {
        ...record,
        customerId: 'MANUAL',
        status: 'PENDING' as const,
        submissionDate: new Date().toISOString()
      };

      const savedRecord = await saveHarvestRecord(newRecord);

      if (savedRecord) {
        setSubmittedRecords(prev => [savedRecord, ...prev]);
        setSaveStatus('saved');

        setTimeout(() => {
          setSaveStatus('idle');
          setRecord({ ...INITIAL_RECORD, recordNumber: generateRecordId() });
          alert("Registro enviado para validação com sucesso!");
        }, 1500);
      } else {
        setSaveStatus('idle');
        alert("Erro ao salvar registro. Tente novamente.");
      }
    } catch (error) {
      console.error('Error saving record:', error);
      setSaveStatus('idle');
      alert("Erro ao salvar registro. Tente novamente.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAdminAuthenticated(false);
    setCurrentView('form');
  };

  const currentUsername = currentView === 'admin' && isAdminAuthenticated 
    ? 'Administrador' 
    : (record.sellerName || 'Usuário');

  return (
    <div className="flex min-h-screen bg-page font-sans text-slate-800">
      
      {/* Sidebar - Desktop */}
      <Sidebar 
        currentView={currentView}
        onChangeView={setCurrentView}
        isAuthenticated={isAdminAuthenticated}
        onLogout={handleLogout}
        username={currentUsername}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-72 min-w-0 transition-all duration-300">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-agro-950 text-white shadow-md sticky top-0 z-40">
           <div className="px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="bg-agro-600 p-1.5 rounded-lg">
                   <Sprout size={20} className="text-white" />
                 </div>
                 <span className="font-bold text-lg tracking-tight">AgroTech</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
                 {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
           </div>
           
           {/* Mobile Menu Dropdown */}
           {isMobileMenuOpen && (
             <div className="bg-agro-900 border-t border-agro-800 px-4 py-3 space-y-2 absolute w-full shadow-2xl">
                <button 
                  onClick={() => { setCurrentView('form'); setIsMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg text-sm font-medium ${currentView === 'form' ? 'bg-agro-800 text-white' : 'text-agro-200 hover:bg-agro-800/50'}`}
                >
                  Nova Visita
                </button>
                <button 
                  onClick={() => { setCurrentView('admin'); setIsMobileMenuOpen(false); }}
                  className={`block w-full text-left py-3 px-4 rounded-lg text-sm font-medium ${currentView === 'admin' ? 'bg-agro-800 text-white' : 'text-agro-200 hover:bg-agro-800/50'}`}
                >
                  Painel Admin
                </button>
                {isAdminAuthenticated && currentView === 'admin' && (
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="block w-full text-left py-3 px-4 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/20 mt-2 border-t border-agro-800 pt-4"
                  >
                    Sair
                  </button>
                )}
             </div>
           )}
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            
            {/* View Title Area */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
               <div>
                 <h2 className="text-3xl font-bold text-agro-900 tracking-tight">
                    {currentView === 'form' ? 'Registro de Safra' : 'Administração'}
                 </h2>
                 <p className="text-slate-500 mt-2 text-sm font-medium">
                    {currentView === 'form' 
                      ? 'Preencha os dados abaixo para registrar um novo acompanhamento de campo.' 
                      : 'Gerenciamento estratégico e validação de registros.'}
                 </p>
               </div>
               {currentView === 'form' && (
                 <div className="hidden md:block">
                    <span className="bg-white px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 shadow-modern border border-slate-100 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                       {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                 </div>
               )}
            </div>

            {currentView === 'admin' && (
              <>
                {!isAdminAuthenticated ? (
                  <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />
                ) : (
                  <AdminDashboard
                    records={submittedRecords}
                    customers={customers}
                    crops={crops}
                  />
                )}
              </>
            )}

            {currentView === 'form' && (
              <div className="bg-white rounded-2xl shadow-modern-lg border border-slate-100 overflow-hidden animate-fade-in relative">
                
                {/* Form Header Status */}
                <div className="bg-white border-b border-slate-100 px-8 py-6 flex justify-between items-center flex-wrap gap-4 sticky top-0 z-10 bg-opacity-95 backdrop-blur-sm">
                  <div>
                    <span className="text-[10px] text-agro-500 font-bold uppercase block tracking-widest mb-1.5">Identificador do Registro</span>
                    <span className="text-2xl font-mono font-bold text-agro-900 bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200">{record.recordNumber}</span>
                  </div>
                  {saveStatus === 'saved' && (
                    <span className="bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2 border border-emerald-100 shadow-sm">
                      <Save size={18} /> Registro Enviado!
                    </span>
                  )}
                </div>

                <div className="p-6 md:p-10 space-y-12">

                  {/* Section 1: Customer Identification */}
                  <section className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-agro-900 mb-8 flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-agro-600 border border-slate-100">
                        <Building2 size={22} />
                      </div>
                      Identificação do Cliente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-3">
                          <Input
                              label="Nome do Cliente / Razão Social"
                              value={record.customerName || ''}
                              onChange={(e) => handleRecordChange('customerName', e.target.value)}
                              placeholder="Digite o nome completo..."
                              autoFocus
                              autoComplete="off"
                              className="bg-white"
                          />
                      </div>
                      <Input
                          label="Regional"
                          value={record.regional}
                          onChange={(e) => handleRecordChange('regional', e.target.value)}
                          placeholder="Ex: SUL, NORTE..."
                      />
                      <Input
                          label="Gerente"
                          value={record.managerName}
                          onChange={(e) => handleRecordChange('managerName', e.target.value)}
                          placeholder="Nome do Gerente"
                      />
                      <Input
                          label="Vendedor Responsável"
                          value={record.sellerName}
                          onChange={(e) => handleRecordChange('sellerName', e.target.value)}
                          placeholder="Nome do Vendedor"
                      />
                      <div className="lg:col-span-2">
                          <Input
                            label="Cidade"
                            value={record.city}
                            onChange={(e) => handleRecordChange('city', e.target.value)}
                            placeholder="Cidade"
                          />
                      </div>
                      <div>
                          <Input
                            label="Estado (UF)"
                            value={record.state}
                            onChange={(e) => handleRecordChange('state', e.target.value)}
                            placeholder="UF"
                            maxLength={2}
                          />
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Property & Crop Details */}
                  <section className="bg-slate-50/50 p-8 rounded-2xl border border-slate-100">
                    <h3 className="text-xl font-bold text-agro-900 mb-8 flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-agro-600 border border-slate-100">
                        <Map size={22} />
                      </div>
                      Dados da Propriedade e Cultura
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nome da Propriedade"
                        value={record.propertyName}
                        onChange={(e) => handleRecordChange('propertyName', e.target.value)}
                        placeholder="Nome fantasia da fazenda/sítio"
                      />

                      <Select
                        label="Cultura"
                        options={crops.map(c => ({ value: c.id, label: c.name }))}
                        value={record.cropId}
                        onChange={(e) => handleRecordChange('cropId', e.target.value)}
                      />

                      <div className="relative">
                        <Input
                          label="Localização (Google Maps)"
                          value={record.locationUrl}
                          onChange={(e) => handleRecordChange('locationUrl', e.target.value)}
                          placeholder="https://maps.google.com/..."
                        />
                        <button
                          onClick={() => getGeolocation('locationUrl')}
                          className="absolute right-2 top-8 p-2 text-agro-600 hover:bg-agro-50 rounded-lg transition-colors"
                          title="Obter Localização Atual"
                        >
                          {isLoadingLoc ? <span className="animate-spin block w-5 h-5 border-2 border-agro-600 border-t-transparent rounded-full"></span> : <MapPin size={20} />}
                        </button>
                      </div>

                      <div className="relative">
                        <Input
                          label="Coordenadas (CPRF)"
                          value={record.cprfCoordinates}
                          onChange={(e) => handleRecordChange('cprfCoordinates', e.target.value)}
                          placeholder="Latitude, Longitude"
                        />
                        <button
                          onClick={() => getGeolocation('cprfCoordinates')}
                          className="absolute right-2 top-8 p-2 text-agro-600 hover:bg-agro-50 rounded-lg transition-colors"
                          title="Obter Coordenadas Exatas"
                        >
                          {isLoadingCprf ? <span className="animate-spin block w-5 h-5 border-2 border-agro-600 border-t-transparent rounded-full"></span> : <Share2 size={20} />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200 border-dashed">
                        <Input
                          label="Área Total (ha)"
                          type="number"
                          value={record.totalArea || ''}
                          onChange={(e) => handleRecordChange('totalArea', parseFloat(e.target.value))}
                          min={0}
                        />
                        <Input
                          label="Área Plantada (ha)"
                          type="number"
                          value={record.plantedArea || ''}
                          onChange={(e) => handleRecordChange('plantedArea', parseFloat(e.target.value))}
                          min={0}
                        />
                        <Input
                          label="Matrícula da Área"
                          value={record.registrationNumber}
                          onChange={(e) => handleRecordChange('registrationNumber', e.target.value)}
                          placeholder="Ex: 12345"
                        />
                    </div>
                  </section>

                  {/* Section 3: History */}
                  <HistorySection
                      visits={record.visits}
                      onAddVisit={handleAddVisit}
                      currentUser={record.sellerName || 'Técnico Atual'}
                  />

                </div>

                {/* Footer Actions */}
                <div className="bg-slate-50 border-t border-slate-100 px-8 py-6 flex justify-between items-center sticky bottom-0 z-10">
                  <span className="text-xs text-slate-400 hidden md:inline font-medium">
                      * Todos os campos são obrigatórios para a validação.
                  </span>
                  <button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      className={`flex items-center gap-2.5 bg-agro-700 hover:bg-agro-600 text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-agro-700/20 transition-all active:scale-95 hover:-translate-y-0.5 ${saveStatus === 'saving' ? 'opacity-80 cursor-wait' : ''}`}
                  >
                      {saveStatus === 'saving' ? (
                          <>Processando...</>
                      ) : (
                          <>
                              <Save size={20} />
                              Confirmar Envio
                          </>
                      )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;