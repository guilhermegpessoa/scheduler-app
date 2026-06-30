import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Users } from './pages/Users';
import { Schedule } from './pages/Schedule';
import { Availabilities } from './pages/Availabilities';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { signed, loading } = useAuth();
  if (loading)
    return <div className="p-8 text-center">A carregar aplicação...</div>;
  return signed ? <>{children}</> : <Navigate to="/login" />;
};

const Layout: React.FC = () => {
  const { signOut, user } = useAuth();
  const isAdmin = user?.role === 'administrator';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex justify-between h-16 items-center">
          <div className="flex space-x-6">
            <span className="font-bold text-indigo-600 text-lg mr-4">
              Agendador
            </span>
            <Link
              to="/schedule"
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm flex items-center"
            >
              Agendamentos
            </Link>
            <Link
              to="/users"
              className="text-gray-600 hover:text-indigo-600 font-medium text-sm flex items-center"
            >
              Usuários
            </Link>

            {isAdmin && (
              <Link
                to="/availabilities"
                className="text-gray-600 hover:text-indigo-600 font-medium text-sm flex items-center"
              >
                Disponibilidades
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium">
              {user?.name} ({isAdmin ? 'Admin' : 'Atendente'})
            </span>
            <button
              onClick={signOut}
              className="text-sm font-semibold text-red-500 hover:text-red-700 transition"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="py-8">
        <Routes>
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/users" element={<Users />} />

          <Route
            path="/availabilities"
            element={isAdmin ? <Availabilities /> : <Navigate to="/schedule" />}
          />

          <Route path="*" element={<Navigate to="/schedule" />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route
            path="*"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

const LoginWrapper: React.FC = () => {
  const { signed } = useAuth();
  return signed ? <Navigate to="/schedule" /> : <Login />;
};
