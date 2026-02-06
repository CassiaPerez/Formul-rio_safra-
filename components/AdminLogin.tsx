import React, { useState } from 'react';
import { Lock, User, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Verifica as credenciais na tabela 'admins' do Supabase
      const { data, error: dbError } = await supabase
        .from('admins')
        .select('*')
        .eq('username', username)
        .eq('password', password) // Nota: Em produção real, use hash ou Supabase Auth
        .single();

      if (dbError || !data) {
        setError('Credenciais inválidas ou usuário não encontrado.');
      } else {
        // Login bem-sucedido
        onLoginSuccess();
      }
    } catch (err) {
      console.error(err);
      setError('Erro de conexão ao validar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-agro-800 px-6 py-8 text-center relative overflow-hidden">
           {/* Background Pattern */}
           <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <svg width="100%" height="100%">
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
           </div>
           
           <div className="relative z-10 flex flex-col items-center">
             <div className="bg-white/20 p-3 rounded-full mb-3 backdrop-blur-sm">
                <ShieldCheck className="text-white h-10 w-10" />
             </div>
             <h2 className="text-2xl font-bold text-white">Acesso Administrativo</h2>
             <p className="text-agro-200 text-sm mt-1">Área restrita para gestão de safra</p>
           </div>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center gap-2 border border-red-100 animate-pulse">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                type="text"
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-agro-500 focus:ring-agro-500 sm:text-sm px-3 py-3 border bg-white text-gray-900 transition-colors"
                autoFocus
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <KeyRound size={18} />
              </div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-agro-500 focus:ring-agro-500 sm:text-sm px-3 py-3 border bg-white text-gray-900 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-agro-700 hover:bg-agro-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-agro-500 transition-all ${
              isLoading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {isLoading ? 'Verificando...' : 'Entrar no Painel'}
          </button>
          
          <div className="text-center">
            <p className="text-xs text-gray-400">
              Banco de dados conectado
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};