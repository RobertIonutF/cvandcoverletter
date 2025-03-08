import React from 'react'
import { useCVStore } from '@/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Copy, Download, RefreshCw, FileText } from 'lucide-react'
import { useEffect } from 'react'

// Language display names and their flags
const languageFlags: Record<string, string> = {
  english: '🇺🇸',
  french: '🇫🇷',
  spanish: '🇪🇸',
  german: '🇩🇪',
  romanian: '🇷🇴',
  russian: '🇷🇺',
  chinese: '🇨🇳',
  japanese: '🇯🇵'
}

// Language display names
const languageNames: Record<string, string> = {
  english: 'English',
  french: 'French',
  spanish: 'Spanish',
  german: 'German',
  romanian: 'Romanian',
  russian: 'Russian',
  chinese: 'Chinese',
  japanese: 'Japanese'
}

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
  const { userDetails, generatedCoverLetter, language } = useCVStore()
  
  const isValid = !!userDetails && Object.keys(userDetails).length > 0
  
  const languageFlag = languageFlags[language] || '🌐'
  const languageName = languageNames[language] || language

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
        <h3 className="text-xl font-medium mb-2">Writing Your Cover Letter</h3>
        <p className="text-muted-foreground max-w-md">
          We&apos;re crafting a personalized cover letter based on your profile and the job description. 
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
          disabled={!isValid || isGeneratingCoverLetter}
        >
          {isGeneratingCoverLetter ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Cover Letter
            </>
          )}
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

  // Decide what content to display - prefer direct content, fall back to formatted sections
  const displayContent = hasContent 
    ? generatedCoverLetter.content 
    : formattedContent

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">Your Cover Letter</h2>
          <Badge 
            variant="outline" 
            className="gap-1 text-xs font-normal bg-slate-50 dark:bg-slate-900"
          >
            <span>{languageFlag}</span>
            <span>{languageName}</span>
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1" 
            onClick={handleCopyCoverLetter}
          >
            <Copy className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Copy</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1" 
            onClick={handleDownloadCoverLetter}
          >
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Download</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            className="gap-1" 
            onClick={resetGeneratedContent}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Reset</span>
          </Button>
          
          <Button 
            size="sm" 
            variant="default" 
            className="gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
            onClick={handleGenerateCoverLetter}
            disabled={isGeneratingCoverLetter}
          >
            {isGeneratingCoverLetter ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span className="whitespace-nowrap">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                <span className="whitespace-nowrap">Regenerate</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 bg-white dark:bg-slate-900/50 border rounded-md p-4 shadow-sm">
        <div 
          ref={coverLetterContentRef} 
          className="whitespace-pre-wrap font-sans text-sm" 
          id="cover-letter-content"
        >
          {displayContent}
        </div>
      </ScrollArea>
    </div>
  )
} 