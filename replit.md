# Overview

This is a Next.js 14 portfolio website for Dmytro Kifuliak, a designer with 7+ years of experience. The site showcases personal projects, commercial work, case studies, and journal entries. Built with the App Router, TypeScript, and Tailwind CSS, it features a clean, minimal design system with custom typography (PP Neue Montreal font) and integrates with Notion as a headless CMS.

The application is deployed on Vercel with ISR (Incremental Static Regeneration) caching to optimize performance while keeping content fresh. The architecture supports multiple content types (cases, projects, blog posts, commercial work) sourced from different Notion databases.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Framework
- **Next.js 14 App Router**: Server-first architecture with selective client components
- **TypeScript**: Full type safety across the application
- **Tailwind CSS + shadcn/ui**: Utility-first styling with pre-built accessible components
- **Custom Font System**: PP Neue Montreal loaded via font-face declarations

## Content Management Strategy
- **Headless CMS**: Notion databases serve as the primary content source
- **Multi-Database Setup**: Separate databases for different content types:
  - Cases/Projects (main portfolio work)
  - Personal Projects
  - Commercial Projects  
  - Blog Posts/Journal
- **CMS Adapter Pattern**: Abstract interface (`CMSAdapter`) allows for future CMS platform additions beyond Notion

## Caching Architecture
- **ISR (Incremental Static Regeneration)**: 30-minute revalidation period (`revalidate = 1800`)
- **Two-Tier Caching Strategy**:
  - Server components (e.g., `/work`, `/work/[slug]`): Static generation with automatic revalidation
  - Client components (homepage, filtered views): API-level caching via `unstable_cache` with tag-based invalidation
- **Cache Tags**: Hierarchical tag system (`cms:all`, `cms:cases`, etc.) for granular cache invalidation
- **On-Demand Revalidation**: API endpoint (`/api/revalidate`) supports path-based and tag-based cache clearing

## Routing Structure
- `/` - Homepage with filtered project cards (client component)
- `/work` - Main case studies listing (server component with ISR)
- `/work/[slug]` - Individual case study pages (server component with ISR)
- `/personal-projects` - Personal portfolio work
- `/commercial` - Commercial client projects
- `/journal` - Blog posts from Notion

## Component Architecture
- **Separation of Concerns**: Navigation, Footer, and utility components isolated for reuse
- **Client Boundary Optimization**: "use client" directive applied only where interactivity is needed
- **Image Handling**: Error fallbacks and lazy loading with Next.js Image optimization
- **Modal/Lightbox Pattern**: Full-screen image galleries with keyboard navigation

## Data Fetching Pattern
- **Server-Side Fetching**: Direct Notion API calls in server components
- **API Routes**: Client components fetch from Next.js API routes (e.g., `/api/cases`, `/api/projects`)
- **Error Handling**: Graceful degradation with fallback data and user-friendly error messages
- **Slug Generation**: Automatic URL-friendly slug creation from project titles

## Navigation System
- **Dynamic Active State**: Path-based highlighting with support for nested routes
- **Category Filtering**: Badge-based filtering on homepage and commercial page
- **History Tracking**: Previous path tracking for back navigation

# External Dependencies

## Content Management
- **Notion API** (`@notionhq/client`): Primary CMS integration
  - Multiple database connections via environment variables
  - Rich text parsing and file extraction
  - Multi-select property handling for categories/tags
- **Content Registry** (`content.config.ts`): Centralized configuration mapping collections to CMS providers and cache settings

## UI Component Library
- **Radix UI**: Headless accessible components (Dialog, Dropdown, Accordion, etc.)
- **shadcn/ui**: Pre-styled component system built on Radix primitives
- **Lucide Icons**: Icon library for consistent visual language

## Build & Deployment
- **Vercel Platform**: Edge deployment with automatic preview environments
- **pnpm**: Package manager with workspace support
- **Next.js Build System**: Static generation with streaming and partial prerendering capabilities

## Development Tools
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Tailwind CSS**: JIT compilation for optimized CSS output

## API Integrations
- No external third-party APIs beyond Notion
- Future extensibility for Contentful, Sanity, Strapi, Ghost, or Hygraph via adapter pattern

## Performance Optimizations
- Font preloading with `font-display: swap`
- Image optimization via Next.js Image component
- Code splitting at route level
- ISR caching reduces Notion API calls and improves response times