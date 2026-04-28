const mongoose = require('mongoose');
const colors = require('colors');

const connectDb = async () => {
    try {
        const url = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/et';
        await mongoose.connect(url, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to MongoDB on ${mongoose.connection.host}`.bgGreen.white);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }
};

module.exports = connectDb;