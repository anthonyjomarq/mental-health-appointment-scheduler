import { useState } from 'react';
import type { TimeSlot, CreateAppointmentRequest, AppointmentResponse } from './types';
import './App.css';

const API_URL = '/api';

function App() {
  const [selectedDate, setSelectedDate] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmation, setConfirmation] = useState<AppointmentResponse | null>(null);
  const [error, setError] = useState('');

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const formatTime = (time: string) => {
    const [hour, minute] = time.split(':');
    const hourNum = parseInt(hour);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
    return `${displayHour}:${minute} ${ampm}`;
  };

  const fetchTimeSlots = async (date: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`${API_URL}/appointments?date=${date}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch time slots');
      }
      
      const slots = await response.json();
      setTimeSlots(slots);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load time slots');
      setTimeSlots([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setConfirmation(null);
    setError('');
    
    if (date) {
      fetchTimeSlots(date);
    } else {
      setTimeSlots([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim() || !selectedDate || !selectedTime) {
      setError('Please fill in all fields and select a time slot');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const appointmentData: CreateAppointmentRequest = {
        name: name.trim(),
        email: email.trim(),
        date: selectedDate,
        time: selectedTime
      };

      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to book appointment');
      }

      const result = await response.json();
      setConfirmation(result);
      
      setName('');
      setEmail('');
      setSelectedTime('');
      fetchTimeSlots(selectedDate);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const availableSlots = timeSlots.filter(slot => slot.available);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>Book Your Appointment</h1>
          <p className="welcome-message">
            Schedule a convenient time that works for you. We're here to help.
          </p>
        </header>

        {confirmation ? (
          <div className="confirmation">
            <div className="success-icon">✓</div>
            <h2>Appointment Confirmed!</h2>
            <p>{confirmation.message}</p>
            <div className="appointment-details">
              <p><strong>Name:</strong> {confirmation.appointment.name}</p>
              <p><strong>Date:</strong> {new Date(confirmation.appointment.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {formatTime(confirmation.appointment.time)}</p>
            </div>
            <p className="support-message">
              If you have any questions or need to reschedule, please don't hesitate to contact us. 
              We look forward to supporting you.
            </p>
            <button 
              onClick={() => setConfirmation(null)}
              className="book-another-btn"
            >
              Book Another Appointment
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="appointment-form">
            <div className="form-section">
              <h3>Choose Date</h3>
              <input
                type="date"
                value={selectedDate}
                min={getTomorrowDate()}
                onChange={(e) => handleDateChange(e.target.value)}
                className="date-input"
                required
              />
            </div>

            {selectedDate && (
              <div className="form-section">
                <h3>Available Times</h3>
                {loading ? (
                  <p className="loading">Loading available times...</p>
                ) : availableSlots.length > 0 ? (
                  <div className="time-slots">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot ${selectedTime === slot.time ? 'selected' : ''}`}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-slots">
                    No available time slots for this date. Please try another date.
                  </p>
                )}
              </div>
            )}

            {selectedTime && (
              <div className="form-section">
                <h3>Contact Info</h3>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <p className="privacy-note">
                  Your information is secure and confidential.
                </p>
              </div>
            )}

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {selectedTime && (
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Book Appointment'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default App;