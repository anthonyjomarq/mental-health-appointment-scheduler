export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
  createdAt: Date;
}

export interface CreateAppointmentRequest {
  name: string;
  email: string;
  date: string;
  time: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}