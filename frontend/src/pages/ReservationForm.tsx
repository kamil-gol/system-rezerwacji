import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Save, X, AlertCircle } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { reservationsAPI, customersAPI, roomsAPI } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import { format, addDays, parse } from 'date-fns';

const ReservationForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    roomId: '',
    eventType: 'BIRTHDAY',
    eventDate: format(new Date(), 'dd.MM.yyyy'),
    startTime: '18:00',
    durationHours: 6,
    numberOfGuests: 1,
    pricingType: 'PER_PERSON' as 'PER_PERSON' | 'TOTAL',
    pricePerPerson: 0,
    totalPrice: 0,
    depositRequired: false,
    depositAmount: 0,
    depositDueDate: '',
    notes: '',
    specialRequests: ''
  });
  
  const [calculatedPrice, setCalculatedPrice] = useState(0);
  const [extraHoursNote, setExtraHoursNote] = useState('');
  const [validationErrors, setValidationErrors] = useState<any>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    calculatePrice();
    updateExtraHoursNote();
  }, [formData.pricingType, formData.numberOfGuests, formData.pricePerPerson, formData.totalPrice, formData.durationHours]);

  useEffect(() => {
    validateRoomCapacity();
  }, [formData.roomId, formData.numberOfGuests]);

  const loadData = async () => {
    try {
      const [customersRes, roomsRes] = await Promise.all([
        customersAPI.getAll({ limit: 100 }),
        roomsAPI.getAll()
      ]);
      setCustomers(customersRes.data.data || customersRes.data);
      setRooms(roomsRes.data);
      
      // Set default room and price
      if (roomsRes.data.length > 0) {
        const defaultRoom = roomsRes.data[0];
        setFormData(prev => ({
          ...prev,
          roomId: defaultRoom.id,
          pricePerPerson: Number(defaultRoom.pricePerPerson),
          totalPrice: Number(defaultRoom.totalPrice)
        }));
      }
    } catch (error) {
      toast.error('Błąd ładowania danych');
    }
  };

  const calculatePrice = () => {
    if (formData.pricingType === 'PER_PERSON') {
      const price = formData.numberOfGuests * formData.pricePerPerson;
      setCalculatedPrice(price);
    } else {
      setCalculatedPrice(formData.totalPrice);
    }
  };

  const updateExtraHoursNote = () => {
    if (formData.durationHours > 6) {
      const extraHours = formData.durationHours - 6;
      setExtraHoursNote(`Dodatkowo płatnych godzin: ${extraHours} (powyżej standardowych 6h)`);
    } else {
      setExtraHoursNote('');
    }
  };

  const validateRoomCapacity = () => {
    const selectedRoom = rooms.find(r => r.id === formData.roomId);
    if (selectedRoom && formData.numberOfGuests > selectedRoom.maxCapacity) {
      setValidationErrors((prev: any) => ({
        ...prev,
        numberOfGuests: `Maksymalna pojemność sali: ${selectedRoom.maxCapacity} osób`
      }));
    } else {
      setValidationErrors((prev: any) => {
        const { numberOfGuests, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRoomChange = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setFormData(prev => ({
        ...prev,
        roomId,
        pricePerPerson: Number(room.pricePerPerson),
        totalPrice: Number(room.totalPrice)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Popraw błędy walidacji');
      return;
    }
    
    // Validate deposit date
    if (formData.depositRequired && formData.depositDueDate) {
      const eventDate = parse(formData.eventDate, 'dd.MM.yyyy', new Date());
      const depositDate = parse(formData.depositDueDate, 'dd.MM.yyyy', new Date());
      const maxDepositDate = addDays(eventDate, -1);
      
      if (depositDate > maxDepositDate) {
        toast.error('Termin zaliczki musi być maksymalnie dzień przed wydarzeniem');
        return;
      }
    }
    
    setLoading(true);
    try {
      const submitData = {
        ...formData,
        pricePerPerson: formData.pricingType === 'PER_PERSON' ? formData.pricePerPerson : undefined,
        totalPrice: formData.pricingType === 'TOTAL' ? formData.totalPrice : undefined,
        depositAmount: formData.depositRequired ? formData.depositAmount : undefined,
        depositDueDate: formData.depositRequired ? formData.depositDueDate : undefined
      };
      
      await reservationsAPI.create(submitData);
      toast.success('Rezerwacja utworzona!');
      navigate('/reservations');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd podczas tworzenia rezerwacji');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nowa rezerwacja</h1>
          <p className="text-gray-500 mt-1">Utwórz nową rezerwację sali</p>
        </div>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            icon={<X className="w-5 h-5" />}
            onClick={() => navigate('/reservations')}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-5 h-5" />}
            loading={loading}
            disabled={Object.keys(validationErrors).length > 0}
          >
            Zapisz rezerwację
          </Button>
        </div>
      </div>

      {/* Customer & Room */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Klient i Sala</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Klient *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Wybierz klienta</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.firstName} {c.lastName} - {c.phone}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sala *
            </label>
            <select
              value={formData.roomId}
              onChange={(e) => handleRoomChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (max {r.maxCapacity} osób)
                </option>
              ))}
            </select>
            {selectedRoom && (
              <p className="mt-1 text-xs text-gray-500">
                Cena: {formatCurrency(Number(selectedRoom.pricePerPerson))}/os. lub {formatCurrency(Number(selectedRoom.totalPrice))} całość
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Event Details */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Szczegóły wydarzenia</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Typ wydarzenia *
            </label>
            <select
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="WEDDING">Wesele</option>
              <option value="BIRTHDAY">Urodziny</option>
              <option value="ANNIVERSARY">Rocznica</option>
              <option value="BUSINESS_MEETING">Spotkanie biznesowe</option>
              <option value="PARTY">Przyjęcie</option>
              <option value="CHRISTMAS">Wigilia firmowa</option>
              <option value="BAPTISM">Chrzciny</option>
              <option value="COMMUNION">Komunie</option>
            </select>
          </div>
          
          <Input
            label="Data wydarzenia *"
            type="text"
            placeholder="dd.mm.yyyy"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            required
          />
          
          <Input
            label="Godzina rozpoczęcia *"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
          
          <Input
            label="Czas trwania (godziny) *"
            type="number"
            min="1"
            max="24"
            value={formData.durationHours}
            onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) })}
            required
          />
          
          <Input
            label="Liczba gości *"
            type="number"
            min="1"
            value={formData.numberOfGuests}
            onChange={(e) => setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) })}
            error={validationErrors.numberOfGuests}
            required
          />
        </div>
        
        {extraHoursNote && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2"
          >
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">{extraHoursNote}</p>
          </motion.div>
        )}
      </Card>

      {/* Pricing */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Cena</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Typ cenowy *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="PER_PERSON"
                  checked={formData.pricingType === 'PER_PERSON'}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as any })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-900">Cena za osobę</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  value="TOTAL"
                  checked={formData.pricingType === 'TOTAL'}
                  onChange={(e) => setFormData({ ...formData, pricingType: e.target.value as any })}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-900">Cena całościowa</span>
              </label>
            </div>
          </div>
          
          {formData.pricingType === 'PER_PERSON' ? (
            <Input
              label="Cena za osobę (PLN) *"
              type="number"
              step="0.01"
              min="0"
              value={formData.pricePerPerson}
              onChange={(e) => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
              required
            />
          ) : (
            <Input
              label="Cena całościowa (PLN) *"
              type="number"
              step="0.01"
              min="0"
              value={formData.totalPrice}
              onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) })}
              required
            />
          )}
          
          <motion.div
            key={calculatedPrice}
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            className="p-4 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border-2 border-primary-200"
          >
            <p className="text-sm text-gray-600 mb-1">Obliczona kwota do zapłaty:</p>
            <p className="text-3xl font-bold text-primary-600">{formatCurrency(calculatedPrice)}</p>
          </motion.div>
        </div>
      </Card>

      {/* Deposit */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Zaliczka</h2>
        <div className="space-y-4">
          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={formData.depositRequired}
              onChange={(e) => setFormData({ ...formData, depositRequired: e.target.checked })}
              className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
            />
            <span className="text-sm font-medium text-gray-900">Wymagana zaliczka</span>
          </label>
          
          {formData.depositRequired && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4"
            >
              <Input
                label="Kwota zaliczki (PLN) *"
                type="number"
                step="0.01"
                min="0"
                value={formData.depositAmount}
                onChange={(e) => setFormData({ ...formData, depositAmount: parseFloat(e.target.value) })}
                required={formData.depositRequired}
              />
              <Input
                label="Termin płatności zaliczki *"
                type="text"
                placeholder="dd.mm.yyyy"
                value={formData.depositDueDate}
                onChange={(e) => setFormData({ ...formData, depositDueDate: e.target.value })}
                required={formData.depositRequired}
              />
            </motion.div>
          )}
        </div>
      </Card>

      {/* Notes */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Uwagi</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notatki wewnętrzne
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Dodatkowe informacje dla pracowników..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Specjalne życzenia klienta
            </label>
            <textarea
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Dekoracje, menu, muzyka, itp..."
            />
          </div>
        </div>
      </Card>
    </form>
  );
};

export default ReservationForm;
