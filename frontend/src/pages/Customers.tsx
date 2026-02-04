import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { customersAPI } from '../services/api';
import { formatPhoneNumber } from '../utils/formatters';
import toast from 'react-hot-toast';

const Customers: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });

  useEffect(() => {
    loadCustomers();
  }, [pagination.page, search]);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersAPI.getAll({ 
        page: pagination.page, 
        limit: pagination.limit,
        search 
      });
      setCustomers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Błąd ładowania klientów');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Klienci</h1>
          <p className="text-gray-500 mt-1">Baza danych klientów</p>
        </div>
        <Link to="/customers/new">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Dodaj klienta
          </Button>
        </Link>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Szukaj klienta..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Brak klientów</p>
          </div>
        ) : (
          customers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hover className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <Link to={`/customers/${customer.id}/edit`}>
                    <Button variant="secondary" size="sm">Edytuj</Button>
                  </Link>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {customer.firstName} {customer.lastName}
                </h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>📞 {formatPhoneNumber(customer.phone)}</p>
                  {customer.email && <p>📧 {customer.email}</p>}
                  {customer.company && <p>🏢 {customer.company}</p>}
                  {customer.city && <p>📍 {customer.city}</p>}
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Strona {pagination.page} z {pagination.pages}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === 1}
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              >
                Poprzednia
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page === pagination.pages}
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              >
                Następna
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Customers;
