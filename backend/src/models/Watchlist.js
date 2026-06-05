import mongoose from 'mongoose';

const watchlistSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        dramaId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Content',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

watchlistSchema.index({ userId: 1, dramaId: 1 }, { unique: true });

watchlistSchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = String(obj._id);
    if (obj.userId) obj.userId = String(obj.userId);
    if (obj.dramaId && typeof obj.dramaId === 'object' && obj.dramaId._id) {
        obj.dramaId = { ...obj.dramaId, id: String(obj.dramaId._id) };
    } else if (obj.dramaId) {
        obj.dramaId = String(obj.dramaId);
    }
    return obj;
};

export default mongoose.model('Watchlist', watchlistSchema);