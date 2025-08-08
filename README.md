# Appointment Scheduler

A simple web app for booking mental health appointments. Built with React + TypeScript frontend and Node.js + Express backend.

## How to run it

### Backend
```bash
cd backend
npm install
npm run dev
```
Server runs on http://localhost:3001

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs on http://localhost:5173

## What it does

- Pick a date and see available time slots (9 AM - 5:30 PM)
- Enter your name and email
- Book the appointment
- Shows confirmation when done
- Prevents double-booking the same time slot

## API

**GET /appointments?date=2024-12-15**
Returns available time slots for that date

**POST /appointments**
Books an appointment with name, email, date, and time

## Tech stack

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Storage: In-memory (resets when server restarts)

## Files

- `backend/src/index.ts` - Main server file
- `frontend/src/App.tsx` - Main React component
- `backend/src/types.ts` & `frontend/src/types.ts` - TypeScript interfaces