# ReConnect & Rise

**Empowering Communities** - A unified platform for community growth, secure financial empowerment, and professional networking.

## 🌟 Overview

ReConnect & Rise is a comprehensive web application designed to bridge the gap between community engagement, financial security, and professional development. Our platform enables users to:

- **Connect & Collaborate** - Build meaningful relationships within communities
- **Financial Empowerment** - Access secure financial tools and resources
- **Professional Growth** - Expand your network and unlock career opportunities

## ✨ Features

- 🤝 Community networking and engagement
- 💰 Secure financial management tools
- 👔 Professional networking capabilities
- 🔐 User authentication and data security
- 📱 Responsive and user-friendly interface
- ⚡ Fast and modern web technology stack

## 🛠️ Tech Stack

- **Frontend**: React + Vite
- **Language**: JavaScript
- **Build Tool**: Vite (Next Generation Frontend Tooling)
- **Deployment**: Vercel
- **API**: Node.js/Express backend (API on `/api` routes)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- npm or yarn package manager

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/assalafygrk/ReConnect-Rise.git
cd ReConnect-Rise
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the `.env.example` file to `.env.local` and update with your configuration:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your API endpoint:

```
VITE_API_URL=http://localhost:5000/api
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### 5. Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist` folder.

### 6. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
ReConnect-Rise/
├── src/
│   ├── main.jsx           # React entry point
│   ├── App.jsx            # Root component
│   └── components/        # React components
├── public/                # Static assets
├── dist/                  # Production build output
├── index.html             # HTML entry point
├── vite.config.js         # Vite configuration
├── vercel.json            # Vercel deployment config
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🌐 API Integration

The frontend communicates with the backend API using the URL specified in your `.env` file:

```
VITE_API_URL=http://localhost:5000/api
```

All API requests should be made relative to this base URL. For example:
- `GET /api/users` → `http://localhost:5000/api/users`
- `POST /api/community/join` → `http://localhost:5000/api/community/join`

## 📦 Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint (if configured)

## 🔧 Configuration

### Vite Configuration
See `vite.config.js` for Vite-specific settings.

### Vercel Deployment
The project uses `vercel.json` for Vercel-specific configuration:
- Build command: `npm run build`
- Output directory: `dist`
- API rewrites configured for `/api` routes

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Vercel will automatically detect the configuration in `vercel.json`
4. Your application will be deployed automatically on every push to the main branch

### Environment Variables on Vercel
Set the following in your Vercel project settings:
- `VITE_API_URL` - Your production API endpoint

## 🔒 Security

- Sensitive data (API keys, secrets) should never be committed to the repository
- Always use `.env.local` for local development
- The `.gitignore` file ensures `.env` files are not tracked
- Implement proper authentication and authorization checks

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💬 Support

For support, please open an issue on the GitHub repository or contact the development team.

## 🙌 Acknowledgments

- Built with [React](https://react.dev/)
- Powered by [Vite](https://vitejs.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

**ReConnect & Rise** - Building stronger communities, one connection at a time.
