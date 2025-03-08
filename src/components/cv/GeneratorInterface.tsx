'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect, useCallback } from 'react'

// Imported components
import { UserDetailsForm } from '@/components/UserDetailsForm'
import { ExperienceForm } from '@/components/ExperienceForm'
import { EducationForm } from '@/components/EducationForm'
import { SkillsForm } from '@/components/SkillsForm'
import { ProjectsForm } from '@/components/ProjectsForm'
import { ResumeUploader } from '@/components/ResumeUploader'
import { JobDescriptionForm } from '@/components/cv/JobDescriptionForm'
import { ResumeDisplay } from '@/components/cv/ResumeDisplay'
import { CoverLetterDisplay } from '@/components/cv/CoverLetterDisplay'

// Hooks
import { useDocumentGeneration } from '@/hooks/useDocumentGeneration'
import { useDocumentActions } from '@/hooks/useDocumentActions'
import { useCVStore } from '@/store'

export function GeneratorInterface() {
  const [activeTab, setActiveTab] = useState<string>('resume')
  const { generatedCV, generatedCoverLetter } = useCVStore()
  
  // Use our custom hooks
  const {
    isGenerating,
    isGeneratingCoverLetter,
    isLoading,
    handleGenerateCV: originalHandleGenerateCV,
    handleGenerateCoverLetter: originalHandleGenerateCoverLetter,
    handleSubmitJobDescription
  } = useDocumentGeneration()
  
  // Wrap generation functions to ensure void return types
  const handleGenerateCV = useCallback(async (): Promise<void> => {
    await originalHandleGenerateCV()
  }, [originalHandleGenerateCV])

  const handleGenerateCoverLetter = useCallback(async (): Promise<void> => {
    await originalHandleGenerateCoverLetter()
  }, [originalHandleGenerateCoverLetter])
  
  const {
    cvContentRef,
    coverLetterContentRef,
    handleDownloadCV,
    handleDownloadCoverLetter,
    handleCopyCV,
    handleCopyCoverLetter,
    resetGeneratedContent
  } = useDocumentActions()
  
  // Switch to cover letter tab when a cover letter is generated
  useEffect(() => {
    if (isGeneratingCoverLetter) {
      setActiveTab('cover-letter')
    }
  }, [isGeneratingCoverLetter])
  
  // Switch to the tab when content is generated
  useEffect(() => {
    if (generatedCoverLetter && !generatedCV) {
      setActiveTab('cover-letter')
    }
  }, [generatedCoverLetter, generatedCV])
  
  return (
    <div className="py-1">
      <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-80px)] rounded-lg border">
        {/* Left Panel - Form and Editor */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full flex flex-col">
            <Tabs defaultValue="details" className="flex-1">
              <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
                <TabsList className="grid w-full grid-cols-5 gap-4 bg-slate-200/70 dark:bg-slate-800">
                  <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                  <TabsTrigger value="experience" className="text-xs">Experience</TabsTrigger>
                  <TabsTrigger value="education" className="text-xs">Education</TabsTrigger>
                  <TabsTrigger value="projects" className="text-xs">Projects</TabsTrigger>
                  <TabsTrigger value="skills" className="text-xs">Skills</TabsTrigger>
                </TabsList>
              </div>
                
              <ScrollArea className="flex-1">
                <TabsContent value="details" className="p-4 space-y-6">
                  <UserDetailsForm />
                  <ResumeUploader />
                </TabsContent>
                <TabsContent value="experience" className="mt-0 px-1">
                  <ExperienceForm />
                </TabsContent>
                <TabsContent value="education" className="mt-0 px-1">
                  <EducationForm />
                </TabsContent>
                <TabsContent value="projects" className="mt-0 px-1">
                  <ProjectsForm />
                </TabsContent>
                <TabsContent value="skills" className="mt-0 px-1">
                  <SkillsForm />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />
        
        {/* Middle Panel - Job Description */}
        <ResizablePanel defaultSize={25} minSize={20}>
          <div className="h-full">
            <JobDescriptionForm 
              onSubmit={handleSubmitJobDescription} 
              isLoading={isLoading}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />
        
        {/* Right Panel - CV and Cover Letter Previews */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="h-full flex flex-col"
              >
                <div className="px-4 pt-4 border-b">
                  <TabsList className="w-full max-w-md mx-auto">
                    <TabsTrigger value="resume" className="flex-1">Resume</TabsTrigger>
                    <TabsTrigger value="cover-letter" className="flex-1 relative">
                      Cover Letter
                      {generatedCoverLetter && !activeTab.includes('cover-letter') && (
                        <span className="absolute top-0 right-1 h-2 w-2 rounded-full bg-blue-500"></span>
                      )}
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="resume" className="flex-1 p-6 overflow-auto">
                  <ResumeDisplay
                    isGenerating={isGenerating}
                    handleGenerateCV={handleGenerateCV}
                    handleCopyCV={handleCopyCV}
                    handleDownloadCV={handleDownloadCV}
                    cvContentRef={cvContentRef}
                    resetGeneratedContent={resetGeneratedContent}
                  />
                </TabsContent>
                
                <TabsContent value="cover-letter" className="flex-1 p-6 overflow-auto h-full">
                  <CoverLetterDisplay 
                    isGeneratingCoverLetter={isGeneratingCoverLetter}
                    handleGenerateCoverLetter={handleGenerateCoverLetter}
                    handleCopyCoverLetter={handleCopyCoverLetter}
                    handleDownloadCoverLetter={handleDownloadCoverLetter}
                    coverLetterContentRef={coverLetterContentRef}
                    resetGeneratedContent={resetGeneratedContent}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
} 