import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    monthlyLimit: {
        type: Number,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
    },
}, {
    timestamps: true,
});

const budgetModel = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);
export default budgetModel;