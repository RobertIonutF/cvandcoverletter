import { Metadata } from 'next'
import { CVGeneratorInterface } from '@/components/CVGeneratorInterface'
import { Sparkles, FileText, Briefcase } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'CV Generator | Create ATS-Friendly Resumes',
  description: 'Generate tailored resumes and cover letters that match job descriptions and highlight your relevant skills and experience.',
}

export default function CVPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 md:mb-12">
            <div className="flex flex-col gap-2 mb-4">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">CV & Cover Letter Generator</h1>
              <p className="text-muted-foreground text-lg">Create tailored documents for your job applications</p>
            </div>
            
            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="px-3 py-1 gap-1 text-xs font-normal">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline" className="px-3 py-1 gap-1 text-xs font-normal">
                <FileText className="h-3 w-3 mr-1" />
                ATS-Friendly
              </Badge>
              <Badge variant="outline" className="px-3 py-1 gap-1 text-xs font-normal">
                <Briefcase className="h-3 w-3 mr-1" />
                Job-Tailored
              </Badge>
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-card border rounded-lg p-4 mb-8 max-w-3xl">
            <h2 className="text-lg font-medium mb-2">How to use this tool</h2>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Enter your personal details, experience, education, and skills in the left panel</li>
              <li>Paste the job description you&apos;re applying for to tailor your documents</li>
              <li>Click the &quot;Generate&quot; button in each panel to create your resume and cover letter</li>
              <li>Download or copy your documents when ready</li>
            </ol>
          </div>
          
          {/* Main Interface */}
          <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
            <CVGeneratorInterface />
          </div>
        </div>
      </div>
    </div>
  )
} 