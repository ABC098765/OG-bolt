# Overview

Super Fruit Center is a full-stack e-commerce web application for a fruit delivery service. The application enables users to browse fresh fruits, manage shopping carts, place orders, and track deliveries. It features user authentication via Firebase, real-time notifications, and a comprehensive order management system. The platform is built with React frontend and Express backend, utilizing Firebase services for authentication, database, and cloud messaging.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## August 26, 2025 - 3D Orange Burst Animation Integration

### New Feature Added
- **Enhancement**: Added immersive 3D orange burst animation using Three.js
- **Location**: Integrated behind the "Fresh Fruits Delivered Daily" heading on homepage
- **Behavior**: Orange appears from behind screen, moves forward, then bursts into animated splash particles
- **Technical Implementation**:
  - Uses Three.js for WebGL 3D rendering
  - Fixed positioning overlay with transparent background
  - Auto-triggers every 6 seconds with randomized timing
  - Splash particles with physics-based movement and gravity
  - Proper cleanup and memory management

### Files Added/Modified
- **Added**: `client/src/components/OrangeBehindTextAnimation.tsx` - Main 3D animation component
- **Modified**: `client/src/components/Hero.tsx` - Integrated animation behind hero text
- **Added**: Splash texture assets in `client/public/` (splash1.png, splash2.png, splash3.png)

### Dependencies Added
- `three`: 3D graphics library for WebGL rendering
- `@types/three`: TypeScript definitions for Three.js

## January 24, 2025 - Order Tracking & Reorder Functionality Enhancement

### Issues Identified and Fixed

#### 1. Admin Panel Field Mapping Issue (CRITICAL)
- **Problem**: Admin panel was updating `payment_status` field instead of `order_status` field in Firestore
- **Symptom**: Web app showing "ordered" status while admin panel showed "packed/delivered"
- **Root Cause**: Field name mismatch between admin panel and web application
- **Solution**: Modified real-time listeners to check both fields and use `payment_status` as primary source
- **Files Modified**: 
  - `client/src/pages/OrderDetails.tsx` 
  - `client/src/pages/Orders.tsx`
- **Code Change**: Added field mapping logic:
  ```javascript
  if (orderData && orderData.payment_status) {
    orderData.order_status = orderData.payment_status;
  }
  ```

#### 2. Missing Order Tracking Progress Bar
- **Problem**: Order details page lacked visual progress tracking for order status
- **Solution**: Implemented comprehensive order tracking status bar with 4 stages
- **Features Added**:
  - Visual progress line that fills based on current status
  - Color-coded status indicators (orange → purple → blue → green)
  - Real-time updates synchronized with admin panel changes
  - Responsive design with scaling animations
- **Status Flow**: Order Placed → Packed → Out for Delivery → Delivered
- **File Modified**: `client/src/pages/OrderDetails.tsx`

#### 3. Non-functional Reorder Buttons
- **Problem**: Reorder buttons existed but had no functionality
- **Impact**: Users couldn't easily repurchase previous orders
- **Solution**: Implemented complete reorder functionality for both pages
- **Features Added**:
  - Functional reorder buttons on Orders page and Order Details page
  - Automatic cart addition of all items from selected order
  - Navigation to cart after successful reorder
  - Comprehensive error handling and logging
- **Files Modified**:
  - `client/src/pages/Orders.tsx` - Added useCart hook and onClick handler
  - `client/src/pages/OrderDetails.tsx` - Added useCart hook and onClick handler

#### 4. Stale Data Issue in Reorder (SECURITY/PRICING)
- **Problem**: Initial implementation preserved old order pricing and product details
- **Security Risk**: Users could reorder products at outdated prices
- **Business Risk**: Potential revenue loss from price discrepancies
- **Solution**: Modified reorder to fetch fresh product data from database
- **Implementation**:
  - Uses `firestoreService.getProduct(productId)` to get current product details
  - Fetches latest pricing, images, and availability
  - Graceful handling of discontinued products
  - Proper error logging for unavailable items

### Technical Implementation Details

#### Real-time Order Status Synchronization
- **Technology**: Firebase Firestore real-time listeners
- **Sync Mechanism**: `firestoreService.subscribeToOrder()` and `firestoreService.subscribeToUserOrders()`
- **Field Normalization**: Automatic mapping between `payment_status` and `order_status` fields
- **Cross-platform Compatibility**: Ensures consistency between web app, Android app, and admin panel

#### Order Tracking Status Bar Components
- **Progress Visualization**: Horizontal progress line with percentage-based filling
- **Status Icons**: Lucide React icons (Clock, Package, Truck, CheckCircle)
- **Color Scheme**: 
  - Orange (Order Placed)
  - Purple (Packed) 
  - Blue (Out for Delivery)
  - Green (Delivered)
- **Animation**: CSS transitions with 500ms duration for smooth status changes

#### Reorder Data Flow
```
1. User clicks reorder button
2. Extract product_id from each order item
3. Fetch current product data via firestoreService.getProduct()
4. Add fresh product data to cart via addToCart()
5. Navigate to cart page
6. Handle errors for unavailable products
```

### Error Handling Improvements
- **Product Availability**: Skip discontinued products with user notification
- **Network Errors**: Graceful degradation with error logging
- **Field Mapping**: Fallback logic for missing status fields
- **Type Safety**: TypeScript interfaces for consistent data handling

### Performance Optimizations
- **Real-time Listeners**: Efficient Firebase listener cleanup to prevent memory leaks
- **Batch Operations**: Sequential product fetching during reorder to maintain data integrity
- **State Management**: Optimized React state updates to minimize re-renders

### Multi-platform Synchronization
- **Web App**: Real-time status updates with visual progress tracking
- **Android App**: Maintains data consistency through shared Firestore schema
- **Admin Panel**: Status changes immediately reflected across all platforms
- **Field Mapping**: Transparent handling of different field naming conventions

### Testing & Validation
- **Real-time Sync**: Verified instant status updates when admin panel changes order status
- **Reorder Functionality**: Confirmed fresh data fetching and proper cart addition
- **Error Handling**: Tested graceful degradation for unavailable products
- **Cross-platform**: Validated synchronization between all three platforms

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