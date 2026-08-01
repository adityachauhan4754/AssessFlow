import { z } from 'zod';

const questionSchema = z.object({
  text: z.string().min(1, 'Question text is required'),
  type: z.enum(['MCQ', 'Rating', 'Text', 'Number']),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().default(false),
  order: z.number().optional()
}).superRefine((data, ctx) => {
  if (data.type === 'MCQ' && (!data.options || data.options.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'MCQ questions require at least one option'
    });
  }
});

const factorSchema = z.object({
  name: z.string().min(1, 'Factor name is required'),
  questions: z.array(questionSchema).min(1, 'Each factor must have at least one question'),
  order: z.number().optional()
});

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  factors: z.array(factorSchema).min(1, 'Each category must have at least one factor'),
  order: z.number().optional()
});

export const assessmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  categories: z.array(categorySchema).min(1, 'At least one category is required')
});
