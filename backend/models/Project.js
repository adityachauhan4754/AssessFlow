import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, default: 'My Workspace' },
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  timezone: { type: String, default: 'UTC' }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
export default Project;
