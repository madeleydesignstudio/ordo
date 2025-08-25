# Ordo Marketing Landing Page

A modern, minimalist landing page for Ordo inspired by athas.dev design aesthetics. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- **Clean Design**: Minimalist design inspired by athas.dev with modern typography
- **Responsive**: Mobile-first responsive design that looks great on all devices
- **Waitlist Form**: Interactive email signup form with loading states and success feedback
- **Roadmap**: Visual roadmap showing 4 key development phases
- **Animations**: Subtle animations and micro-interactions for enhanced UX
- **TypeScript**: Full TypeScript support for type safety
- **Component Architecture**: Modular, reusable React components

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm/yarn

### Installation

From the project root directory:

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Or specifically for the marketing app:

```bash
# Navigate to marketing app
cd apps/marketing

# Start development server
pnpm dev
```

The landing page will be available at `http://localhost:3000`

## Project Structure

```
apps/marketing/
├── app/
│   ├── layout.tsx          # Root layout with metadata and providers
│   └── page.tsx            # Main landing page
├── components/
│   ├── providers.tsx       # Theme and context providers
│   ├── waitlist-form.tsx   # Interactive waitlist signup form
│   └── roadmap.tsx         # Product roadmap component
└── README.md               # This file
```

## Components

### WaitlistForm
Interactive email signup form with:
- Email validation
- Loading states
- Success confirmation
- Waitlist counter
- Local state management

### Roadmap  
Product roadmap display with:
- 4 configurable roadmap items
- Visual status indicators (in progress/planned)
- Staggered animations
- Responsive layout

## Customization

### Roadmap Items
Edit `roadmapItems` array in `components/roadmap.tsx`:

```typescript
const roadmapItems: RoadmapItem[] = [
  {
    title: "your feature",
    description: "feature description",
    status: "in-progress" | "planned",
  },
  // ... more items
];
```

### Waitlist Count
Modify `initialCount` in `components/waitlist-form.tsx` or pass as prop:

```typescript
<WaitlistForm initialCount={2000} />
```

### Styling
- Uses Tailwind CSS with custom color palette
- Supports dark/light theme via next-themes
- Consistent with ordo UI design system

## Integration Notes

### Loops Integration
The waitlist form is integrated with Loops email marketing platform:

1. **Environment Setup**: Configure your Loops credentials in `.env`:
```bash
NEXT_LOOP_FORM_ENDPOINT=https://app.loops.so/api/newsletter-form/YOUR_FORM_ID
NEXT_LOOP_FORM_ID=YOUR_FORM_ID
```

2. **API Route**: The form submits to `/api/waitlist` which handles:
   - Email validation
   - Loops API integration
   - Error handling and responses
   - Automatic tagging with "Waitlist" user group

3. **Contact Properties**: Automatically sets:
   - `email`: User's email address
   - `source`: "Ordo Landing Page"
   - `userGroup`: "Waitlist"

4. **Testing**: Use `/api/health` endpoint to verify Loops configuration

To get your Loops credentials:
1. Go to [Loops Forms page](https://app.loops.so/forms)
2. Click Settings tab
3. Copy the Form Endpoint URL and Form ID

### Analytics
Consider adding analytics tracking for:
- Page views
- Waitlist signups
- Form interactions
- Roadmap engagement

## Design System

The landing page uses the ordo UI design system with:
- **Typography**: Geist and Geist Mono fonts
- **Colors**: Blue accent (#3b82f6), gray scale palette
- **Components**: Shared UI components from `@ordo/ui`
- **Spacing**: Consistent spacing scale
- **Animations**: Subtle fade-in and slide-in effects

## Performance

- Static generation optimized for fast loading
- Minimal JavaScript bundle
- Optimized fonts and assets
- Responsive images support

## Deployment

The app is configured for deployment on Vercel, Netlify, or any static hosting:

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Contributing

1. Make changes to components in `components/` directory
2. Update page content in `app/page.tsx`
3. Test responsive design across devices
4. Ensure accessibility standards are met
5. Run type checking: `pnpm typecheck`
6. Run linting: `pnpm lint`

## License

Part of the Ordo project ecosystem.