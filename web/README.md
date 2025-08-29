# ManoMitra Frontend

A comprehensive mental wellness and support platform for campus life, built with Next.js 14, React, and modern web technologies.

## 🚀 Features

### Core Features
- **Multi-Role Authentication**: Student, Counsellor, Volunteer, and Admin roles
- **Responsive Dashboard**: Role-specific dashboards with comprehensive functionality
- **Real-time Communication**: WebSocket integration for live chat and notifications
- **Advanced UI Components**: Built with Radix UI and Tailwind CSS
- **Form Validation**: Comprehensive form handling with react-hook-form and Zod
- **Error Handling**: Robust error boundaries and user-friendly error messages
- **Theme Support**: Light/dark mode with next-themes

### Role-Specific Features

#### Students
- Book counselling sessions
- Create and manage reports
- Connect with counsellors and volunteers
- Join peer support rooms
- View notifications and updates

#### Counsellors
- Manage student bookings and schedule
- Handle assigned reports
- View performance metrics
- Manage student connections

#### Volunteers
- Moderate peer support rooms
- Provide peer assistance
- Track performance metrics
- Complete training modules

#### Administrators
- User management across all roles
- System analytics and reporting
- Emergency access controls
- System configuration

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 14**: App Router, Server Components, API Routes
- **React 18**: Hooks, Context, Error Boundaries
- **TypeScript**: Full type safety and IntelliSense

### State Management
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation

### UI Components
- **Radix UI**: Accessible, unstyled components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Framer Motion**: Smooth animations and transitions

### Styling & Theming
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Dynamic theming support
- **Responsive Design**: Mobile-first approach

### Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Prettier**: Code formatting

## 📁 Project Structure

```
web/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # Authentication routes
│   │   ├── login/              # Login page
│   │   └── register/           # Registration page
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── student/            # Student dashboard
│   │   ├── counsellor/         # Counsellor dashboard
│   │   ├── volunteer/          # Volunteer dashboard
│   │   └── admin/              # Admin dashboard
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Landing page
├── components/                  # Reusable components
│   ├── ui/                     # Base UI components
│   │   ├── button.tsx         # Button component
│   │   ├── card.tsx           # Card component
│   │   ├── input.tsx          # Input component
│   │   ├── select.tsx         # Select component
│   │   ├── tabs.tsx           # Tabs component
│   │   ├── badge.tsx          # Badge component
│   │   ├── avatar.tsx         # Avatar component
│   │   ├── form.tsx           # Form components
│   │   ├── spinner.tsx        # Loading components
│   │   └── responsive-container.tsx # Responsive utilities
│   ├── layout/                 # Layout components
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── header.tsx         # Dashboard header
│   │   └── dashboard-layout.tsx # Main dashboard layout
│   └── error-boundary.tsx     # Error handling
├── lib/                        # Utility libraries
│   ├── api.ts                 # API service layer
│   ├── axios.ts               # HTTP client configuration
│   ├── constants.ts           # Application constants
│   └── utils.ts               # Utility functions
├── store/                      # State management
│   └── auth.store.ts          # Authentication store
├── types/                      # TypeScript type definitions
│   └── auth.d.ts              # Authentication types
├── providers/                  # Context providers
│   └── auth-provider.tsx      # Authentication provider
├── middleware.ts               # Next.js middleware
├── package.json                # Dependencies and scripts
└── tailwind.config.js         # Tailwind CSS configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running (see server/README.md)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ManoMitra/web
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
   Create a `.env.local` file in the `web` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000
   NEXT_PUBLIC_WS_URL=ws://localhost:5000
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style

- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Consistent code formatting
- **Component Structure**: Functional components with hooks

### Component Guidelines

1. **Use TypeScript interfaces** for all props and state
2. **Implement error boundaries** for critical components
3. **Follow accessibility guidelines** with ARIA labels
4. **Use responsive design** with mobile-first approach
5. **Implement loading states** for async operations

## 🎨 UI Components

### Base Components
- **Button**: Multiple variants (default, outline, ghost, destructive)
- **Card**: Flexible container with header, content, and footer
- **Input**: Form input with validation states
- **Select**: Dropdown selection with search
- **Tabs**: Tabbed navigation interface
- **Badge**: Status indicators and labels
- **Avatar**: User profile images with fallbacks

### Layout Components
- **Sidebar**: Role-based navigation
- **Header**: User profile and notifications
- **DashboardLayout**: Main dashboard structure

### Form Components
- **Form**: Form provider with validation
- **FormField**: Individual form field wrapper
- **FormLabel**: Accessible form labels
- **FormControl**: Form input wrapper
- **FormMessage**: Validation error display

## 🔐 Authentication

### Features
- **JWT-based authentication** with refresh tokens
- **Role-based access control** (RBAC)
- **Persistent sessions** with Zustand
- **Automatic token refresh** via Axios interceptors
- **Protected routes** with Next.js middleware

### Implementation
- **Auth Store**: Centralized authentication state
- **Auth Provider**: Context provider for auth state
- **Middleware**: Route protection and redirection
- **API Integration**: Secure API calls with credentials

## 📱 Responsive Design

### Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Features
- **Mobile-first approach** with progressive enhancement
- **Touch-friendly interfaces** for mobile devices
- **Responsive grids** that adapt to screen size
- **Collapsible navigation** for small screens
- **Optimized typography** across all devices

## 🚨 Error Handling

### Error Boundaries
- **Component-level error catching**
- **User-friendly error messages**
- **Retry mechanisms** for failed operations
- **Fallback UI** for broken components

### API Error Handling
- **Automatic retry** for network failures
- **User notification** via toast messages
- **Graceful degradation** when services are unavailable
- **Error logging** for debugging

## 🧪 Testing

### Testing Strategy
- **Unit tests** for utility functions
- **Component tests** with React Testing Library
- **Integration tests** for API interactions
- **E2E tests** for critical user flows

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 📦 Build & Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Variables
- **Development**: `.env.local`
- **Production**: Set in deployment platform
- **Required**: `NEXT_PUBLIC_API_URL`

### Deployment Platforms
- **Vercel**: Recommended for Next.js
- **Netlify**: Alternative deployment option
- **Docker**: Containerized deployment
- **Self-hosted**: Custom server setup

## 🔒 Security

### Features
- **HTTPS enforcement** in production
- **CSP headers** for XSS protection
- **CSRF protection** via SameSite cookies
- **Input sanitization** and validation
- **Secure authentication** with JWT

### Best Practices
- **Environment variables** for sensitive data
- **Input validation** on both client and server
- **Error message sanitization** to prevent information leakage
- **Regular dependency updates** for security patches

## 📊 Performance

### Optimization
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** and optimization
- **Lazy loading** for non-critical components
- **Service worker** for offline support

### Monitoring
- **Core Web Vitals** tracking
- **Performance metrics** collection
- **Error tracking** and reporting
- **User experience** analytics

## 🤝 Contributing

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests** for new functionality
5. **Submit a pull request**

### Code Review
- **TypeScript compliance** required
- **ESLint rules** must pass
- **Test coverage** should be maintained
- **Accessibility** guidelines followed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Email**: Contact the development team

### Common Issues
- **Build errors**: Check Node.js version and dependencies
- **API errors**: Verify backend server is running
- **Type errors**: Ensure TypeScript is properly configured
- **Styling issues**: Check Tailwind CSS configuration

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- Multi-role authentication system
- Responsive dashboard interfaces
- Real-time communication features
- Comprehensive error handling
- Production-ready UI components

---

**Built with ❤️ for mental wellness and campus support**
