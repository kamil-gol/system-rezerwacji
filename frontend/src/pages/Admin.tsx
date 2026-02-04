import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, Plus, Edit, Trash2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import { adminAPI } from '../services/api';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  
  const [userForm, setUserForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'EMPLOYEE'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadLogs();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      toast.error('Błąd ładowania użytkowników');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getLogs({ limit: 50 });
      setLogs(response.data.data);
    } catch (error) {
      toast.error('Błąd ładowania logów');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async () => {
    try {
      if (editingUser) {
        await adminAPI.updateUser(editingUser.id, userForm);
        toast.success('Użytkownik zaktualizowany');
      } else {
        await adminAPI.createUser(userForm);
        toast.success('Użytkownik utworzony');
      }
      setShowUserModal(false);
      setEditingUser(null);
      setUserForm({ email: '', password: '', firstName: '', lastName: '', role: 'EMPLOYEE' });
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd zapisu');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Czy na pewno dezaktywować użytkownika?')) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('Użytkownik dezaktywowany');
      loadUsers();
    } catch (error) {
      toast.error('Błąd usuwania');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-100 rounded-lg">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Administracja</h1>
            <p className="text-gray-500 mt-1">Zarządzanie systemem</p>
          </div>
        </div>
        {activeTab === 'users' && (
          <Button
            variant="primary"
            icon={<Plus className="w-5 h-5" />}
            onClick={() => {
              setEditingUser(null);
              setUserForm({ email: '', password: '', firstName: '', lastName: '', role: 'EMPLOYEE' });
              setShowUserModal(true);
            }}
          >
            Dodaj użytkownika
          </Button>
        )}
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'users'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Użytkownicy</span>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
              activeTab === 'logs'
                ? 'bg-primary-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Logi systemowe</span>
          </button>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : activeTab === 'users' ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Użytkownik
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Rola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ostatnie logowanie
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Aktywny' : 'Nieaktywny'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.lastLogin ? formatDate(user.lastLogin, 'dd.MM.yyyy HH:mm') : 'Nigdy'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(user);
                            setUserForm({
                              email: user.email,
                              password: '',
                              firstName: user.firstName,
                              lastName: user.lastName,
                              role: user.role
                            });
                            setShowUserModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="space-y-3">
            {logs.map((log, index) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className={`p-4 rounded-lg border ${
                  log.level === 'error'
                    ? 'bg-red-50 border-red-200'
                    : log.level === 'warn'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{log.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDate(log.createdAt, 'dd.MM.yyyy HH:mm:ss')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    log.level === 'error'
                      ? 'bg-red-100 text-red-800'
                      : log.level === 'warn'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold mb-4">
              {editingUser ? 'Edytuj użytkownika' : 'Nowy użytkownik'}
            </h3>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                required
              />
              <Input
                label={editingUser ? 'Nowe hasło (opcjonalne)' : 'Hasło'}
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                required={!editingUser}
              />
              <Input
                label="Imię"
                value={userForm.firstName}
                onChange={(e) => setUserForm({ ...userForm, firstName: e.target.value })}
                required
              />
              <Input
                label="Nazwisko"
                value={userForm.lastName}
                onChange={(e) => setUserForm({ ...userForm, lastName: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rola</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="EMPLOYEE">Pracownik</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowUserModal(false)}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveUser}
                className="flex-1"
              >
                Zapisz
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Admin;
