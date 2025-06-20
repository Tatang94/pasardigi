# Digital Marketplace Application

## Overview
This is a full-stack digital marketplace application built with React, Express, and PostgreSQL. The application allows users to browse and purchase digital products, with features for authentication, shopping cart functionality, and administrative controls.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state
- **Build Tool**: Vite for development and building
- **UI Components**: Comprehensive shadcn/ui component library

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **API Design**: RESTful API endpoints

### Database Architecture
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with Neon serverless driver
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: Neon serverless connection pooling

## Key Components

### Authentication System
- **Provider**: Replit Auth integration with OpenID Connect
- **Session Storage**: PostgreSQL-backed session store using connect-pg-simple
- **User Management**: User profiles with admin role support
- **Security**: HTTP-only cookies with secure session handling

### Database Schema
- **Users**: Authentication and profile management
- **Categories**: Product categorization system
- **Products**: Digital product catalog with seller information
- **Orders & Order Items**: Purchase transaction management
- **Cart Items**: Shopping cart functionality
- **Sessions**: Session persistence for authentication

### API Structure
- **Authentication Routes**: `/api/auth/*` for login/logout/user info
- **Product Routes**: `/api/products` for product CRUD operations
- **Category Routes**: `/api/categories` for category management
- **Cart Routes**: `/api/cart` for shopping cart operations
- **Order Routes**: `/api/orders` for order processing

### Frontend Pages
- **Landing**: Unauthenticated user welcome page
- **Home**: Main marketplace dashboard
- **Products**: Product browsing with search and filtering
- **Cart**: Shopping cart management
- **User Dashboard**: User order history and profile
- **Admin Dashboard**: Administrative controls for products and categories

## Data Flow

### Authentication Flow
1. User accesses protected routes
2. Middleware checks session validity
3. Redirects to Replit Auth if unauthenticated
4. Returns user data on successful authentication
5. Stores session in PostgreSQL

### Product Management Flow
1. Admin creates/edits products through admin dashboard
2. Products are stored with category associations
3. Products appear in public catalog with search/filter capabilities
4. Users can add products to cart
5. Cart items persist across sessions

### Purchase Flow
1. Users add products to cart
2. Cart items are stored in database with user association
3. Users initiate checkout process
4. Orders are created with associated order items
5. Cart is cleared upon successful order creation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **express**: Node.js web framework
- **passport**: Authentication middleware

### UI Dependencies
- **@radix-ui/***: Unstyled UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **react-hook-form**: Form handling with validation

### Development Dependencies
- **vite**: Build tool and dev server
- **typescript**: Type checking
- **tsx**: TypeScript execution for Node.js

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public`
- **Backend**: esbuild bundles server code to `dist/index.js`
- **Assets**: Static files served from built frontend

### Production Configuration
- **Environment**: NODE_ENV=production
- **Database**: Requires DATABASE_URL environment variable
- **Session**: Requires SESSION_SECRET for secure sessions
- **Auth**: Requires REPLIT_DOMAINS and ISSUER_URL for authentication

### Hosting Requirements
- **Node.js**: Runtime environment
- **PostgreSQL**: Database with session table support
- **Port**: Configurable (default 5000)
- **SSL**: Required for production authentication

## Changelog
- June 13, 2025. Initial setup
- June 13, 2025. Completed full marketplace with admin functionality and sample data
- June 20, 2025. Migrated from Replit Auth to custom email/phone authentication system
- June 20, 2025. Separated login and register buttons for better UX
- June 20, 2025. Reduced DigitalMarket logo size for cleaner header design
- January 6, 2025. Successfully migrated from Replit Agent to Replit environment
- January 6, 2025. Created demo users for testing (demo@demo.com/demo123 and admin@demo.com/admin123)
- January 6, 2025. Fixed session authentication system - admin login now works properly
- January 6, 2025. Created dedicated admin dashboard at /admin route with proper access control

## User Preferences
Preferred communication style: Simple, everyday language.
Language: Indonesian (Bahasa Indonesia)
UI preferences: Clean, modern design with separated login/register flows