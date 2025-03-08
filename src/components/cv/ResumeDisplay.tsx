import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCVStore } from '@/store'
import { Loader2, FileText, Sparkles, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import React from 'react'

interface ResumeDisplayProps {
  isGenerating: boolean
  handleGenerateCV: () => Promise<void>
  handleCopyCV: () => void
  handleDownloadCV: () => Promise<void>
  cvContentRef: React.RefObject<HTMLDivElement>
  resetGeneratedContent: () => void
}

export function ResumeDisplay({
  isGenerating,
  handleGenerateCV,
  handleCopyCV,
  handleDownloadCV,
  cvContentRef,
  resetGeneratedContent
}: ResumeDisplayProps) {
  const { userDetails, generatedCV } = useCVStore()
  const isValid = !!userDetails

  if (isGenerating) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 relative mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Crafting Your Resume</h3>
        <p className="text-muted-foreground max-w-md">
          We&apos;re creating a tailored, ATS-optimized resume based on your profile and the job description. 
          This may take a moment...
        </p>
      </div>
    )
  }

  if (!generatedCV) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Resume Generated Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Fill in your details, add your experience, and paste a job description. 
          Then click the Generate button to create a tailored resume.
        </p>
        <Button 
          onClick={handleGenerateCV} 
          className="gap-2 px-6"
          disabled={!isValid || !userDetails}
        >
          <Sparkles className="h-4 w-4" />
          Generate Resume
        </Button>
      </div>
    )
  }

  // At this point, generatedCV is guaranteed to exist
  return (
    <div className="space-y-4">
      <div className="flex justify-between space-x-2 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleGenerateCV}
          disabled={isGenerating || !isValid}
        >
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-8 gap-1"
                  onClick={handleDownloadCV}
                  disabled={!generatedCV}
                >
                  <Download className="h-4 w-4" />
                  DOCX
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download as Word Document (.docx)</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  id="copy-cv-btn" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleCopyCV}
                  disabled={!generatedCV}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy to Clipboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => {
                    resetGeneratedContent()
                    toast.success("Content reset. Try generating again.")
                  }}
                >
                  <span className="sr-only">Reset</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                    <path d="M3 3v5h5"></path>
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                    <path d="M16 21h5v-5"></path>
                  </svg>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Content</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Display wrapper with theme support */}
      <div className="mx-auto max-w-4xl rounded-md border shadow-md overflow-hidden">
        {/* PDF optimized content (hidden in UI but used for downloads/printing) */}
        <div className="hidden">
          <div 
            id="resume-pdf-content" 
            className="bg-white text-black font-sans ats-friendly-cv" 
            style={{ 
              color: 'black', 
              backgroundColor: 'white',
              fontFamily: "'Calibri', 'Segoe UI', Arial, sans-serif",
              lineHeight: '1.2',
              fontSize: '9pt',
              width: '8.5in',
              boxSizing: 'border-box'
            }}
          >
            {generatedCV.content ? (
              <div className="whitespace-pre-wrap leading-relaxed">
                {generatedCV.content}
              </div>
            ) : generatedCV.sections ? (
              <div className="cv-content" style={{ pageBreakInside: 'avoid' }}>
                {/* Header with user details */}
                <header className="text-center" style={{ marginBottom: '0.08in', pageBreakInside: 'avoid' }}>
                  <h1 style={{ fontSize: '14pt', fontWeight: 'bold', margin: '0 0 0.1in 0' }}>{userDetails?.fullName}</h1>
                  <div className="contact-info" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '4px', fontSize: '8pt' }}>
                    {userDetails?.email && <span>{userDetails.email}</span>}
                    {userDetails?.phone && <span>• {userDetails.phone}</span>}
                    {userDetails?.location && <span>• {userDetails.location}</span>}
                    {userDetails?.linkedin && <span>• {userDetails.linkedin}</span>}
                    {userDetails?.website && <span>• {userDetails.website}</span>}
                  </div>
                </header>

                {/* Summary Section - Make it more compact */}
                {generatedCV.sections?.summary && (
                  <section style={{ marginBottom: '0.1in', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', paddingBottom: '0.03in', borderBottom: '1px solid #ddd', margin: '0.05in 0', textTransform: 'uppercase' }}>SUMMARY</h2>
                    <p style={{ fontSize: '9pt', lineHeight: '1.2', marginBottom: '0.05in' }}>{generatedCV.sections.summary}</p>
                  </section>
                )}

                {/* Experience Section - Condense content */}
                {generatedCV.sections?.experience && generatedCV.sections.experience.length > 0 && (
                  <section style={{ marginBottom: '0.1in' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', paddingBottom: '0.03in', borderBottom: '1px solid #ddd', margin: '0.05in 0', textTransform: 'uppercase' }}>EXPERIENCE</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.08in' }}>
                      {generatedCV.sections.experience.map((exp, index) => (
                        <div key={index} className="experience-item" style={{ marginBottom: '0.08in', pageBreakInside: 'avoid' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0' }}>{exp.title}</h3>
                            <span style={{ fontSize: '8pt', color: '#666' }}>{exp.period}</span>
                          </div>
                          <p style={{ fontSize: '9pt', fontWeight: '500', margin: '0.02in 0' }}>{exp.company}</p>
                          <p style={{ fontSize: '9pt', whiteSpace: 'pre-line', lineHeight: '1.2', margin: '0' }}>{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Education Section - More compact */}
                {generatedCV.sections?.education && generatedCV.sections.education.length > 0 && (
                  <section style={{ marginBottom: '0.1in', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', paddingBottom: '0.03in', borderBottom: '1px solid #ddd', margin: '0.05in 0', textTransform: 'uppercase' }}>EDUCATION</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.06in' }}>
                      {generatedCV.sections.education.map((edu, index) => (
                        <div key={index} className="education-item" style={{ marginBottom: '0.06in', pageBreakInside: 'avoid' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0' }}>{edu.degree}</h3>
                            <span style={{ fontSize: '8pt', color: '#666' }}>{edu.period}</span>
                          </div>
                          <p style={{ fontSize: '9pt', margin: '0.02in 0' }}>{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Skills Section - Compact display */}
                {generatedCV.sections?.skills && generatedCV.sections.skills.length > 0 && (
                  <section style={{ marginBottom: '0.1in', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', paddingBottom: '0.03in', borderBottom: '1px solid #ddd', margin: '0.05in 0', textTransform: 'uppercase' }}>SKILLS</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                      {generatedCV.sections.skills.map((skill, index) => (
                        <span key={index} className="skill-tag" style={{ fontSize: '8pt', padding: '1px 4px', backgroundColor: '#f0f4f8', color: '#2c5282', borderRadius: '3px', fontWeight: '500', display: 'inline-block', margin: '1px' }}>{skill}</span>
                      ))}
                    </div>
                  </section>
                )}

                {/* Projects Section - More compact */}
                {generatedCV.sections?.projects && generatedCV.sections.projects.length > 0 && (
                  <section style={{ marginBottom: '0.1in', pageBreakInside: 'avoid' }}>
                    <h2 style={{ fontSize: '11pt', fontWeight: 'bold', paddingBottom: '0.03in', borderBottom: '1px solid #ddd', margin: '0.05in 0', textTransform: 'uppercase' }}>PROJECTS</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.06in' }}>
                      {generatedCV.sections.projects.map((project, index) => (
                        <div key={index} className="project-item" style={{ padding: '4px', backgroundColor: '#f9fafb', borderRadius: '3px', marginBottom: '4px', pageBreakInside: 'avoid' }}>
                          <h3 style={{ fontSize: '10pt', fontWeight: 'bold', margin: '0 0 0.02in 0' }}>{project.name}</h3>
                          <p style={{ fontSize: '9pt', whiteSpace: 'pre-line', lineHeight: '1.2', margin: '0 0 0.02in 0' }}>{project.description}</p>
                          {project.technologies && project.technologies.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px' }}>
                              {project.technologies.map((tech, techIndex) => (
                                <span key={techIndex} style={{ fontSize: '8pt', padding: '1px 4px', backgroundColor: '#e5e7eb', borderRadius: '3px', display: 'inline-block' }}>{tech}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            ) : null}
          </div>
        </div>
        
        {/* Visible content with theme support */}
        <div 
          ref={cvContentRef} 
          className="p-8 space-y-5 bg-white dark:bg-slate-900 text-black dark:text-white font-sans ats-friendly-cv"
        >
          {generatedCV.content ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-sans prose prose-sm dark:prose-invert max-w-none">
              {generatedCV.content}
            </div>
          ) : generatedCV.sections ? (
            <div className="cv-content">
              {/* Header with user details */}
              <header className="mb-6 text-center">
                <h1 className="text-2xl font-bold mb-2">{userDetails?.fullName}</h1>
                <div className="contact-info flex flex-wrap justify-center gap-3 text-sm">
                  {userDetails?.email && <span>{userDetails.email}</span>}
                  {userDetails?.phone && <span>• {userDetails.phone}</span>}
                  {userDetails?.location && <span>• {userDetails.location}</span>}
                  {userDetails?.linkedin && <span>• {userDetails.linkedin}</span>}
                  {userDetails?.website && <span>• {userDetails.website}</span>}
                </div>
              </header>

              {/* Summary Section */}
              {generatedCV.sections?.summary && (
                <section className="mb-5">
                  <h2 className="text-lg font-bold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">SUMMARY</h2>
                  <p className="text-sm leading-relaxed">{generatedCV.sections.summary}</p>
                </section>
              )}

              {/* Experience Section */}
              {generatedCV.sections?.experience && generatedCV.sections.experience.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-lg font-bold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">EXPERIENCE</h2>
                  <div className="space-y-4">
                    {generatedCV.sections.experience.map((exp, index) => (
                      <div key={index} className="experience-item">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-semibold">{exp.title}</h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{exp.period}</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{exp.company}</p>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education Section */}
              {generatedCV.sections?.education && generatedCV.sections.education.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-lg font-bold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">EDUCATION</h2>
                  <div className="space-y-3">
                    {generatedCV.sections.education.map((edu, index) => (
                      <div key={index} className="education-item">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-base font-semibold">{edu.degree}</h3>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{edu.period}</span>
                        </div>
                        <p className="text-sm">{edu.institution}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills Section */}
              {generatedCV.sections?.skills && generatedCV.sections.skills.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-lg font-bold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">SKILLS</h2>
                  <div className="flex flex-wrap gap-2">
                    {generatedCV.sections.skills.map((skill, index) => (
                      <span key={index} className="skill-tag text-sm py-1 px-3 bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-md font-medium">{skill}</span>
                    ))}
                  </div>
                </section>
              )}

              {/* Projects Section */}
              {generatedCV.sections?.projects && generatedCV.sections.projects.length > 0 && (
                <section className="mb-5">
                  <h2 className="text-lg font-bold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">PROJECTS</h2>
                  <div className="space-y-4">
                    {generatedCV.sections.projects.map((project, index) => (
                      <div key={index} className="project-item bg-gray-50 dark:bg-gray-800/50 p-3 rounded-md">
                        <h3 className="text-base font-semibold mb-2">{project.name}</h3>
                        <p className="text-sm whitespace-pre-line leading-relaxed mb-2">{project.description}</p>
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.technologies.map((tech, techIndex) => (
                              <span key={techIndex} className="text-xs py-0.5 px-2 bg-gray-200 dark:bg-gray-700 rounded-full">{tech}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
} 