import React from 'react';
import { HarvestRecord, Crop, Customer } from '../types';
import { CheckCircle, XCircle, Clock, FileText, User, MapPin } from 'lucide-react';

interface ValidationQueueProps {
  records: HarvestRecord[];
  customers: Customer[];
  crops: Crop[];
  onValidate: (recordNumber: string, approved: boolean) => void;
}

export const ValidationQueue: React.FC<ValidationQueueProps> = ({ records, customers, crops, onValidate }) => {
  const pendingRecords = records.filter(r => r.status === 'PENDING');

  const getCustomerName = (id: string) => customers.find(c => c.id === id)?.name || 'Cliente Desconhecido';
  const getCropName = (id: string) => crops.find(c => c.id === id)?.name || 'Cultura Desconhecida';

  if (pendingRecords.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">Tudo em dia!</h3>
        <p className="text-gray-500">Não há registros pendentes de validação no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Clock className="text-orange-500" />
          Fila de Validação
          <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">
            {pendingRecords.length} Pendentes
          </span>
        </h2>
      </div>

      <div className="grid gap-6">
        {pendingRecords.map((record) => {
          const lastVisit = record.visits[record.visits.length - 1];
          return (
            <div key={record.recordNumber} className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {record.recordNumber}
                      </span>
                      <span className="text-xs text-gray-400">
                        Enviado em: {new Date(record.submissionDate || '').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{getCustomerName(record.customerId)}</h3>
                    <p className="text-sm text-gray-600 font-medium">{record.propertyName} • {getCropName(record.cropId)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onValidate(record.recordNumber, false)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <XCircle size={16} /> Rejeitar
                    </button>
                    <button
                      onClick={() => onValidate(record.recordNumber, true)}
                      className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm"
                    >
                      <CheckCircle size={16} /> Aprovar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-md mb-4 border border-slate-100">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin size={16} className="text-slate-400" />
                      <span>Área Plantada: <strong>{record.plantedArea} ha</strong> / Total: {record.totalArea} ha</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <FileText size={16} className="text-slate-400" />
                      <span>Matrícula: {record.registrationNumber}</span>
                    </div>
                  </div>
                  {lastVisit && (
                    <div className="space-y-1 border-l-2 border-orange-200 pl-3">
                      <p className="text-xs font-bold text-orange-600 uppercase">Última Atualização</p>
                      <p className="text-sm font-semibold text-gray-800">{lastVisit.stage}</p>
                      <p className="text-sm text-gray-600 italic line-clamp-2">"{lastVisit.opinion}"</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <User size={12} />
                        {lastVisit.author}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};