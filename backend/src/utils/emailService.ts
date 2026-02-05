import nodemailer from 'nodemailer';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { generateReservationPDF } from './pdfGenerator';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

export const sendReservationConfirmation = async (reservation: any) => {
  const eventTypeLabels: Record<string, string> = {
    WEDDING: 'Wesele',
    BIRTHDAY: 'Urodziny',
    ANNIVERSARY: 'Rocznica',
    BUSINESS_MEETING: 'Spotkanie biznesowe',
    PARTY: 'Przyjęcie okolicznościowe',
    CHRISTMAS: 'Wigilia firmowa',
    BAPTISM: 'Chrzciny',
    COMMUNION: 'Komunie'
  };
  
  const pdfPath = await generateReservationPDF(reservation);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to: reservation.customer.email,
    subject: `Potwierdzenie rezerwacji ${reservation.reservationNumber} - Gościniec Rodzinny`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #2563eb; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏛️ Gościniec Rodzinny</h1>
        </div>
        
        <div style="padding: 30px; background: #f8fafc;">
          <h2 style="color: #2563eb;">Dzień dobry ${reservation.customer.firstName}!</h2>
          <p>Dziękujemy za dokonanie rezerwacji. Poniżej szczegóły:</p>
          
          <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Numer rezerwacji:</strong> ${reservation.reservationNumber}</p>
            <p><strong>Typ wydarzenia:</strong> ${eventTypeLabels[reservation.eventType]}</p>
            <p><strong>Data:</strong> ${format(reservation.eventDate, 'dd.MM.yyyy', { locale: pl })}</p>
            <p><strong>Godzina:</strong> ${reservation.startTime}</p>
            <p><strong>Sala:</strong> ${reservation.room.name}</p>
            <p><strong>Liczba gości:</strong> ${reservation.numberOfGuests} osób</p>
            <p><strong>Kwota:</strong> ${Number(reservation.finalAmount).toFixed(2)} PLN</p>
          </div>
          
          <p>Szczegółowe potwierdzenie znajdziesz w załączniku PDF.</p>
          
          <p style="margin-top: 30px;">W razie pytań prosimy o kontakt:</p>
          <p>📞 Telefon: +48 XXX XXX XXX<br>
          📧 Email: kontakt@goscinecrodzinny.pl</p>
          
          <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
            Serdecznie pozdrawiamy,<br>
            <strong>Zespół Gościniec Rodzinny</strong>
          </p>
        </div>
        
        <div style="background: #1e293b; color: white; padding: 15px; text-align: center; font-size: 12px;">
          <p>ul. Bukowa 155, 41-600 Świętochłowice</p>
          <p>www.goscinecrodzinny.pl</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `${reservation.reservationNumber}.pdf`,
        path: pdfPath
      }
    ]
  };
  
  await transporter.sendMail(mailOptions);
};
