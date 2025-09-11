// server/models/scheduledSession.model.js
import mongoose from "mongoose";

const scheduledSessionSchema = new mongoose.Schema({
    topic: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 500 },
    scheduledTime: { type: Date, required: true, index: true },
    durationMinutes: { type: Number, default: 60, min: 15, max: 120 },
    volunteerModerator: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Volunteer',
        required: true
    },
    attendees: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student' 
    }],
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    sessionTranscript: { type: String } // For later analysis
}, { timestamps: true });

export default mongoose.model("ScheduledSession", scheduledSessionSchema);