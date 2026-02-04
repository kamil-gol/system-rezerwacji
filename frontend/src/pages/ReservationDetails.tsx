import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit, Download, Mail, X, History, FileText } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { reservationsAPI } from '../services/api';
import { formatDate, formatCurrency, getEventTypeLabel, getStatusLabel, getStatusColor } from '../utils/formatters';
import toast from 'react-hot-toast';

const ReservationDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reservation, setReservation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    if (id) {
      loadReservation();
      loadHistory();
    }
  }, [id]);

  const loadReservation = async () => {
    try {
      const response = await reservationsAPI.getById(id!);
      setReservation(response.data);
    } catch (error) {
      toast.error('Błąd ładowania rezerwacji');
      navigate('/reservations');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await reservationsAPI.getHistory(id!);
      setHistory(response.data);
    } catch (error) {
      console.error('Błąd ładowania historii');
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await reservationsAPI.generatePDF(id!);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reservation.reservationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF pobrany');
    } catch (error) {
      toast.error('Błąd pobierania PDF');
    }
  };

  const handleSendEmail = async () => {
    try {
      await reservationsAPI.sendEmail(id!);
      toast.success('Email wysłany');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd wysyłki');
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Podaj powód anulowania');
      return;
    }
    try {
      await reservationsAPI.cancel(id!, cancelReason);
      toast.success('Rezerwacja anulowana');
      setShowCancelModal(false);
      loadReservation();
      loadHistory();
    } catch (error) {
      toast.error('Błąd anulowania rezerwacji');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!reservation) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="secondary"
            icon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => navigate('/reservations')}
          >
            Powrót
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rezerwacja {reservation.reservationNumber}
            </h1>
            <p className="text-gray-500 mt-1">
              Utworzona {formatDate(reservation.createdAt, 'dd.MM.yyyy HH:mm')}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="secondary"
            icon={<Download className="w-5 h-5" />}
            onClick={handleDownloadPDF}
          >
            PDF
          </Button>
          {reservation.customer.email && (
            <Button
              variant="secondary"
              icon={<Mail className="w-5 h-5" />}
              onClick={handleSendEmail}
            >
              Wyślij email
            </Button>
          )}
          {reservation.status !== 'CANCELLED' && (
            <>
              <Link to={`/reservations/${id}/edit`}>
                <Button variant="primary" icon={<Edit className="w-5 h-5" />}>
                  Edytuj
                </Button>
              </Link>
              <Button
                variant="danger"
                icon={<X className="w-5 h-5" />}
                onClick={() => setShowCancelModal(true)}
              >
                Anuluj
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status rezerwacji</p>
            <span className={`inline-block mt-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
              {getStatusLabel(reservation.status)}
            </span>
          </div>
          <Button
            variant="secondary"
            icon={<History className="w-5 h-5" />}
            onClick={() => setShowHistory(!showHistory)}
          >
            Historia zmian ({history.length})
          </Button>
        </div>
      </Card>

      {/* History */}
      {showHistory && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Historia zmian</h2>
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {entry.changeType} przez {entry.user.firstName} {entry.user.lastName}
                    </p>
                    {entry.reason && (
                      <p className="text-sm text-gray-600 mt-1">Powód: {entry.reason}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(entry.createdAt, 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Dane klienta</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Imię i nazwisko</p>
              <p className="text-base font-medium">
                {reservation.customer.firstName} {reservation.customer.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefon</p>
              <p className="text-base font-medium">{reservation.customer.phone}</p>
            </div>
            {reservation.customer.email && (
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium">{reservation.customer.email}</p>
              </div>
            )}
            {reservation.customer.company && (
              <div>
                <p className="text-sm text-gray-500">Firma</p>
                <p className="text-base font-medium">{reservation.customer.company}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Event Info */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Szczegóły wydarzenia</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Typ wydarzenia</p>
              <p className="text-base font-medium">{getEventTypeLabel(reservation.eventType)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data i godzina</p>
              <p className="text-base font-medium">
                {formatDate(reservation.eventDate)} o {reservation.startTime}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Czas trwania</p>
              <p className="text-base font-medium">{reservation.durationHours} godzin</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sala</p>
              <p className="text-base font-medium">{reservation.room.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Liczba gości</p>
              <p className="text-base font-medium">{reservation.numberOfGuests} osób</p>
            </div>
          </div>
        </Card>

        {/* Pricing */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Rozliczenie</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Kwota do zapłaty</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatCurrency(Number(reservation.finalAmount))}
              </p>
            </div>
            {reservation.depositRequired && (
              <>
                <div>
                  <p className="text-sm text-gray-500">Zaliczka</p>
                  <p className="text-base font-medium">
                    {formatCurrency(Number(reservation.depositAmount))}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Termin zaliczki</p>
                  <p className="text-base font-medium">
                    {formatDate(reservation.depositDueDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status zaliczki</p>
                  <p className="text-base font-medium">{reservation.depositStatus}</p>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Notes */}
        {(reservation.notes || reservation.specialRequests || reservation.autoGeneratedNotes) && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Uwagi</h2>
            <div className="space-y-3">
              {reservation.autoGeneratedNotes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">{reservation.autoGeneratedNotes}</p>
                </div>
              )}
              {reservation.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notatki</p>
                  <p className="text-base">{reservation.notes}</p>
                </div>
              )}
              {reservation.specialRequests && (
                <div>
                  <p className="text-sm text-gray-500">Specjalne życzenia</p>
                  <p className="text-base">{reservation.specialRequests}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
          >
            <h3 className="text-xl font-bold mb-4">Anuluj rezerwację</h3>
            <p className="text-gray-600 mb-4">
              Podaj powód anulowania rezerwacji {reservation.reservationNumber}
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
              rows={3}
              placeholder="Powód anulowania..."
            />
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowCancelModal(false)}
                className="flex-1"
              >
                Anuluj
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                className="flex-1"
              >
                Potwierdź anulowanie
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReservationDetails;
