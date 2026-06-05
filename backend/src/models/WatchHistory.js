import mongoose from 'mongoose';

const watchHistorySchema = new mongoose.Schema(
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
        episodeId: {
            type: String,
            required: true,
            index: true,
        },
        episodeNumber: {
            type: Number,
            required: true,
        },
        episodeTitle: {
            type: String,
            default: '',
        },
        lastWatchedTimestamp: {
            type: Number,
            default: () => Math.floor(Date.now() / 1000),
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

watchHistorySchema.index({ userId: 1, episodeId: 1 }, { unique: true });

watchHistorySchema.methods.toJSON = function () {
    const obj = this.toObject();
    obj.id = String(obj._id);
    if (obj.userId) obj.userId = String(obj.userId);
    if (obj.dramaId) obj.dramaId = String(obj.dramaId);
    return obj;
};

export default mongoose.model('WatchHistory', watchHistorySchema);