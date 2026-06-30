import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signIn({ email, password });
    } catch (err: any) {
      // RQNF3 - Dynamic handling of errors from the backend
      if (!err.response) {
        setError(
          'Não foi possível conectar ao servidor. Verifique se a API está ativa.',
        );
      } else if (err.response.status === 500) {
        setError(
          'Erro interno no servidor (500). Por favor, verifique os logs do backend.',
        );
      } else if (err.response.status === 401) {
        setError('Credenciais inválidas. Verifique o e-mail e a senha.');
      } else {
        setError(
          err.response.data?.message ||
            'Ocorreu um erro inesperado ao tentar entrar.',
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Acesso ao Sistema
        </h2>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              E-mail *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha *
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded font-medium transition disabled:bg-indigo-400"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};
