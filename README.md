# BIT-Sports-Council-Hub

A sports council management system for equipment, teams, players, venues, tournaments, matches, and role-based dashboards.

## Structure

- `frontend/` React UI with pages for login, admin, coach, and student
- `backend/` Express API with MongoDB models, controllers, routes, and middleware
- `.gitignore` workspace ignore rules

## Core Roles

- Admin: manage equipment, teams, players, venues, tournaments, and users
- Coach/Faculty: manage team/player details and coordinate schedules
- Student/Player: register from the home page, wait for admin approval, then view equipment, tournaments, schedules, and submit requests

## Authentication Flow

- Students can register only from the home page register button
- New student accounts are created as pending
- Admin approves pending students before they can log in
- JWT is used for authenticated API calls and role-based dashboard access

## Key Workflows

- Equipment request -> approval -> issue -> return -> inventory update
- Tournament -> teams -> venue -> schedule -> conflict check -> match

## Run

- Frontend: `cd frontend && npm install && npm run dev`
- Backend: `cd backend && npm install && npm run dev`
