import { useState, useMemo } from 'react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { 
  generateCV, 
  generateCoverLetter, 
  analyzeJobDescription 
} from '@/actions'

export function useDocumentGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingCoverLetter, setIsGeneratingCoverLetter] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // Combined loading state - true when any generation is happening
  const isLoading = useMemo(() => {
    return isGenerating || isGeneratingCoverLetter || isAnalyzing
  }, [isGenerating, isGeneratingCoverLetter, isAnalyzing])
  
  const {
    jobDescription,
    userDetails,
    experiences,
    educations,
    skillCategories,
    projects,
    language,
    setGeneratedCV,
    setGeneratedCoverLetter,
  } = useCVStore()

  // Get language display name for notifications
  const getLanguageDisplayName = (lang: string) => {
    const languageMap: Record<string, string> = {
      english: 'English',
      french: 'French',
      spanish: 'Spanish',
      german: 'German',
      romanian: 'Romanian',
      russian: 'Russian',
      chinese: 'Chinese',
      japanese: 'Japanese'
    }
    return languageMap[lang] || lang
  }

  const handleGenerateCV = async () => {
    if (!jobDescription || !userDetails) {
      toast.error('Please fill in your details and provide a job description')
      return
    }

    setIsGenerating(true)
    
    try {
      toast.info(`Generating resume in ${getLanguageDisplayName(language)}...`)
      
      const cv = await generateCV(
        jobDescription,
        userDetails,
        experiences,
        educations,
        skillCategories,
        projects,
        language
      )
      
      setGeneratedCV(cv)
      toast.success(`Resume generated successfully in ${getLanguageDisplayName(language)}`)
      return cv
    } catch (error) {
      console.error('Error generating CV:', error)
      toast.error('Failed to generate resume. Please try again.')
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateCoverLetter = async () => {
    if (!jobDescription || !userDetails) {
      toast.error('Please fill in your details and provide a job description')
      return
    }

    setIsGeneratingCoverLetter(true)
    
    try {
      toast.info(`Generating cover letter in ${getLanguageDisplayName(language)}...`)
      
      const coverLetter = await generateCoverLetter(
        jobDescription,
        userDetails,
        experiences,
        educations,
        skillCategories,
        projects,
        language
      )
      
      setGeneratedCoverLetter(coverLetter)
      toast.success(`Cover letter generated successfully in ${getLanguageDisplayName(language)}`)
      return coverLetter
    } catch (error) {
      console.error('Error generating cover letter:', error)
      toast.error('Failed to generate cover letter. Please try again.')
      throw error
    } finally {
      setIsGeneratingCoverLetter(false)
    }
  }

  const handleAnalyzeJobDescription = async () => {
    if (!jobDescription || jobDescription.length < 100) {
      toast.error('Please provide a detailed job description (at least 100 characters)')
      return
    }

    setIsAnalyzing(true)
    
    try {
      await analyzeJobDescription(jobDescription)
      toast.success('Job description analyzed')
    } catch (error) {
      console.error('Error analyzing job description:', error)
      toast.error('Failed to analyze job description')
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSubmitJobDescription = async (data: { jobDescription: string }) => {
    try {
      // Save job description to store
      useCVStore.setState({ jobDescription: data.jobDescription })
      toast.success('Job description saved')
      
      // Always generate both CV and cover letter
      try {
        // First generate resume
        await handleGenerateCV()
        
        // Then generate cover letter
        await handleGenerateCoverLetter()
        
        toast.success(`Documents generated successfully in ${getLanguageDisplayName(language)}`)
      } catch (error) {
        console.error('Error during document generation:', error)
      }
    } catch (error) {
      console.error('Error in job description submission:', error)
      toast.error('Something went wrong. Please try again.')
      throw error
    }
  }

  return {
    isGenerating,
    isGeneratingCoverLetter,
    isAnalyzing,
    isLoading,
    handleGenerateCV,
    handleGenerateCoverLetter,
    handleAnalyzeJobDescription,
    handleSubmitJobDescription
  }
} 