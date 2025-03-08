import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { 
  UserDetails, 
  Experience, 
  Education, 
  SkillCategory,
  Project,
  GeneratedCV,
  GeneratedCoverLetter
} from '@/types'

// Supported languages
export type Language = 'english' | 'french' | 'spanish' | 'german' | 'romanian' | 'russian' | 'chinese' | 'japanese'

interface CVStoreState {
  // User data
  userDetails: UserDetails | null
  experiences: Experience[]
  educations: Education[]
  skillCategories: SkillCategory[]
  projects: Project[]
  
  // Job details
  jobDescription: string
  
  // Generated content
  generatedCV: GeneratedCV | null
  generatedCoverLetter: GeneratedCoverLetter | null
  
  // Analysis data
  keywordsMatched: string[]
  matchScore: number
  analysisComplete: boolean
  
  // Language preference
  language: Language
  
  // Actions
  setUserDetails: (details: UserDetails) => void
  addExperience: (experience: Experience) => void
  updateExperience: (id: string, experience: Experience) => void
  removeExperience: (id: string) => void
  addEducation: (education: Education) => void
  updateEducation: (id: string, education: Education) => void
  removeEducation: (id: string) => void
  addSkillCategory: (category: SkillCategory) => void
  updateSkillCategory: (id: string, category: SkillCategory) => void
  removeSkillCategory: (id: string) => void
  addSkillToCategory: (categoryId: string, skill: string) => void
  removeSkillFromCategory: (categoryId: string, skill: string) => void
  addProject: (project: Project) => void
  updateProject: (id: string, project: Project) => void
  removeProject: (id: string) => void
  setGeneratedCV: (cv: GeneratedCV | null) => void
  setGeneratedCoverLetter: (letter: GeneratedCoverLetter | null) => void
  setKeywordsMatched: (keywords: string[]) => void
  setMatchScore: (score: number) => void
  setAnalysisComplete: (complete: boolean) => void
  setLanguage: (language: Language) => void
  resetGeneratedContent: () => void
}

export const useCVStore = create<CVStoreState>()(
  persist(
    (set) => ({
      // Initial state
      userDetails: null,
      experiences: [],
      educations: [],
      skillCategories: [],
      projects: [],
      jobDescription: '',
      generatedCV: null,
      generatedCoverLetter: null,
      keywordsMatched: [],
      matchScore: 0,
      analysisComplete: false,
      language: 'english',
      
      // Actions
      setUserDetails: (details) => set({ userDetails: details }),
      
      addExperience: (experience) => set((state) => ({ 
        experiences: [...state.experiences, experience] 
      })),
      
      updateExperience: (id, experience) => set((state) => ({
        experiences: state.experiences.map((exp) => 
          exp.id === id ? experience : exp
        )
      })),
      
      removeExperience: (id) => set((state) => ({
        experiences: state.experiences.filter((exp) => exp.id !== id)
      })),
      
      addEducation: (education) => set((state) => ({ 
        educations: [...state.educations, education] 
      })),
      
      updateEducation: (id, education) => set((state) => ({
        educations: state.educations.map((edu) => 
          edu.id === id ? education : edu
        )
      })),
      
      removeEducation: (id) => set((state) => ({
        educations: state.educations.filter((edu) => edu.id !== id)
      })),
      
      addSkillCategory: (category) => set((state) => ({ 
        skillCategories: [...state.skillCategories, category] 
      })),
      
      updateSkillCategory: (id, category) => set((state) => ({
        skillCategories: state.skillCategories.map((cat) => 
          cat.id === id ? category : cat
        )
      })),
      
      removeSkillCategory: (id) => set((state) => ({
        skillCategories: state.skillCategories.filter((cat) => cat.id !== id)
      })),
      
      addSkillToCategory: (categoryId, skill) => set((state) => ({
        skillCategories: state.skillCategories.map((cat) => 
          cat.id === categoryId 
            ? { ...cat, skills: [...cat.skills, skill] } 
            : cat
        )
      })),
      
      removeSkillFromCategory: (categoryId, skill) => set((state) => ({
        skillCategories: state.skillCategories.map((cat) => 
          cat.id === categoryId 
            ? { ...cat, skills: cat.skills.filter((s) => s !== skill) } 
            : cat
        )
      })),
      
      addProject: (project) => set((state) => ({ 
        projects: [...state.projects, project] 
      })),
      
      updateProject: (id, project) => set((state) => ({
        projects: state.projects.map((p) => 
          p.id === id ? project : p
        )
      })),
      
      removeProject: (id) => set((state) => ({
        projects: state.projects.filter((p) => p.id !== id)
      })),
      
      setGeneratedCV: (cv) => set({ generatedCV: cv }),
      
      setGeneratedCoverLetter: (letter) => set({ generatedCoverLetter: letter }),
      
      setKeywordsMatched: (keywords) => set({ keywordsMatched: keywords }),
      
      setMatchScore: (score) => set({ matchScore: score }),
      
      setAnalysisComplete: (complete) => set({ analysisComplete: complete }),
      
      setLanguage: (language) => set({ language }),
      
      resetGeneratedContent: () => set({ 
        generatedCV: null, 
        generatedCoverLetter: null,
        keywordsMatched: [],
        matchScore: 0,
        analysisComplete: false
      })
    }),
    {
      name: 'cv-generator-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
) 