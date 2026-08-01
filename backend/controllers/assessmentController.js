import asyncHandler from 'express-async-handler';
import Assessment from '../models/Assessment.js';
import Response from '../models/Response.js';
import ActivityLog from '../models/ActivityLog.js';
import { getDefaultProject } from './projectController.js';

export const createAssessment = asyncHandler(async (req, res) => {
  const { title, description, categories, status, passingThreshold } = req.body;

  const existing = await Assessment.findOne({ title: String(title), createdBy: req.user._id });
  if (existing) { res.status(400); throw new Error('Assessment name exists'); }

  const assessment = await Assessment.create({
    title, description, categories, createdBy: req.user._id, status: status || 'published', passingThreshold: passingThreshold || 50
  });

  const project = await getDefaultProject(req.user._id, req.user.name);
  await ActivityLog.create({
    projectId: project._id,
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'created',
    targetType: 'assessment',
    targetLabel: title
  });

  res.status(201).json(assessment);
});

export const getAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ createdBy: req.user._id }).sort('-createdAt');
  res.json(assessments);
});

export const getLaunchPadAssessments = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({
    status: 'published'
  }).lean();

  const submissions = await Response.find({ userId: req.user._id }).select('assessmentId');
  const submittedIds = new Set(submissions.map(s => s.assessmentId.toString()));

  const result = assessments.map(a => ({
    ...a,
    hasSubmitted: submittedIds.has(a._id.toString()),
  }));

  res.json(result);
});

export const getAssessmentById = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }
  res.json(assessment);
});

export const deleteAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }
  if (assessment.createdBy.toString() !== req.user._id.toString()) {
    res.status(403); throw new Error('Not authorized to delete this assessment');
  }

  // Cascade delete responses
  await Response.deleteMany({ assessmentId: assessment._id });

  const project = await getDefaultProject(req.user._id, req.user.name);
  await ActivityLog.create({
    projectId: project._id,
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'deleted',
    targetType: 'assessment',
    targetLabel: assessment.title
  });

  await assessment.deleteOne();
  res.json({ message: 'Assessment removed' });
});

export const updateAssessment = asyncHandler(async (req, res) => {
  const { title, description, categories, status, passingThreshold } = req.body;
  const assessment = await Assessment.findById(req.params.id);
  
  if (!assessment) {
    res.status(404);
    throw new Error('This assessment no longer exists');
  }
  
  if (assessment.createdBy.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this assessment');
  }
  
  if (title !== assessment.title) {
    const existing = await Assessment.findOne({ title: String(title), createdBy: req.user._id });
    if (existing) { res.status(400); throw new Error('Assessment name exists'); }
  }

  assessment.title = title;
  assessment.description = description;
  assessment.categories = categories;
  assessment.status = status;
  if (passingThreshold !== undefined) {
    assessment.passingThreshold = passingThreshold;
  }
  
  const updated = await assessment.save();

  const project = await getDefaultProject(req.user._id, req.user.name);
  await ActivityLog.create({
    projectId: project._id,
    actorId: req.user._id,
    actorName: req.user.name,
    action: 'updated',
    targetType: 'assessment',
    targetLabel: title
  });

  res.json(updated);
});

export const getUserCategories = asyncHandler(async (req, res) => {
  const assessments = await Assessment.find({ createdBy: req.user._id }).select('categories');
  const uniqueCategoriesMap = new Map();
  
  assessments.forEach(ass => {
    ass.categories.forEach(cat => {
      if (!uniqueCategoriesMap.has(cat.name)) {
        uniqueCategoriesMap.set(cat.name, cat);
      }
    });
  });

  res.json(Array.from(uniqueCategoriesMap.values()));
});

export const getTakeAssessment = asyncHandler(async (req, res) => {
  const assessment = await Assessment.findById(req.params.id);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }
  
  let existingResponse = null;
  if (req.user) {
    existingResponse = await Response.findOne({ assessmentId: assessment._id, userId: req.user._id });
  }
  
  res.json({
    assessment,
    response: existingResponse
  });
});

export const autoSaveAnswer = asyncHandler(async (req, res) => {
  const { questionId, value } = req.body;
  const assessmentId = req.params.id;
  
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }

  let response = await Response.findOne({ assessmentId, userId: req.user._id });
  
  if (response && response.status === 'submitted') {
    res.status(409);
    throw new Error('You have already submitted this assessment.');
  }

  if (!response) {
    response = new Response({
      assessmentId,
      ownerId: assessment.createdBy,
      userId: req.user._id,
      respondentName: req.user.name,
      answers: [{ questionId, value }],
      status: 'draft'
    });
  } else {
    const existingAnswer = response.answers.find(a => a.questionId.toString() === questionId);
    if (existingAnswer) {
      existingAnswer.value = value;
    } else {
      response.answers.push({ questionId, value });
    }
  }

  await response.save();
  res.status(200).json(response);
});

function scoreToStars(scorePercent) {
  if (scorePercent >= 90) return 5;
  if (scorePercent >= 75) return 4;
  if (scorePercent >= 60) return 3;
  if (scorePercent >= 40) return 2;
  if (scorePercent > 0)   return 1;
  return 0;
}

export const submitAssessment = asyncHandler(async (req, res) => {
  const assessmentId = req.params.id;
  
  let response = await Response.findOne({ assessmentId, userId: req.user._id });
  
  if (response && response.status === 'submitted') {
    res.status(409);
    throw new Error('You have already submitted this assessment.');
  }
  
  const assessment = await Assessment.findById(assessmentId);
  if (!assessment) { res.status(404); throw new Error('Assessment not found'); }
  
  if (!response) {
    response = new Response({
      assessmentId,
      ownerId: assessment.createdBy,
      userId: req.user._id,
      respondentName: req.user.name,
      answers: req.body.answers || [],
    });
  } else if (req.body.answers) {
    const finalAnswers = req.body.answers;
    finalAnswers.forEach(ans => {
      const existingAnswer = response.answers.find(a => a.questionId.toString() === ans.questionId);
      if (existingAnswer) {
        existingAnswer.value = ans.value;
      } else {
        response.answers.push(ans);
      }
    });
  }
  
  // Calculate score
  let earnedPoints = 0;
  let totalPoints = 0;
  
  const allQuestions = assessment.categories.flatMap(c => c.factors.flatMap(f => f.questions));
  
  response.answers.forEach(ans => {
    const question = allQuestions.find(q => q._id.toString() === ans.questionId.toString());
    if (question) {
      totalPoints += (question.points || 1); // fallback to 1 if not set
      
      const isCorrect = question.correctAnswer !== undefined 
        && JSON.stringify(ans.value) === JSON.stringify(question.correctAnswer);
        
      ans.isCorrect = isCorrect;
      ans.pointsAwarded = isCorrect ? (question.points || 1) : 0;
      
      if (isCorrect) {
        earnedPoints += (question.points || 1);
      }
    }
  });

  const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
  const starRating = scoreToStars(scorePercent);

  response.earnedPoints = earnedPoints;
  response.totalPoints = totalPoints;
  response.scorePercent = scorePercent;
  response.starRating = starRating;
  response.status = 'submitted';
  response.submittedAt = Date.now();
  await response.save();
  
  res.status(200).json(response);
});
