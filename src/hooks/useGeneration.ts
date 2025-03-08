'use client'

import { 
  UserDetails, 
  Experience, 
  Education, 
  SkillCategory, 
  Project,
  GeneratedCV,
  GeneratedCoverLetter
} from '@/types'
import { useMutation } from '@tanstack/react-query'
import { generateCV, generateCoverLetter, analyzeJobDescription } from '@/actions'
import { useCVStore } from '@/store'
import { toast } from 'sonner'

/**
 * Custom hook for CV generation
 */
export function useGenerateCV() {
  const { setGeneratedCV } = useCVStore()
  
  return useMutation({
    mutationFn: async ({
      jobDescription,
      userDetails,
      experiences,
      educations,
      skillCategories,
      projects
    }: {
      jobDescription: string;
      userDetails: UserDetails;
      experiences: Experience[];
      educations: Education[];
      skillCategories: SkillCategory[];
      projects: Project[];
    }): Promise<GeneratedCV> => {
      return await generateCV(
        jobDescription,
        userDetails,
        experiences,
        educations,
        skillCategories,
        projects
      )
    },
    onSuccess: (data) => {
      setGeneratedCV(data)
      toast.success('CV generated successfully!')
    },
    onError: (error: Error) => {
      console.error('Error generating CV:', error)
      toast.error(`Failed to generate CV: ${error.message}`)
    }
  })
}

/**
 * Custom hook for cover letter generation
 */
export function useGenerateCoverLetter() {
  const { setGeneratedCoverLetter } = useCVStore()
  
  return useMutation({
    mutationFn: async ({
      jobDescription,
      userDetails,
      experiences,
    }: {
      jobDescription: string;
      userDetails: UserDetails;
      experiences: Experience[];
    }): Promise<GeneratedCoverLetter> => {
      return await generateCoverLetter(
        jobDescription,
        userDetails,
        experiences
      )
    },
    onSuccess: (data) => {
      setGeneratedCoverLetter(data)
      toast.success('Cover letter generated successfully!')
    },
    onError: (error: Error) => {
      console.error('Error generating cover letter:', error)
      toast.error(`Failed to generate cover letter: ${error.message}`)
    }
  })
}

/**
 * Custom hook for job description analysis
 */
export function useAnalyzeJobDescription() {
  const { setKeywordsMatched, setAnalysisComplete } = useCVStore()
  
  return useMutation({
    mutationFn: async (jobDescription: string): Promise<string[]> => {
      return await analyzeJobDescription(jobDescription)
    },
    onSuccess: (data) => {
      setKeywordsMatched(data)
      setAnalysisComplete(true)
    },
    onError: (error: Error) => {
      console.error('Error analyzing job description:', error)
      toast.error(`Failed to analyze job description: ${error.message}`)
    }
  })
} 