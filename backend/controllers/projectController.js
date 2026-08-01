import Project from '../models/Project.js';
import ActivityLog from '../models/ActivityLog.js';

// Helper to ensure a project exists for the user (since we are faking a 1-to-1 project structure)
export const getDefaultProject = async (userId, userName) => {
  let project = await Project.findOne({ owner: userId });
  if (!project) {
    project = await Project.create({
      name: 'My Workspace',
      description: 'Default project workspace',
      owner: userId
    });
    // Log creation
    await ActivityLog.create({
      projectId: project._id,
      actorId: userId,
      actorName: userName || 'System',
      action: 'created',
      targetType: 'setting',
      targetLabel: 'Workspace'
    });
  }
  return project;
};

// @desc    Get project settings
// @route   GET /api/projects/current/settings
// @access  Private
export const getSettings = async (req, res) => {
  try {
    const project = await getDefaultProject(req.user.id, req.user.name);
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
};

// @desc    Update project settings
// @route   PUT /api/projects/current/settings
// @access  Private
export const updateSettings = async (req, res) => {
  try {
    const project = await getDefaultProject(req.user.id, req.user.name);
    
    project.name = req.body.name || project.name;
    project.description = req.body.description !== undefined ? req.body.description : project.description;
    project.timezone = req.body.timezone || project.timezone;
    
    await project.save();

    await ActivityLog.create({
      projectId: project._id,
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'updated',
      targetType: 'setting',
      targetLabel: 'Project Settings'
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

// @desc    Archive project
// @route   POST /api/projects/current/archive
// @access  Private
export const archiveProject = async (req, res) => {
  try {
    const project = await getDefaultProject(req.user.id, req.user.name);
    project.status = 'archived';
    await project.save();

    await ActivityLog.create({
      projectId: project._id,
      actorId: req.user.id,
      actorName: req.user.name,
      action: 'updated',
      targetType: 'setting',
      targetLabel: 'Archived Project'
    });

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Failed to archive project' });
  }
};

// @desc    Delete project (just archives/marks for this mockup, since true delete breaks everything)
// @route   DELETE /api/projects/current
// @access  Private
export const deleteProject = async (req, res) => {
  try {
    const { confirmName } = req.body;
    const project = await getDefaultProject(req.user.id, req.user.name);

    if (confirmName !== project.name) {
      return res.status(400).json({ message: 'Project name does not match.' });
    }

    // In a real app we'd delete the project and all cascaded data.
    // For safety, let's just delete the project record (which will recreate a new empty one next time)
    await Project.deleteOne({ _id: project._id });
    
    // Clear history? Not necessary, they are orphaned or we can delete them.
    await ActivityLog.deleteMany({ projectId: project._id });

    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
};

// @desc    Get project history
// @route   GET /api/projects/current/history
// @access  Private
export const getHistory = async (req, res) => {
  try {
    const project = await getDefaultProject(req.user.id, req.user.name);
    
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;
    
    // Optional filters
    const query = { projectId: project._id };
    if (req.query.type) {
      query.targetType = req.query.type;
    }
    // Note: could add date range filtering here too if 'from' and 'to' are passed

    const total = await ActivityLog.countDocuments(query);
    const logs = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      logs,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};
