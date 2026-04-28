# Expense Tracker

A full-stack MERN (MongoDB, Express.js, React, Node.js) expense tracking application built with Next.js. Track your daily expenses, categorize spending, and monitor your financial health with an intuitive dashboard.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Expense Management**: Add, view, and categorize expenses
- **Dashboard**: Visual overview of income, expenses, and balance
- **Category Filtering**: Filter expenses by categories (Food, Transportation, etc.)
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Real-time Updates**: Instant UI updates with React state management
- **Data Visualization**: Financial overview with charts and summaries

## 🛠 Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS** - Utility-first CSS framework
- **Next.js API Routes** - Backend API endpoints

### Backend
- **Node.js** - JavaScript runtime
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Nodemon** - Development server auto-restart

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** - [Download here](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd et
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   # MongoDB connection string
   MONGO_URL=mongodb://127.0.0.1:27017/et

   # JWT secret for authentication
   JWT_SECRET=your-super-secret-jwt-key

   # Port for Express server (optional)
   PORT=8080
   ```

## 🗄️ Database Setup

### Local MongoDB
1. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

2. The app will automatically create the database and collections.

### MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Update `MONGO_URL` in `.env`:
   ```env
   MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/et?retryWrites=true&w=majority
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
- Frontend: http://localhost:3000
- API routes are automatically available at `/api/*`

### Production Build
```bash
npm run build
npm start
```

### Alternative: Express Server
```bash
npm run server
```
- Express server: http://localhost:8080
- Frontend: http://localhost:3000 (separate terminal)

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### User Profile
- `GET /api/user/profile` - Get user profile (authenticated)
- `PUT /api/user/profile` - Update user profile (authenticated)

### Expenses
- `POST /api/expenses/add` - Add new expense (authenticated)
- `GET /api/expenses/all` - Get all user expenses (authenticated)
- `GET /api/expenses/category/[category]` - Get expenses by category (authenticated)

## 🎯 Usage

1. **Sign Up**: Create a new account with your details
2. **Set Monthly Income**: Update your profile with monthly income
3. **Add Expenses**: Track your spending with categories and descriptions
4. **View Dashboard**: Monitor your financial overview
5. **Filter Expenses**: View expenses by category or date

### Sample API Usage

```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Add expense
const expenseResponse = await fetch('/api/expenses/add', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    amount: 50,
    category: 'Food & Dining',
    description: 'Lunch at restaurant',
    date: '2024-01-15'
  })
});
```

## 📁 Project Structure

```
et/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── expenses/     # Expense management
│   │   └── user/         # User profile
│   ├── components/       # React components
│   ├── config/           # Database configuration
│   ├── lib/              # Utility libraries
│   ├── middlewares/      # Express middlewares
│   ├── models/           # MongoDB models
│   ├── routes/           # Express routes
│   ├── utils/            # Helper functions
│   ├── globals.css       # Global styles
│   ├── layout.js         # Root layout
│   ├── page.js           # Home page
│   └── server.js         # Express server
├── components/           # Shared components
├── public/               # Static assets
├── .env.example          # Environment template
├── package.json          # Dependencies
├── next.config.mjs       # Next.js configuration
├── tailwind.config.js    # Tailwind CSS config
└── README.md            # This file
```

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run server      # Start Express server
npm run backend     # Alias for server
npm run lint        # Run ESLint
```

## 🧪 Testing

### Manual Testing
1. Start the development server: `npm run dev`
2. Open http://localhost:3000
3. Test user registration and login
4. Add expenses and verify dashboard updates
5. Test category filtering

### API Testing
Use tools like Postman or curl to test API endpoints:

```bash
# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","monthlyIncome":50000}'
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repo to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
- **Railway**: Connect GitHub repo, auto-deploys
- **Render**: Manual deployment with build commands
- **Heroku**: Traditional deployment platform

### Environment Variables for Production
```env
MONGO_URL=your-production-mongodb-url
JWT_SECRET=your-production-jwt-secret
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

### Development Guidelines
- Follow ESLint rules
- Use meaningful commit messages
- Test API endpoints thoroughly
- Update README for new features

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running locally or Atlas IP is whitelisted
- Check `MONGO_URL` in `.env` file

**Port Already in Use**
- Kill existing processes: `npx kill-port 3000`
- Or use different port: `npm run dev -- -p 3001`

**Build Errors**
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

**Authentication Issues**
- Check `JWT_SECRET` is set in `.env`
- Verify token format in API requests

## 📞 Support

For questions or issues:
- Create an issue on GitHub
- Check existing issues for similar problems
- Review the troubleshooting section above

---

Built with ❤️ using Next.js and MongoDB
