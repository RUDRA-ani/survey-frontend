# Survey Platform — Frontend

A web-based survey management platform built with React and TypeScript. It provides an admin interface for creating, managing, publishing, and analyzing surveys, along with a public interface for respondents.

## Live Demo

- **Frontend:** https://survey-frontend-ashen-three.vercel.app
- **Backend API:** https://survey-backend-d8mr.onrender.com

## Features

- Admin login and protected dashboard
- Create, edit, delete, and publish surveys
- Multiple question types
- Required questions and conditional question visibility
- Public survey response submission
- Survey response analytics
- Search and pagination for surveys
- Responsive user interface

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Axios
- React Hook Form
- Zod
- Recharts
- Lucide React
- Sonner

## Getting Started

### Prerequisites

- Node.js
- npm
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/RUDRA-ani/survey-frontend.git
cd survey-frontend
```

Install dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:5000/api
```

For production, the deployed frontend uses the Render backend API:

```env
VITE_API_URL=https://survey-backend-d8mr.onrender.com/api
```

### Run Development Server

```bash
npm run dev
```

The frontend will usually be available at:

```text
http://localhost:5173
```

### Build for Production

```bash
npm run build
```

## Deployment

The frontend is deployed using **Vercel**.

The production environment variable `VITE_API_URL` must point to the deployed backend API.

## Backend Repository

[Survey Platform Backend](https://github.com/RUDRA-ani/survey-backend)

## Author

**Anirudra Dahal**

- GitHub: [RUDRA-ani](https://github.com/RUDRA-ani)