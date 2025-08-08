import express from 'express';
import cors from 'cors';
import path from 'path';
import { Appointment, CreateAppointmentRequest, TimeSlot } from './types';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

let appointments: Appointment[] = [];

const generateTimeSlots = (): string[] => {
  const slots = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  return slots;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateDate = (date: string): boolean => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return parsedDate >= today && !isNaN(parsedDate.getTime());
};

const validateTime = (time: string): boolean => {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

app.get('/api/appointments', (req, res) => {
  const { date } = req.query;
  
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ error: 'Date parameter is required (YYYY-MM-DD format)' });
  }
  
  if (!validateDate(date)) {
    return res.status(400).json({ error: 'Invalid date format or date in the past' });
  }
  
  const allTimeSlots = generateTimeSlots();
  const bookedSlots = appointments
    .filter(appointment => appointment.date === date)
    .map(appointment => appointment.time);
  
  const availableSlots: TimeSlot[] = allTimeSlots.map(time => ({
    time,
    available: !bookedSlots.includes(time)
  }));
  
  res.json(availableSlots);
});

app.post('/api/appointments', (req, res) => {
  const { name, email, date, time }: CreateAppointmentRequest = req.body;
  
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'All fields are required: name, email, date, time' });
  }
  
  if (name.trim().length < 2) {
    return res.status(400).json({ error: 'Name must be at least 2 characters long' });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  if (!validateDate(date)) {
    return res.status(400).json({ error: 'Invalid date format or date in the past' });
  }
  
  if (!validateTime(time)) {
    return res.status(400).json({ error: 'Invalid time format' });
  }
  
  const existingAppointment = appointments.find(
    appointment => appointment.date === date && appointment.time === time
  );
  
  if (existingAppointment) {
    return res.status(409).json({ error: 'This time slot is already booked. Please choose another time.' });
  }
  
  const newAppointment: Appointment = {
    id: uuidv4(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    date,
    time,
    createdAt: new Date()
  };
  
  appointments.push(newAppointment);
  
  res.status(201).json({
    message: 'Appointment booked successfully!',
    appointment: {
      id: newAppointment.id,
      name: newAppointment.name,
      date: newAppointment.date,
      time: newAppointment.time
    }
  });
});

// Handle React routing - serve index.html for all non-API routes
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});