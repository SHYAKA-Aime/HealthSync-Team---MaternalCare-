# MaternalCare+ Frontend

React + Vite + TypeScript + Tailwind CSS

## Setup Instructions

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env if needed
```

3. **Run development server:**
```bash
npm run dev
```

4. **Build for production:**
```bash
npm run build
```

5. **Preview production build:**
```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── services/       # API services
├── utils/          # Utility functions
├── types/          # TypeScript type definitions
└── styles/         # Additional styles
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Development Tips

- Use TypeScript for type safety
- Follow component naming conventions (PascalCase)
- Use Tailwind utility classes for styling
- Keep components small and focused
- Write reusable utility functions

Happy coding! 🚀
