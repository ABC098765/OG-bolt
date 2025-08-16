# Overview

Super Fruit Center is a full-stack e-commerce web application for a fruit delivery service. The application enables users to browse fresh fruits, manage shopping carts, place orders, and track deliveries. It features user authentication via Firebase, real-time notifications, and a comprehensive order management system. The platform is built with React frontend and Express backend, utilizing Firebase services for authentication, database, and cloud messaging.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development experience
- **Routing**: React Router for single-page application navigation
- **State Management**: React Context API with useReducer for cart and authentication state
- **UI Framework**: TailwindCSS for utility-first styling with shadcn/ui component library for consistent design
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Server**: Express.js with TypeScript for RESTful API endpoints
- **Development**: Hot module replacement with Vite integration for seamless full-stack development
- **Database ORM**: Drizzle ORM for type-safe database operations with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL store for persistent user sessions

## Authentication & Authorization
- **Primary Auth**: Firebase Authentication supporting Google OAuth and phone number verification
- **Phone Verification**: Firebase phone authentication with reCAPTCHA verification
- **Session Persistence**: Firebase auth state persistence with automatic token refresh
- **User Management**: Custom user profiles stored in Firebase Firestore

## Data Storage Strategy
- **Primary Database**: PostgreSQL with Drizzle ORM for relational data (configured but using Neon serverless)
- **User Data**: Firebase Firestore for user profiles, orders, addresses, and notifications
- **Schema Design**: Hybrid approach - core entities in PostgreSQL, user-specific data in Firestore
- **Real-time Data**: Firestore for real-time updates on orders and notifications

## Real-time Features
- **Push Notifications**: Firebase Cloud Messaging (FCM) for order status updates
- **Service Worker**: Custom service worker for background notification handling
- **Real-time Updates**: Firestore real-time listeners for order status changes

## Key Architectural Decisions

### Database Architecture Choice
- **Problem**: Need for both relational data integrity and real-time capabilities
- **Solution**: Hybrid database approach using PostgreSQL for core schema and Firestore for user data
- **Rationale**: Leverages PostgreSQL's ACID properties while maintaining Firebase's real-time features
- **Trade-offs**: Increased complexity but better scalability and real-time performance

### Authentication Strategy
- **Problem**: Secure user authentication with multiple login methods
- **Solution**: Firebase Authentication with phone and Google OAuth support
- **Rationale**: Reduces security implementation complexity while supporting modern auth flows
- **Benefits**: Built-in security, multi-factor options, and social login integration

### State Management Pattern
- **Problem**: Complex state sharing between components for cart and auth
- **Solution**: React Context with useReducer pattern
- **Rationale**: Avoids prop drilling while maintaining predictable state updates
- **Alternative Considered**: Redux - rejected for simpler application requirements

### Component Architecture
- **Problem**: Maintainable and reusable UI components
- **Solution**: shadcn/ui component library with TailwindCSS
- **Rationale**: Provides consistent design system with customizable components
- **Benefits**: Faster development, consistent UX, and easy theming

# External Dependencies

## Firebase Services
- **Firebase Auth**: User authentication and session management
- **Firebase Firestore**: NoSQL database for user data, orders, and real-time features
- **Firebase Cloud Messaging**: Push notifications for order updates
- **Firebase Hosting**: Production deployment platform

## Database Services
- **Neon Database**: Serverless PostgreSQL for core application data
- **Drizzle Kit**: Database migrations and schema management

## UI & Styling
- **Radix UI**: Unstyled, accessible component primitives
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production builds

## Third-party Libraries
- **TanStack React Query**: Server state management and caching
- **React Hook Form**: Form handling with validation
- **Date-fns**: Date manipulation and formatting
- **Class Variance Authority**: Conditional CSS class management

## API Integrations
- **Google OAuth**: Social authentication provider
- **Firebase APIs**: Real-time database and cloud messaging
- **Payment Processing**: Prepared for payment gateway integration