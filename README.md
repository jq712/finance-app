# Finance App

A full-stack personal finance management application for tracking expenses, managing household budgets, and sharing transactions with family members.

## Project Overview

This project consists of two main components:

1. **Backend**: A Flask API with MySQL database
2. **Frontend**: A React application with a dark theme UI

## Features

- User authentication with Auth0
- Multi-household support with member management
- Transaction tracking and categorization
- Dashboard with transaction summaries and charts
- Invite system for households

## Tech Stack

### Backend

- Flask (Python)
- MySQL database
- Auth0 for authentication

### Frontend

- React 18
- Vite
- Chart.js for data visualization
- Auth0 for authentication

## Project Structure

```
finance-app/
├── back_end/           # Flask API
│   ├── routes/         # API endpoints
│   ├── schema/         # Database schema definitions
│   ├── auth.py         # Authentication logic
│   ├── config.py       # Application configuration
│   ├── database.py     # Database connection and queries
│   └── requirements.txt # Backend dependencies
│
├── front-end/          # React application
│   ├── src/            # React source files
│   ├── public/         # Static assets
│   └── package.json    # Frontend dependencies
│
└── run.py              # Backend application entry point
```

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.9+
- MySQL database

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd back_end
   ```
2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Create a `.env` file with the following variables:

   ```
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DB=spending_tracker

   AUTH0_DOMAIN=your_auth0_domain
   AUTH0_API_AUDIENCE=your_auth0_audience

   SECRET_KEY=your_secret_key
   ```

5. Start the backend server:
   ```
   python run.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd front-end
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   VITE_AUTH0_DOMAIN=your_auth0_domain
   VITE_AUTH0_CLIENT_ID=your_auth0_client_id
   VITE_AUTH0_AUDIENCE=your_auth0_audience
   VITE_API_URL=http://127.0.0.1:5000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Deployment

The application can be deployed as two separate services:

- The backend API can be deployed to a Python hosting platform
- The frontend can be built and deployed to any static site hosting

## License

MIT
