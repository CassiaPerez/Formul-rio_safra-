import React, { useState } from 'react';
import { TechnicalVisit } from '../types';
import { TextArea, Input } from './Input';
import { PlusCircle, History, User } from 'lucide-react';

interface HistorySectionProps {
  visits: TechnicalVisit[];
  onAddVisit: (visit: TechnicalVisit) => void;
  currentUser: string; // The seller/technician currently logged in
}

export const HistorySection: React.FC<HistorySectionProps> = ({ visits, onAddVisit, currentUser }) => {
  const [newStage, setNewStage] = useState('');
  const [newOpinion, setNewOpinion] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);

  const handleAdd = () => {
    if (!newStage || !newOpinion || !newDate) return;

    // Create a date object using the selected date and current time
    // This preserves the day selected by the user while keeping chronological order valid with time
    const [year, month, day] = newDate.split('-').map(Number);
    const now = new Date();
    const dateObj = new Date(year, month - 1, day, now.getHours(), now.getMinutes(), now.getSeconds());

    const newVisit: TechnicalVisit = {
      id: Date.now().toString(),
      date: dateObj.toISOString(),
      stage: newStage,
      opinion: newOpinion,
      author: currentUser
    };

    onAddVisit(newVisit);
    setNewStage('');
    setNewOpinion('');
    // Reset date to today after adding, or keep it? Resetting is standard.
    setNewDate(new Date().toISOString().split('T')[0]);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="mt-8 border-t-4 border-agro-500 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <History className="text-agro-700 h-6 w-6" />
        <h2 className="text-xl font-bold text-gray-900 uppercase">Histórico de Acompanhamento</h2>
      </div>

      {/* List of Previous Records */}
      <div className="space-y-4 mb-8">
        {visits.length === 0 ? (
          <p className="text-gray-500 italic text-sm">Nenhum registro anterior encontrado.</p>
        ) : (
          visits.slice().reverse().map((visit) => (
            <div key={visit.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative pl-6 overflow-hidden">
               <div className="absolute left-0 top-0 bottom-0 w-2 bg-agro-400"></div>
               <div className="flex justify-between items-start mb-2">
                 <div>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Data Atualizada</span>
                    <p className="text-sm font-medium text-gray-900">{formatDate(visit.date)}</p>
                 </div>
                 <div className="text-right">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Responsável</span>
                    <div className="flex items-center justify-end gap-1 text-sm text-gray-700">
                        <User size={14} />
                        {visit.author}
                    </div>
                 </div>
               </div>

               <div className="mb-2">
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Estádio Atualizado</span>
                 <p className="text-gray-800 font-semibold">{visit.stage}</p>
               </div>

               <div>
                 <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Parecer Técnico</span>
                 <p className="text-gray-700 text-sm whitespace-pre-wrap mt-1">{visit.opinion}</p>
               </div>
            </div>
          ))
        )}
      </div>

      {/* New Entry Form */}
      <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-4 border-b border-yellow-200 pb-2">Novo Acompanhamento</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
                label="Data Atualizada"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-white"
            />
             <Input
                label="Estádio Atualizado da Planta"
                value={newStage}
                onChange={(e) => setNewStage(e.target.value)}
                placeholder="Ex: V4, R1, Enchimento de grãos..."
            />
        </div>

        <TextArea
            label="Parecer Técnico"
            value={newOpinion}
            onChange={(e) => setNewOpinion(e.target.value)}
            placeholder=""
            rows={4}
        />

        <div className="flex justify-end">
            <button
                onClick={handleAdd}
                disabled={!newStage || !newOpinion || !newDate}
                className="flex items-center gap-2 bg-agro-600 hover:bg-agro-700 text-white px-6 py-2 rounded-md font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusCircle size={20} />
                Adicionar Visita
            </button>
        </div>
      </div>
    </div>
  );
};