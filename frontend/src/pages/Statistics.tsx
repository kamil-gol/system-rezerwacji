import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { statisticsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';

const Statistics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [popularEvents, setPopularEvents] = useState<any[]>([]);
  const [roomUtilization, setRoomUtilization] = useState<any[]>([]);
  const [customerStats, setCustomerStats] = useState<any[]>([]);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const [eventsRes, roomsRes, customersRes] = await Promise.all([
        statisticsAPI.getPopularEvents(10),
        statisticsAPI.getRoomUtilization(),
        statisticsAPI.getCustomerStats()
      ]);
      setPopularEvents(eventsRes.data);
      setRoomUtilization(roomsRes.data);
      setCustomerStats(customersRes.data);
    } catch (error) {
      toast.error('Błąd ładowania statystyk');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statystyki</h1>
        <p className="text-gray-500 mt-1">Analiza danych i raporty</p>
      </div>

      {/* Popular Events */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Popularne wydarzenia</h2>
            <p className="text-sm text-gray-500">Najczęściej rezerwowane typy wydarzeń</p>
          </div>
        </div>
        
        <div className="space-y-4">
          {popularEvents.map((event, index) => (
            <motion.div
              key={event.eventType}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.eventType}</p>
                  <p className="text-sm text-gray-500">{event.count} rezerwacji</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">
                  {formatCurrency(event.revenue)}
                </p>
                <p className="text-xs text-gray-500">przychód</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Room Utilization */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-green-100 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Wykorzystanie sal</h2>
            <p className="text-sm text-gray-500">Statystyki rezerwacji według sal</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roomUtilization.map((room, index) => (
            <motion.div
              key={room.room}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">{room.room}</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Liczba rezerwacji</span>
                  <span className="text-2xl font-bold text-primary-600">{room.reservations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Przychód</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(room.revenue)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Top Customers */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Najlepsi klienci</h2>
            <p className="text-sm text-gray-500">Top 10 klientów według wartości zamwień</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Pozycja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Klient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rezerwacje
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Łączna kwota
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {customerStats.slice(0, 10).map((customer, index) => (
                <motion.tr
                  key={customer.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-900">{customer.name}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {customer.reservationCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-green-600">
                      {formatCurrency(customer.totalSpent)}
                    </p>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Statistics;
