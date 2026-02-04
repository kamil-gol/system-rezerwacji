# 🏰 System Rezerwacji Sal - Gościniec Rodzinny

Kompletny system zarządzania rezerwacjami sal dla Gościniec Rodzinny. Full-stack aplikacja z React (Frontend), Node.js + Express (Backend), PostgreSQL (Baza danych) i Docker.

## 🚀 Funkcjonalności

### ✨ Główne możliwości
- **Zarządzanie rezerwacjami** - tworzenie, edycja, anulowanie rezerwacji
- **Kalkulacja cen** - automatyczne obliczanie cen w czasie rzeczywistym (per osoba lub całościowa)
- **System zaliczek** - obsługa zaliczek z terminami płatności
- **Zarządzanie klientami** - baza danych klientów z historią rezerwacji
- **Statystyki i raporty** - przychody, popularne wydarzenia, wykorzystanie sal
- **Generowanie PDF** - automatyczne tworzenie potwierdzeń rezerwacji
- **Wysyłka email** - automatyczne powiadomienia dla klientów
- **Historia zmian** - pełna audytowalna historia wszystkich operacji
- **Role użytkowników** - ADMIN, MANAGER, EMPLOYEE z różnymi uprawnieniami
- **Panel administracyjny** - zarządzanie użytkownikami i logi systemowe

### 🎯 Typy wydarzeń
- Wesela
- Urodziny
- Rocznice
- Spotkania biznesowe
- Przyjęcia
- Wigilie firmowe
- Chrzciny
- Komunie

## 🛠️ Technologie

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** - relacyjna baza danych
- **Prisma ORM** - type-safe database access
- **JWT** - autentykacja
- **Puppeteer** - generowanie PDF
- **Nodemailer** - wysyłka email
- **bcrypt** - hashowanie haseł

### Frontend
- **React 18** + **TypeScript**
- **Vite** - build tool
- **Tailwind CSS** - styling
- **Framer Motion** - animacje
- **React Router** - routing
- **Axios** - HTTP client
- **React Hook Form** + **Zod** - walidacja formularzy

### DevOps
- **Docker** + **Docker Compose**
- **Nginx** - reverse proxy
- **PostgreSQL 15**

## 📦 Instalacja

### Wymagania
- Docker i Docker Compose
- Node.js 20+ (opcjonalnie, dla lokalnego developmentu)
- Git

### 1. Sklonuj repozytorium

```bash
git clone https://github.com/kamil-gol/system-rezerwacji.git
cd system-rezerwacji
```

### 2. Konfiguracja zmiennych środowiskowych

#### Backend (.env)

```bash
cd backend
cp .env.example .env
```

Edytuj `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres123@db:5432/gosciniec
JWT_SECRET=twoj-super-tajny-klucz-jwt-min-32-znakow
JWT_EXPIRES_IN=7d
PORT=5000
NODE_ENV=production

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=twoj-email@gmail.com
EMAIL_PASSWORD=twoje-haslo-aplikacji
EMAIL_FROM=noreply@goscniecrodzinny.pl
```

#### Frontend (.env)

```bash
cd ../frontend
cp .env.example .env
```

Edytuj `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Uruchomienie z Docker (REKOMENDOWANE)

```bash
# Z głównego katalogu projektu
docker-compose up -d
```

Aplikacja będzie dostępna pod:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **PostgreSQL:** localhost:5432

### 4. Inicjalizacja bazy danych

Baza danych zostanie automatycznie zainicjalizowana przy pierwszym uruchomieniu.

Aby załadować przykładowe dane (seed):

```bash
docker-compose exec backend npm run seed
```

## 👥 Konta testowe

Po wykonaniu seed, dostępne są następujące konta:

| Rola | Email | Hasło |
|------|-------|-------|
| **Admin** | admin@goscniecrodzinny.pl | Admin123!@#$ |
| **Manager** | manager@goscniecrodzinny.pl | Manager123!@# |
| **Pracownik** | pracownik@goscniecrodzinny.pl | Employee123!@ |

## 📊 Struktura projektu

```
system-rezerwacji/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Schemat bazy danych
│   │   └── seed.ts             # Dane testowe
│   ├── src/
│   │   ├── controllers/        # Kontrolery API
│   │   ├── routes/             # Endpointy
│   │   ├── middleware/         # Auth, error handling
│   │   ├── services/           # PDF, Email
│   │   └── index.ts            # Entry point
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/         # Komponenty UI
│   │   ├── pages/              # Strony aplikacji
│   │   ├── context/            # React Context (Auth)
│   │   ├── services/           # API calls
│   │   └── utils/              # Formattery, helpery
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
└── README.md
```

## 🔧 Development (bez Docker)

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🗄️ Schemat bazy danych

### Główne tabele

- **users** - Użytkownicy systemu (role: ADMIN, MANAGER, EMPLOYEE)
- **customers** - Klienci (dane kontaktowe, firma, NIP)
- **rooms** - Sale (nazwa, pojemność, ceny)
- **reservations** - Rezerwacje (wszystkie szczegóły)
- **reservation_history** - Historia zmian rezerwacji
- **audit_logs** - Logi systemowe

## 🌐 API Endpoints

### Auth
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/logout` - Wylogowanie
- `POST /api/auth/change-password` - Zmiana hasła

### Reservations
- `GET /api/reservations` - Lista rezerwacji (z filtrowaniem)
- `GET /api/reservations/:id` - Szczegóły rezerwacji
- `POST /api/reservations` - Nowa rezerwacja
- `PUT /api/reservations/:id` - Aktualizacja
- `DELETE /api/reservations/:id` - Anulowanie
- `GET /api/reservations/upcoming` - Nadchodzące rezerwacje
- `GET /api/reservations/:id/pdf` - Generuj PDF
- `POST /api/reservations/:id/send-email` - Wyślij email

### Customers
- `GET /api/customers` - Lista klientów
- `GET /api/customers/:id` - Szczegóły klienta
- `POST /api/customers` - Nowy klient
- `PUT /api/customers/:id` - Aktualizacja

### Rooms
- `GET /api/rooms` - Lista sal
- `GET /api/rooms/:id/availability` - Sprawdź dostępność

### Statistics
- `GET /api/statistics/overview` - Przegląd statystyk
- `GET /api/statistics/revenue` - Przychody
- `GET /api/statistics/popular-events` - Popularne wydarzenia
- `GET /api/statistics/room-utilization` - Wykorzystanie sal

### Admin (tylko ADMIN)
- `GET /api/admin/users` - Lista użytkowników
- `POST /api/admin/users` - Nowy użytkownik
- `PUT /api/admin/users/:id` - Aktualizacja
- `DELETE /api/admin/users/:id` - Dezaktywacja
- `GET /api/admin/logs` - Logi systemowe

## 🎨 Screenshoty

### Dashboard
- Karty ze statystykami (aktywne rezerwacje, przychody)
- Lista nadchodzących rezerwacji
- Szybki dostęp do nowej rezerwacji

### Formularz rezerwacji
- **Kalkulacja cen w czasie rzeczywistym**
- Walidacja pojemności sal
- Obsługa zaliczek z terminami
- Specjalne życzenia klienta

### Lista rezerwacji
- Filtrowanie po statusie
- Wyszukiwanie
- Paginacja
- Pobieranie PDF / wysyłka email

### Statystyki
- Popularne wydarzenia
- Wykorzystanie sal
- Top 10 klientów

## 🚢 Deployment (Production)

### 1. Przygotowanie serwera

```bash
# Zainstaluj Docker i Docker Compose na serwerze
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose
```

### 2. Sklonuj i skonfiguruj

```bash
git clone https://github.com/kamil-gol/system-rezerwacji.git
cd system-rezerwacji

# Skonfiguruj .env (pamiętaj o silnych hasłach!)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edytuj pliki .env zgodnie z Twoim środowiskiem
```

### 3. Uruchom

```bash
docker-compose up -d

# Sprawdź logi
docker-compose logs -f

# Załaduj seed (opcjonalnie)
docker-compose exec backend npm run seed
```

### 4. Backup bazy danych

```bash
# Backup
docker-compose exec db pg_dump -U postgres gosciniec > backup.sql

# Restore
docker-compose exec -T db psql -U postgres gosciniec < backup.sql
```

## 🔒 Bezpieczeństwo

- ✅ JWT token-based authentication
- ✅ Bcrypt password hashing (12 rounds)
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection protection (Prisma ORM)
- ✅ XSS protection
- ✅ CORS configuration
- ✅ Rate limiting (opcjonalnie)
- ✅ Audit logs dla wszystkich akcji

## 📝 TODO / Przyszłe funkcjonalności

- [ ] Kalendarz z wizualizacją dostępności sal
- [ ] Powiadomienia push
- [ ] Integracja z płatnościami online
- [ ] Eksport raportów do Excel
- [ ] Aplikacja mobilna (React Native)
- [ ] Multi-tenancy (wiele lokalizacji)
- [ ] Zaawansowane raporty (Analytics)

## 🤝 Contributing

Chętnie przyjmujemy pull requesty! Przed rozpoczęciem pracy nad większą zmianą, otwórz issue, aby przedyskutować proponowane zmiany.

## 📄 Licencja

MIT License - patrz [LICENSE](LICENSE)

## 👨‍💻 Autor

**Kamil Gol**
- GitHub: [@kamil-gol](https://github.com/kamil-gol)

## 💬 Wsparcie

Masz pytania? Otwórz issue lub skontaktuj się przez GitHub.

---

⭐ Jeśli projekt Ci się podoba, zostaw gwiazdkę na GitHub!
