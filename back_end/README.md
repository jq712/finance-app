# Finance App

A personal finance management application built with Flask to track expenses, manage household budgets, and share transactions.

## Features

- User authentication and authorization
- Multi-household support with member management
- Transaction tracking and categorization
- Invite system for households

## Tech Stack

- Backend: Flask (Python)
- Database: MySQL
- Authentication: JWT

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r back_end/requirements.txt
   ```
3. Set up environment variables in `.env`
4. Run the application:
   ```
   python run.py
   ```

## API Endpoints

- `/auth` - User registration and authentication
- `/households` - Household management
- `/transactions` - Transaction tracking and reporting

## Project Structure

```
├── back_end/
│   ├── routes/         # API endpoints
│   ├── schema/         # Database schema definitions
│   ├── auth.py         # Authentication logic
│   ├── config.py       # Application configuration
│   ├── database.py     # Database connection and queries
│   └── requirements.txt # Project dependencies
└── run.py              # Application entry point
```

## License

MIT
