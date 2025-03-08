import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useCVStore } from '@/store'
import { Loader2, FileText, Sparkles, Copy, Download, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect } from 'react'
import React from 'react'

interface CoverLetterDisplayProps {
  isGeneratingCoverLetter: boolean
  handleGenerateCoverLetter: () => Promise<void>
  handleCopyCoverLetter: () => void
  handleDownloadCoverLetter: () => Promise<void>
  coverLetterContentRef: React.RefObject<HTMLDivElement>
  resetGeneratedContent: () => void
}

export function CoverLetterDisplay({
  isGeneratingCoverLetter,
  handleGenerateCoverLetter,
  handleCopyCoverLetter,
  handleDownloadCoverLetter,
  coverLetterContentRef,
  resetGeneratedContent
}: CoverLetterDisplayProps) {
  const { userDetails, generatedCoverLetter } = useCVStore()
  const isValid = !!userDetails
  
  // Debug logging for cover letter content
  useEffect(() => {
    if (generatedCoverLetter) {
      console.log('Cover letter exists:', { 
        hasContent: !!generatedCoverLetter.content,
        contentLength: generatedCoverLetter.content?.length || 0,
        hasSections: !!generatedCoverLetter.sections
      })
    } else {
      console.log('No cover letter found in store')
    }
  }, [generatedCoverLetter])

  if (isGeneratingCoverLetter) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-20 h-20 relative mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Crafting Your Cover Letter</h3>
        <p className="text-muted-foreground max-w-md">
          We&apos;re creating a tailored cover letter based on your profile and the job description. 
          This may take a moment...
        </p>
      </div>
    )
  }

  if (!generatedCoverLetter) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h3 className="text-xl font-medium mb-2">No Cover Letter Generated Yet</h3>
        <p className="text-muted-foreground max-w-md mb-6">
          Fill in your details, add your experience, and paste a job description. 
          Then click the Generate button to create a personalized cover letter.
        </p>
        <Button 
          onClick={handleGenerateCoverLetter} 
          className="gap-2 px-6"
          disabled={!isValid || !userDetails}
        >
          <Sparkles className="h-4 w-4" />
          Generate Cover Letter
        </Button>
      </div>
    )
  }

  // At this point generatedCoverLetter is guaranteed to exist
  // Safety check - make sure we have actual content to display
  const hasContent = !!generatedCoverLetter.content && generatedCoverLetter.content.trim().length > 0
  const hasSections = !!generatedCoverLetter.sections

  // Generate content from sections if there's no direct content but sections exist
  let formattedContent = ''
  if (!hasContent && hasSections && generatedCoverLetter.sections) {
    const { introduction, body, conclusion } = generatedCoverLetter.sections
    formattedContent = `${introduction || ''}\n\n${Array.isArray(body) ? body.join('\n\n') : (body || '')}\n\n${conclusion || ''}`
  }
  
  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between space-x-2 px-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={handleGenerateCoverLetter}
          disabled={isGeneratingCoverLetter || !isValid}
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
                  onClick={handleDownloadCoverLetter}
                  disabled={!hasContent && !formattedContent}
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
                  id="copy-cover-letter-btn" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleCopyCoverLetter}
                  disabled={!hasContent && !formattedContent}
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
            id="cover-letter-pdf-content" 
            className="p-8 bg-white text-black font-serif ats-friendly-letter cover-letter-content"
            style={{ 
              color: 'black', 
              backgroundColor: 'white',
              fontFamily: 'Georgia, Times New Roman, serif',
              lineHeight: '1.5',
              fontSize: '12pt'
            }}
          >
            {hasContent && (
              <div className="whitespace-pre-wrap font-serif max-w-none">
                {generatedCoverLetter.content}
              </div>
            )}
            {!hasContent && hasSections && generatedCoverLetter.sections && (
              <div className="whitespace-pre-wrap font-serif max-w-none">
                {generatedCoverLetter.sections.introduction && (
                  <div className="mb-4">{generatedCoverLetter.sections.introduction}</div>
                )}
                
                {generatedCoverLetter.sections.body && Array.isArray(generatedCoverLetter.sections.body) && (
                  <div className="space-y-4">
                    {generatedCoverLetter.sections.body.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {generatedCoverLetter.sections.conclusion && (
                  <div className="mt-4">{generatedCoverLetter.sections.conclusion}</div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Visible content with theme support */}
        <div 
          ref={coverLetterContentRef} 
          className="p-8 bg-white dark:bg-slate-900 text-black dark:text-white font-serif ats-friendly-letter cover-letter-content min-h-[300px]"
        >
          {hasContent ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif prose prose-sm dark:prose-invert max-w-none">
              {generatedCoverLetter.content}
            </div>
          ) : hasSections && generatedCoverLetter.sections ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed font-serif prose prose-sm dark:prose-invert max-w-none">
              {generatedCoverLetter.sections.introduction && (
                <div className="mb-4">{generatedCoverLetter.sections.introduction}</div>
              )}
              
              {generatedCoverLetter.sections.body && Array.isArray(generatedCoverLetter.sections.body) && (
                <div className="space-y-4">
                  {generatedCoverLetter.sections.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
              
              {generatedCoverLetter.sections.conclusion && (
                <div className="mt-4">{generatedCoverLetter.sections.conclusion}</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] text-center text-muted-foreground">
              <FileText className="h-8 w-8 mb-2" />
              <p>The cover letter content appears to be empty. Please try regenerating it.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 