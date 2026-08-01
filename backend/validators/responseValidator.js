import { z } from 'zod';

export const responseSchema = z.object({
  assessmentId: z.string().min(1, 'Assessment ID is required'),
  respondentName: z.string().optional(),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.any()
  })).min(1, 'At least one answer is required')
});
