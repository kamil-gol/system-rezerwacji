import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, TrendingUp, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import { statisticsAPI, reservationsAPI } from '../services/api';
import { formatCurrency, formatDate, getEventTypeLabel, getStatusColor, getStatusLabel } from '../utils/formatters';
import toast from 'react-hot-toast';

interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: string;
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [upcomingReservations, setUpcomingReservations] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, upcomingRes] = await Promise.all([
        statisticsAPI.getOverview(),
        reservationsAPI.getUpcoming(7)
      ]);
      setStats(statsRes.data);
      setUpcomingReservations(upcomingRes.data);
    } catch (error: any) {
      toast.error('Błąd ładowania danych');
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

  const statCards: StatCard[] = [
    {
      title: 'Aktywne rezerwacje',
      value: stats?.activeReservations || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Całkowity przychód',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Miesięczny przychód',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: <TrendingUp className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      trend: `${stats?.revenueGrowth > 0 ? '+' : ''}${stats?.revenueGrowth?.toFixed(1)}%`,
    },
    {
      title: 'Liczba klientów',
      value: stats?.totalCustomers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'from-orange-500 to-orange-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Prze gląd najważniejszych informacji</p>
        </div>
        <Link to="/reservations/new">
          <Button variant="primary" icon={<Calendar className="w-5 h-5" />}>
            Nowa rezerwacja
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card hover className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  {stat.trend && (
                    <p className={`text-sm mt-2 ${parseFloat(stat.trend) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.trend} vs poprzedni miesiąc
                    </p>
                  )}
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Reservations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Nadchodzące rezerwacje</h2>
              <p className="text-sm text-gray-500">Rezerwacje w najbliższych 7 dniach</p>
            </div>
          </div>
          <Link to="/reservations">
            <Button variant="secondary" size="sm">
              Zobacz wszystkie
            </Button>
          </Link>
        </div>

        {upcomingReservations.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Brak nadchodzących rezerwacji</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReservations.slice(0, 5).map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
                      {new Date(reservation.eventDate).getDate()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {reservation.customer.firstName} {reservation.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getEventTypeLabel(reservation.eventType)} • {reservation.room.name}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(reservation.eventDate)} • {reservation.startTime} • {reservation.numberOfGuests} osób
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                    {getStatusLabel(reservation.status)}
                  </span>
                  <Link to={`/reservations/${reservation.id}`}>
                    <Button variant="secondary" size="sm">
                      Szczegóły
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
