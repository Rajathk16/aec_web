const express=require('express');
const cors=require('cors');
const morgan=require('morgan');
const dotenv=require('dotenv');
const colors=require('colors');
const connectDb=require('./config/connectDb');
//config dot env file
dotenv.config();
//connect to database
connectDb();
//rest object
const app=express()
//middleware
app.use(cors())
app.use(morgan('dev'))
app.use (express.json())
//routes
app.get('/', (req, res) => {
    res.send("<h1>hello from server</h1>");
})

// Expense routes
const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api/expenses', expenseRoutes);

// Budget routes
const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budgets', budgetRoutes);

// port
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`server is running on port ${PORT}`);
});
