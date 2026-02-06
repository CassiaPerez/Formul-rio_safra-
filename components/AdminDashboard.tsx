import React, { useState } from 'react';
import { HarvestRecord, Crop, Customer, RecordStatus } from '../types';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Download,
  Calendar,
  Filter
} from 'lucide-react';

interface AdminDashboardProps {
  records: HarvestRecord[];
  customers: Customer[];
  crops: Crop[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ records, customers, crops }) => {
  const [filterStatus, setFilterStatus] = useState<RecordStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Helper to resolve name: Check manual name first, then ID lookup
  const getCustomerName = (record: HarvestRecord) => {
    if (record.customerName && record.customerName.trim() !== '') {
        return record.customerName;
    }
    return customers.find(c => c.id === record.customerId)?.name || 'Cliente Desconhecido';
  };

  const getCropName = (id: string) => crops.find(c => c.id === id)?.name || 'Cultura Desconhecida';

  // Filter Logic
  const filteredRecords = records.filter(r => {
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    
    const searchLower = searchTerm.toLowerCase();
    const customerName = getCustomerName(r).toLowerCase();
    const recordId = r.recordNumber.toLowerCase();
    const city = r.city.toLowerCase();

    const matchesSearch = customerName.includes(searchLower) || 
                          recordId.includes(searchLower) ||
                          city.includes(searchLower);

    return matchesStatus && matchesSearch;
  });

  // Statistics
  const totalArea = records.reduce((acc, curr) => acc + (curr.plantedArea || 0), 0);
  const pendingCount = records.filter(r => r.status === 'PENDING').length;
  const approvedCount = records.filter(r => r.status === 'APPROVED').length;

  const StatusBadge = ({ status }: { status?: RecordStatus }) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle size={12}/> Aprovado</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><XCircle size={12}/> Rejeitado</span>;
      case 'PENDING':
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200"><Clock size={12}/> Pendente</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-modern border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1 bg-slate-400 group-hover:w-2 transition-all"></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total de Registros</p>
          <p className="text-3xl font-bold text-slate-800">{records.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-modern border border-slate-100 relative overflow-hidden group">
          <div className="absolute right-0 top-0 h-full w-1 bg-agro-500 group-hover:w-2 transition-all"></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Área Monitorada (ha)</p>
          <p className="text-3xl font-bold text-agro-700">{totalArea.toLocaleString('pt-BR')}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-modern border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500 group-hover:w-2 transition-all"></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Aprovados</p>
          <p className="text-3xl font-bold text-emerald-600">{approvedCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-modern border border-slate-100 relative overflow-hidden group">
           <div className="absolute right-0 top-0 h-full w-1 bg-amber-500 group-hover:w-2 transition-all"></div>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Pendentes</p>
          <p className="text-3xl font-bold text-amber-500">{pendingCount}</p>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-modern-lg border border-slate-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <span className="text-slate-400 mr-2"><Filter size={18}/></span>
                {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status as any)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide transition-all uppercase ${
                            filterStatus === status 
                            ? 'bg-agro-900 text-white shadow-md shadow-agro-900/20' 
                            : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50'
                        }`}
                    >
                        {status === 'ALL' ? 'Todos' : status === 'PENDING' ? 'Pendentes' : status === 'APPROVED' ? 'Aprovados' : 'Rejeitados'}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-400 h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Buscar cliente, cidade ou registro..." 
                        className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm w-full focus:ring-2 focus:ring-agro-500 focus:border-agro-500 bg-white text-slate-900 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors" title="Exportar">
                    <Download size={20} />
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/80">
                    <tr>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Registro</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente / Propriedade</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Local</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Cultura</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Área (ha)</th>
                        <th className="px-8 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                    {filteredRecords.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-16 text-center text-slate-500 flex flex-col items-center">
                                <Search size={48} className="text-slate-200 mb-4"/>
                                <p className="font-medium">Nenhum registro encontrado.</p>
                                <p className="text-sm">Tente ajustar seus filtros de busca.</p>
                            </td>
                        </tr>
                    ) : (
                        filteredRecords.map((record) => (
                            <tr key={record.recordNumber} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="text-sm font-bold text-agro-900 group-hover:text-agro-600 transition-colors">{record.recordNumber}</div>
                                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                                        <Calendar size={10} />
                                        {new Date(record.submissionDate || '').toLocaleDateString('pt-BR')}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="text-sm font-bold text-slate-800">{getCustomerName(record)}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">{record.propertyName}</div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <div className="text-sm text-slate-700">{record.city}</div>
                                    <div className="text-xs text-slate-400">{record.state}</div>
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600 font-medium">
                                    {getCropName(record.cropId)}
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-600">
                                    {record.plantedArea}
                                </td>
                                <td className="px-8 py-5 whitespace-nowrap">
                                    <StatusBadge status={record.status} />
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};