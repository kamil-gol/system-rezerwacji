import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Hotel, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (error) {
      // Error is handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-8 text-white text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur rounded-full mb-4"
            >
              <Hotel className="w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-bold mb-2">Gościniec Rodzinny</h1>
            <p className="text-primary-100">System Rezerwacji Sal</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Zaloguj się
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Email"
                placeholder="admin@goscniecrodzinny.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                required
              />

              <Input
                type="password"
                label="Hasło"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={loading}
                icon={<ArrowRight className="w-5 h-5" />}
                className="w-full"
              >
                Zaloguj się
              </Button>
            </form>

            {/* Test credentials */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
            >
              <p className="text-sm font-medium text-blue-900 mb-2">👤 Dane testowe:</p>
              <div className="space-y-1 text-xs text-blue-700">
                <p><strong>Admin:</strong> admin@goscniecrodzinny.pl / Admin123!@#$</p>
                <p><strong>Manager:</strong> manager@goscniecrodzinny.pl / Manager123!@#</p>
                <p><strong>Pracownik:</strong> pracownik@goscniecrodzinny.pl / Employee123!@</p>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              © 2026 Gościniec Rodzinny. Wszystkie prawa zastrzeżone.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
