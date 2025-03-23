# Finance App Frontend

The React frontend for the Finance App, featuring a dark theme inspired by X.com.

## Features

- User authentication with Auth0
- Dashboard with transaction summaries and charts
- Transaction management
- Household creation and member management
- Dark theme UI design

## Tech Stack

- React 18
- Vite
- React Router
- Auth0 for authentication
- Chart.js for data visualization
- Axios for API requests
- date-fns for date manipulation

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd front-end
   npm install
   ```
3. Create a `.env` file with Auth0 configuration (see `.env.example`)
4. Start the development server:
   ```
   npm run dev
   ```

The development server will run on http://localhost:3000 by default and will proxy API requests to the backend at http://localhost:5000.

## Authentication Setup

This application uses Auth0 for authentication. You'll need to set up an Auth0 application and API in the Auth0 dashboard and configure the following environment variables:

- `VITE_AUTH0_DOMAIN` - Your Auth0 domain
- `VITE_AUTH0_CLIENT_ID` - Your Auth0 client ID
- `VITE_AUTH0_AUDIENCE` - Your Auth0 API audience identifier

## Building for Production

To build the application for production, run:

```
npm run build
```

The build will be generated in the `dist` directory. You can then serve it using a static file server or a CDN.

## Project Structure

- `src/components` - React components organized by feature
- `src/contexts` - React context providers for state management
- `src/services` - API service modules
- `src/utils` - Utility functions
- `src/styles` - CSS files

## API Integration

The frontend integrates with the backend API using an Axios-based service. All API requests include the Auth0 token for authentication. The API base URL is configured to use the development proxy in development and the same domain in production.
