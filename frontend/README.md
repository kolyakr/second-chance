# Second Chance Frontend

Frontend application for Second Chance - a community-driven social platform for second-hand clothing.

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Forms**: Formik + Yup
- **UI Library**: Material-UI (MUI)
- **Real-time**: Socket.io Client
- **Notifications**: React Hot Toast

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the frontend root directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/      # Reusable components
│   │   ├── Layout/      # Header, Footer, Layout
│   │   └── Posts/       # Post-related components
│   ├── config/          # Configuration files
│   │   ├── api.ts       # Axios instance
│   │   └── socket.ts    # Socket.io client
│   ├── pages/           # Page components
│   │   ├── Auth/        # Login, Register, etc.
│   │   ├── Posts/       # Posts pages
│   │   ├── User/        # User pages
│   │   ├── Messages/    # Messaging
│   │   └── Admin/       # Admin panel
│   ├── services/        # API service functions
│   ├── stores/          # Zustand stores
│   ├── theme.ts         # MUI theme configuration
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Features

- ✅ User authentication (Login, Register, Password Reset)
- ✅ Post browsing and filtering
- ✅ Post creation and management
- ✅ Comments system
- ✅ Likes/Stars
- ✅ User profiles
- ✅ Responsive design
- 🔄 Real-time messaging (in progress)
- 🔄 Admin panel (in progress)

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)
- `VITE_SOCKET_URL` - Socket.io server URL (default: http://localhost:5000)

## Notes

- The frontend uses Vite for fast development and building
- Material-UI provides a modern, responsive design
- React Query handles caching and data synchronization
- Zustand manages global authentication state
- Socket.io client is set up for real-time features
