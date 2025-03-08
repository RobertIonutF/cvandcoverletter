import { z } from 'zod'

// User Details Schema
export const userDetailsSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  jobTitle: z.string().min(2, { message: 'Job title is required' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(5, { message: 'Phone number is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  website: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal('')),
  linkedin: z.string().url({ message: 'Please enter a valid LinkedIn URL' }).optional().or(z.literal('')),
  github: z.string().url({ message: 'Please enter a valid GitHub URL' }).optional().or(z.literal('')),
  summary: z.string().min(50, { message: 'Summary should be at least 50 characters' })
})

export type UserDetails = z.infer<typeof userDetailsSchema>

// Experience Schema
export const experienceSchema = z.object({
  id: z.string().optional(),
  jobTitle: z.string().min(2, { message: 'Job title is required' }),
  company: z.string().min(2, { message: 'Company name is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }).optional(),
  current: z.boolean().default(false),
  description: z.string().min(20, { message: 'Description should be at least 20 characters' })
})

export type Experience = z.infer<typeof experienceSchema>

// Education Schema
export const educationSchema = z.object({
  id: z.string().optional(),
  degree: z.string().min(2, { message: 'Degree is required' }),
  institution: z.string().min(2, { message: 'Institution name is required' }),
  location: z.string().min(2, { message: 'Location is required' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }).optional(),
  current: z.boolean().default(false),
  description: z.string().optional()
})

export type Education = z.infer<typeof educationSchema>

// Skill Category Schema
export const skillCategorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Category name is required' }),
  skills: z.array(z.string())
})

export type SkillCategory = z.infer<typeof skillCategorySchema>

// Job Description Schema
export const jobDescriptionSchema = z.object({
  content: z.string().min(100, { message: 'Job description should be at least 100 characters' })
})

export type JobDescription = z.infer<typeof jobDescriptionSchema>

// Generated CV Schema
export const generatedCVSchema = z.object({
  content: z.string().optional(),
  sections: z.object({
    summary: z.string().optional(),
    experience: z.array(
      z.object({
        title: z.string(),
        company: z.string(),
        period: z.string(),
        description: z.string()
      })
    ).optional(),
    education: z.array(
      z.object({
        degree: z.string(),
        institution: z.string(),
        period: z.string()
      })
    ).optional(),
    projects: z.array(
      z.object({
        name: z.string(),
        description: z.string(),
        technologies: z.array(z.string()).optional()
      })
    ).optional(),
    skills: z.array(z.string()).optional()
  }).optional()
})

export type GeneratedCV = z.infer<typeof generatedCVSchema>

// Generated Cover Letter Schema
export const generatedCoverLetterSchema = z.object({
  content: z.string().optional(),
  sections: z.object({
    introduction: z.string().optional(),
    body: z.array(z.string()).optional(),
    conclusion: z.string().optional()
  }).optional()
})

export type GeneratedCoverLetter = z.infer<typeof generatedCoverLetterSchema>

// Form Schemas
export const experienceFormSchema = z.object({
  experiences: z.array(experienceSchema)
})

export const educationFormSchema = z.object({
  educations: z.array(educationSchema)
})

export const skillsFormSchema = z.object({
  categories: z.array(skillCategorySchema)
})

export type ExperienceFormValues = z.infer<typeof experienceFormSchema>
export type EducationFormValues = z.infer<typeof educationFormSchema>
export type SkillsFormValues = z.infer<typeof skillsFormSchema>

// Project Schema
export const projectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: 'Project name is required' }),
  description: z.string().min(10, { message: 'Description should be at least 10 characters' }),
  technologies: z.array(z.string()).optional(),
  url: z.string().url().optional(),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  endDate: z.string().min(1, { message: 'End date is required' }).optional()
})

export type Project = z.infer<typeof projectSchema> 