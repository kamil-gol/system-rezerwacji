import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { customersAPI } from '../services/api';
import toast from 'react-hot-toast';

const CustomerForm: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    nip: '',
    address: '',
    city: '',
    postalCode: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await customersAPI.create(formData);
      toast.success('Klient dodany!');
      navigate('/customers');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Błąd podczas dodawania klienta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nowy klient</h1>
          <p className="text-gray-500 mt-1">Dodaj nowego klienta do bazy</p>
        </div>
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="secondary"
            icon={<X className="w-5 h-5" />}
            onClick={() => navigate('/customers')}
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            variant="primary"
            icon={<Save className="w-5 h-5" />}
            loading={loading}
          >
            Zapisz
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Dane podstawowe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Imię *"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
          <Input
            label="Nazwisko *"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
          <Input
            label="Telefon *"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Firma"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <Input
            label="NIP"
            value={formData.nip}
            onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
          />
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Adres</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Ulica i numer"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            label="Miasto"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
          <Input
            label="Kod pocztowy"
            value={formData.postalCode}
            onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
          />
        </div>
      </Card>
    </form>
  );
};

export default CustomerForm;
