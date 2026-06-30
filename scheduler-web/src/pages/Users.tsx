import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'administrator' | 'attendant';
}

export const Users: React.FC = () => {
  const { user: loggedUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [modalErrorMessage, setModalErrorMessage] = useState(''); // <-- Novo estado para erros de dentro do modal

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'administrator' | 'attendant'>('attendant');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const isAdmin = loggedUser?.role === 'administrator';

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error: any) {
      // RQNF3 - User-friendly error handling
      setErrorMessage('Erro ao carregar a lista de usuários. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setName('');
    setEmail('');
    setRole('attendant');
    setPassword('');
    setPasswordConfirmation('');
    setErrorMessage('');
    setModalErrorMessage('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setName(user.name);
    setRole(user.role);
    setErrorMessage('');
    setModalErrorMessage('');
    setIsFormModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErrorMessage('');

    // RQF 1.2 & RQNF3 - Local insertion validations saving to the modal state
    if (!selectedUser) {
      if (password.length < 8) {
        setModalErrorMessage('A senha deve possuir no mínimo 8 caracteres.');
        return;
      }
      if (password !== passwordConfirmation) {
        setModalErrorMessage('A confirmação de senha não confere.');
        return;
      }
    }

    try {
      if (selectedUser) {
        // RQF 1.3 - User Editing
        await api.put(`/users/${selectedUser.id}`, { name, role });
      } else {
        // RQF 1.2 - User Insertion
        await api.post('/users', {
          name,
          email,
          role,
          password,
          password_confirmation: passwordConfirmation,
        });
      }
      setIsFormModalOpen(false);
      loadUsers();
    } catch (error: any) {
      // RQNF3 - Displays API validation errors (e.g., duplicate email) within the modal.
      if (error.response?.data?.errors) {
        const validationErrors = Object.values(error.response.data.errors)
          .flat()
          .join(' ');
        setModalErrorMessage(validationErrors);
      } else {
        setModalErrorMessage(
          error.response?.data?.message ||
            'Erro ao salvar os dados do usuário.',
        );
      }
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await api.delete(`/users/${selectedUser.id}`);
      setIsDeleteModalOpen(false);
      loadUsers();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Erro ao excluir o usuário.',
      );
      setIsDeleteModalOpen(false);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center text-gray-600">
        Carregando usuários...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Gerenciamento de Usuários
        </h1>
        {isAdmin && (
          <button
            onClick={handleOpenCreateModal}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Novo Usuário *
          </button>
        )}
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">
          {errorMessage}
        </div>
      )}

      {/* RQF 1.1 - List Table (same view for everyone) */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                E-mail
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((u) => {
              const canEdit = isAdmin || loggedUser?.id === u.id;
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {u.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {u.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        u.role === 'administrator'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {u.role === 'administrator'
                        ? 'Administrador'
                        : 'Atendente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {canEdit && (
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Editar
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* RQF 1.2 / 1.3 - Dynamic Form Modal (Insert or Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedUser ? 'Editar Usuário' : 'Incluir Novo Usuário'}
            </h3>

            {modalErrorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs border border-red-200">
                {modalErrorMessage}
              </div>
            )}

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
                />
              </div>

              {isAdmin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Usuário *
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
                  >
                    <option value="attendant">Atendente</option>
                    <option value="administrator">Administrador</option>
                  </select>
                </div>
              )}

              {/* RQF 1.3 - Email and Password hidden/blocked during editing */}
              {!selectedUser && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Senha * (Mín. 8 caracteres)
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirme a Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RQF 1.1 - Deletion Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirmar Exclusão
            </h3>
            <p className="text-sm text-gray-500">
              Tem certeza de que deseja excluir o usuário{' '}
              <span className="font-semibold">{selectedUser?.name}</span>? Esta
              ação não pode ser desfeita.
            </p>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-white border border-gray-300 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteUser}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700"
              >
                Confirmar e Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
