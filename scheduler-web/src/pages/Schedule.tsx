import React, { useState, useEffect } from 'react';
import api from '../services/api';

interface Attendant {
  id: number;
  name: string;
  role: string;
}

interface TimeSlot {
  start: string;
  end: string;
}

export const Schedule: React.FC = () => {
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [selectedAttendantId, setSelectedAttendantId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api
      .get('/users')
      .then((res) => {
        const onlyAttendants = res.data.filter(
          (u: any) => u.role === 'attendant',
        );
        setAttendants(onlyAttendants);
      })
      .catch(() =>
        setMessage({ type: 'error', text: 'Erro ao carregar atendentes.' }),
      );
  }, []);

  // RQF 2.3 - Monitors changes in the assigned attendant or date to immediately recalculate available time slots.
  useEffect(() => {
    if (selectedAttendantId && selectedDate) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
    setSelectedSlot(null);
  }, [selectedAttendantId, selectedDate]);

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      setMessage({ type: '', text: '' });
      const response = await api.get('/slots', {
        params: { user_id: selectedAttendantId, date: selectedDate },
      });
      setAvailableSlots(response.data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Erro ao buscar horários disponíveis.',
      });
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    try {
      await api.post('/appointments', {
        user_id: selectedAttendantId,
        appointment_date: selectedDate,
        start_time: selectedSlot.start,
        client_name: clientName,
        client_email: clientEmail,
      });

      setMessage({
        type: 'success',
        text: `Agendamento realizado com sucesso para as ${selectedSlot.start}!`,
      });
      setClientName('');
      setClientEmail('');
      setSelectedSlot(null);

      // RQF 2.3 - Refreshes the slots to remove the time slot that was just taken.
      fetchAvailableSlots();
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao processar o agendamento.' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Painel de Agendamentos
      </h1>

      {message.text && (
        <div
          className={`p-4 rounded-lg mb-6 border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Selecione o Atendente *
          </label>
          <select
            value={selectedAttendantId}
            onChange={(e) => setSelectedAttendantId(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2.5 bg-white shadow-sm focus:border-indigo-500"
          >
            <option value="">-- Escolha um profissional --</option>
            {attendants.map((at) => (
              <option key={at.id} value={at.id}>
                {at.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Escolha a Data *
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
          />
        </div>
      </div>

      {selectedAttendantId && selectedDate && (
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Horários Livres Encontrados
          </h3>

          {loadingSlots ? (
            <p className="text-gray-500">Calculando grade de horários...</p>
          ) : availableSlots.length === 0 ? (
            <p className="text-amber-600 font-medium">
              Nenhum horário livre ou janela de atendimento configurada para
              esta data.
            </p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`p-3 rounded-lg border text-center font-medium text-sm transition ${
                    selectedSlot?.start === slot.start
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'
                  }`}
                >
                  {slot.start} - {slot.end}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedSlot && (
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 animate-fade-in">
          <h3 className="text-md font-bold text-gray-800 mb-4">
            Confirmar Reserva para o horário:{' '}
            <span className="text-indigo-600">{selectedSlot.start}</span>
          </h3>
          <form onSubmit={handleBookAppointment} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  E-mail do Cliente *
                </label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium transition"
              >
                Salvar Agendamento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
