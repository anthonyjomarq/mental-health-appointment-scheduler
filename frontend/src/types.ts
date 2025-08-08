export interface Appointment {
  id: string;
  name: string;
  email: string;
  date: string;
  time: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface CreateAppointmentRequest {
  name: string;
  email: string;
  date: string;
  time: string;
}

export interface AppointmentResponse {
  message: string;
  appointment: {
    id: string;
    name: string;
    date: string;
    time: string;
  };
}