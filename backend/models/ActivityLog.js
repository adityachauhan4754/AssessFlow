import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actorName: { type: String, required: true },
  action: { type: String, enum: ['created', 'updated', 'deleted', 'published', 'invited'], required: true },
  targetType: { type: String, enum: ['assessment', 'category', 'factor', 'question', 'collaborator', 'setting'], required: true },
  targetLabel: { type: String, required: true },
}, { timestamps: true });

// Index for efficient querying by project
activityLogSchema.index({ projectId: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
