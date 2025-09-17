# 🎬 Filmchi - Smart Movie Recommendation Platform

A **sleek, cinematic, and immersive** movie recommendation platform built with React 18, TypeScript, and Material-UI. Experience premium streaming service aesthetics with Netflix-level polish and modern minimalism.

![Filmchi Preview](https://via.placeholder.com/800x400/5A67D8/FFFFFF?text=Filmchi+Preview)

## ✨ Features

### 🎯 Phase 2 Implementation Complete

- **🎨 Ultra-Polished UI**: Premium streaming service aesthetics with crisp, high-fidelity rendering
- **📱 Responsive Design**: Seamless experience across desktop, tablet, and mobile
- **🌙 Dark/Light Mode**: Beautiful theme switching with smooth transitions  
- **🌍 Internationalization**: Full support for English and Persian (Farsi)
- **🎭 Advanced Animations**: Framer Motion powered micro-interactions and page transitions
- **🔍 Smart Search**: Direct TMDB API integration with real-time movie search
- **📋 List Management**: Multiple list types (Watchlist, Favorites, Bookmarks, Playlists)
- **♾️ Infinite Scrolling**: Smooth pagination with optimistic updates
- **🚀 Performance Optimized**: React.memo, useMemo, and lazy loading throughout

### 🎬 Movie Experience

- **Visual Masterpiece Cards**: 2/3 aspect ratio with gradient overlays and hover effects
- **Cinematic Loading States**: Pulse animations and staggered card reveals
- **Optimistic Updates**: Instant UI feedback for add/remove actions
- **Search Modal**: Full-screen backdrop blur with advanced search capabilities

## 🛠️ Technology Stack

- **Framework**: React 18 with TypeScript (strict mode)
- **UI Library**: Material-UI v5 (heavily customized)
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query with optimistic updates
- **Forms**: React Hook Form v7 with Zod schemas
- **Animations**: Framer Motion with spring physics
- **Routing**: React Router DOM v6
- **Notifications**: React Hot Toast (custom styled)
- **Icons**: MUI Icons Material
- **Styling**: MUI sx prop with custom theme system

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd filmchi-front
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   # TMDB API Configuration
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   
   # Backend API Configuration  
   VITE_API_BASE_URL=http://localhost:3000/api
   
   # App Configuration
   VITE_APP_NAME=Filmchi
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Design System

### Color Palette

**Light Mode:**
- Primary: `#5A67D8` (Indigo-blue spectrum)
- Secondary: `#48BB78` (Success green)
- Background: `#F7FAFC` / `#FFFFFF`
- Text: `#2D3748` / `#718096`

**Dark Mode:**
- Primary: `#818CF8` 
- Secondary: `#68D391`
- Background: `#1A202C` / `#2D3748`
- Text: `#E2E8F0` / `#A0AEC0`

### Typography

- **Persian**: Vazirmatn (loaded via Google Fonts)
- **English**: Roboto with system fallbacks
- **Custom Scale**: Fibonacci-inspired spacing (8px, 12px, 20px)

### Component Styling

- **Cards**: 16px border radius, elevated shadows, hover transforms
- **Buttons**: 12px border radius, no text transform, 600 font weight
- **Inputs**: 8px border radius, focus glow effects

## 📁 Project Structure

```
src/
├── api/              # API client and movie services
├── components/       # Reusable UI components
├── i18n/            # Internationalization setup
├── layouts/         # Page layouts (Dashboard)  
├── pages/           # Route components
├── routes/          # Route configuration
├── store/           # Zustand stores
├── theme/           # MUI theme customization
└── assets/          # Static assets
```

## 🔧 Key Components

### MovieCard
- **Height**: 300px uniform cards
- **Aspect Ratio**: 2/3 for poster images  
- **Animations**: Scale, rotateX hover effects with spring physics
- **Actions**: Add/Remove with optimistic updates

### DashboardLayout  
- **Sidebar**: Mini/expanded states with hover
- **Header**: Sticky with backdrop blur
- **Search**: Integrated search bar
- **Responsive**: Mobile-first design

### SearchPage
- **Modal**: Full-screen with backdrop blur
- **TMDB Integration**: Direct API calls
- **Infinite Scroll**: Load more functionality
- **States**: Loading, error, empty, results

## 🌐 API Integration

### Backend Endpoints
- `GET /lists/{listName}` - Fetch user lists with pagination
- `POST /lists/{listName}` - Add movie to list
- `DELETE /lists/{listName}/{tmdbId}` - Remove movie from list

### TMDB Integration
- Direct frontend calls to TMDB API
- Movie search with pagination
- Poster image optimization (w500 size)

## 🎯 Performance Optimizations

- **React.memo**: Prevent unnecessary re-renders
- **useMemo**: Expensive calculations
- **Lazy Loading**: Images with `loading="lazy"`
- **Code Splitting**: Route-based splitting
- **Bundle Size**: Target <2MB total
- **Optimistic Updates**: Instant UI feedback

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 🚀 Building for Production

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎭 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/600x400/5A67D8/FFFFFF?text=Dashboard+View)

### Search Modal
![Search](https://via.placeholder.com/600x400/48BB78/FFFFFF?text=Search+Modal)

### Movie Lists
![Lists](https://via.placeholder.com/600x400/818CF8/FFFFFF?text=Movie+Lists)

### Dark Mode
![Dark Mode](https://via.placeholder.com/600x400/1A202C/E2E8F0?text=Dark+Mode)

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **TMDB**: This product uses the TMDB API but is not endorsed or certified by TMDB
- **Material-UI**: For the incredible component library
- **Framer Motion**: For smooth animations
- **React Query**: For data fetching excellence

---

**Made with ❤️ by the Filmchi Team**
