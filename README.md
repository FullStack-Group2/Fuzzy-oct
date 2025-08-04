# Fuzzy-oct E-Commerce Platform

This is a full-stack e-commerce application built with a modern technology stack, structured as a monorepo with separate client and server workspaces managed by pnpm.

The frontend is a dynamic and responsive React application powered by Vite, with state management handled by Redux Toolkit. The backend is a robust Node.js and Express API with TypeScript, connected to a MongoDB database.

## Features

- User authentication and authorization
- Product catalog with search and filtering
- Shopping cart functionality
- Order management system
- Admin dashboard for product and order management
- Responsive design for mobile and desktop
- Real-time updates
- Secure payment processing

## Tech Stack

| Area | Technology |
|------|------------|
| **Client (FE)** | React, Vite, TypeScript, Redux Toolkit, React Router, Tailwind CSS |
| **Server (BE)** | Node.js, Express, TypeScript, MongoDB, Mongoose, JWT for authentication |
| **Dev Tools** | PNPM, ESLint, Prettier, Vercel, GitHub Actions |

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js (v18.x or later recommended)
- pnpm

### Installation

1. Clone the repository:

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

2. Install dependencies for all workspaces:

```bash
pnpm install
```

3. Setup Environment Variables:
   The server requires a `.env` file for configuration. Create a file named `.env` inside the `/server` directory and add the necessary variables.

```bash
# server/.env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

## Development

To start the development servers for both the client and the server simultaneously, run the following command from the root directory:

```bash
pnpm dev
```

This will concurrently:
- Start the Vite development server for the React client (usually on http://localhost:3000).
- Start the Nodemon development server for the Express backend (usually on http://localhost:5000).

## Available Scripts

Here is a list of the most important scripts available in the project.

### Root
- `pnpm dev`: Starts both client and server in parallel.

### Client (/client)
- `pnpm dev`: Starts the Vite development server.

### Server (/server)
- `pnpm dev`: Starts the Express server with Nodemon for auto-reloading.

### Linting & Formatting
- `pnpm lint`: Lints all files in the project.
- `pnpm format`: Formats all files in the project with Prettier.
- `pnpm format:check`: Checks for formatting issues without modifying files.# Fuzzy-Dop

