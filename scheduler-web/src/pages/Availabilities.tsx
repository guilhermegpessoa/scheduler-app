import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Attendant {
  id: number;
  name: string;
  role: string;
}

export const Availabilities: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [selectedAttendant, setSelectedAttendant] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [isActive, setIsActive] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/users').then((res) => {
      const onlyAttendants = res.data.filter(
        (u: any) => u.role === 'attendant',
      );
      setAttendants(onlyAttendants);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (endTime <= startTime) {
      setError('A hora final deve ser maior que a hora inicial.');
      return;
    }

    if (!selectedAttendant) {
      setError('Selecione um atendente.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/availabilities', {
        user_id: Number(selectedAttendant),
        day_of_week: Number(dayOfWeek),
        start_time: startTime,
        end_time: endTime,
        is_active: isActive,
      });
      setMessage('Disponibilidade configurada com sucesso!');
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Erro ao salvar disponibilidade.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (currentUser?.role !== 'administrator') {
    return (
      <div className="p-6 text-red-600 font-medium">
        Acesso restrito a administradores.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        ⚙️ Cadastro de Disponibilidade do Atendente
      </h1>

      {message && (
        <div className="bg-green-50 text-green-700 p-3 rounded mb-4 border border-green-200">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded mb-4 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Atendente *
            </label>
            <select
              value={selectedAttendant}
              onChange={(e) => setSelectedAttendant(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 bg-white"
            >
              <option value="">Selecione um atendente...</option>
              {attendants.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dia da Semana *
            </label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(e.target.value)}
              className="mt-1 block w-full rounded border border-gray-300 p-2 bg-white"
            >
              <option value="0">Segunda-feira</option>
              <option value="1">Terça-feira</option>
              <option value="2">Quarta-feira</option>
              <option value="3">Quinta-feira</option>
              <option value="4">Sexta-feira</option>
              <option value="5">Sábado</option>
              <option value="6">Domingo</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora Inicial *
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora Final *
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 block w-full rounded border border-gray-300 p-2"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900 font-medium"
            >
              Disponibilidade Ativa *
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded font-medium transition disabled:bg-indigo-400"
          >
            {loading ? 'Salvando...' : 'Salvar Disponibilidade'}
          </button>
        </form>
      </div>
    </div>
  );
};
