import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, Filter, Plus, Download, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { reservationsAPI } from '../services/api';
import { formatDate, formatCurrency, getEventTypeLabel, getStatusLabel, getStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

const Reservations: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadReservations();
  }, [pagination.page, statusFilter]);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, limit: pagination.limit };
      if (statusFilter) params.status = statusFilter;
      
      const response = await reservationsAPI.getAll(params);
      setReservations(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Błąd ładowania rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id: string) => {
    try {
      const response = await reservationsAPI.generatePDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rezerwacja-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF wygenerowany');
    } catch (error) {
      toast.error('Błąd generowania PDF');
    }
  };

  const handleSendEmail = async (id: string) => {
    try {
      await reservationsAPI.sendEmail(id);
      toast.success('Email wysłany');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd wysyłki email');
    }
  };

  const filteredReservations = reservations.filter(r =>
    search === '' ||
    r.reservationNumber.toLowerCase().includes(search.toLowerCase()) ||
    `${r.customer.firstName} ${r.customer.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rezerwacje</h1>
          <p className="text-gray-500 mt-1">Zarządzaj wszystkimi rezerwacjami</p>
        </div>
        <Link to="/reservations/new">
          <Button variant="primary" icon={<Plus className="w-5 h-5" />}>
            Nowa rezerwacja
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Szukaj po numerze lub kliencie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Wszystkie statusy</option>
              <option value="PENDING">Oczekujące</option>
              <option value="CONFIRMED">Potwierdzone</option>
              <option value="IN_PROGRESS">W trakcie</option>
              <option value="COMPLETED">Zakończone</option>
              <option value="CANCELLED">Anulowane</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Reservations List */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Brak rezerwacji</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wydarzenie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sala
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kwota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReservations.map((reservation, index) => (
                  <motion.tr
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/reservations/${reservation.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-800"
                      >
                        {reservation.reservationNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {reservation.customer.firstName} {reservation.customer.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{reservation.customer.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getEventTypeLabel(reservation.eventType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(reservation.eventDate)}</div>
                      <div className="text-sm text-gray-500">{reservation.startTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {reservation.room.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(Number(reservation.finalAmount))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.status)}`}>
                        {getStatusLabel(reservation.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleDownloadPDF(reservation.id)}
                          className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Pobierz PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        {reservation.customer.email && (
                          <button
                            onClick={() => handleSendEmail(reservation.id)}
                            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Wyślij email"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                        )}
                        <Link to={`/reservations/${reservation.id}`}>
                          <Button variant="secondary" size="sm">
                            Szczegóły
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Strona {pagination.page} z {pagination.pages} ({pagination.total} rekordów)
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
        )}
      </Card>
    </div>
  );
};

export default Reservations;
