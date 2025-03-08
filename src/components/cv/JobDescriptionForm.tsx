import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCVStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Info, Save, Loader2, Link, ArrowDown, CheckCircle2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

const formSchema = z.object({
  jobDescription: z.string().min(150, {
    message: 'Job description should be at least 150 characters',
  }),
  jobUrl: z.string().url({ message: 'Please enter a valid URL' }).optional().or(z.literal(''))
})

type JobDescriptionFormData = z.infer<typeof formSchema>

interface JobDescriptionFormProps {
  isLoading?: boolean
}

export function JobDescriptionForm({ isLoading: externalIsLoading }: JobDescriptionFormProps) {
  const { jobDescription } = useCVStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : isSubmitting
  
  const form = useForm<JobDescriptionFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: jobDescription || '',
      jobUrl: ''
    },
  })

  const hasJobDescription = !!jobDescription && jobDescription.length > 150
  
  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (saveSuccess) {
      timer = setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [saveSuccess]);
  
  const handleSubmit = async (data: JobDescriptionFormData) => {
    setIsSubmitting(true)
    try {
      // Save job description to store directly
      useCVStore.setState({ jobDescription: data.jobDescription })
      
      // Show success feedback
      toast.success('Job description saved successfully')
      setSaveSuccess(true)
      setLastSaved(new Date())
      
      // Highlight "Ready" badge by briefly changing its style
      const badge = document.querySelector('.job-description-badge');
      if (badge) {
        badge.classList.add('badge-highlight');
        setTimeout(() => {
          badge.classList.remove('badge-highlight');
        }, 1500);
      }
    } catch (error) {
      console.error('Error saving job description:', error)
      toast.error('Failed to save job description')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Format time for last saved timestamp
  const getLastSavedTime = () => {
    if (!lastSaved) return '';
    return lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const extractFromUrl = async () => {
    const jobUrl = form.getValues('jobUrl')
    
    if (!jobUrl) {
      toast.error('Please enter a valid job posting URL')
      return
    }
    
    try {
      setIsExtracting(true)
      
      const response = await fetch('/api/extract-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: jobUrl }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to extract job information')
      }
      
      const data = await response.json()
      
      // Update the job description field with the extracted content
      form.setValue('jobDescription', data.jobDescription)
      toast.success('Job information extracted successfully')
    } catch (error) {
      console.error('Error extracting job information:', error)
      toast.error(`Failed to extract job information: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsExtracting(false)
    }
  }
  
  return (
    <div className="relative">
      <div className="p-4 mb-4 border-b bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-500" />
          <div>
            <h3 className="text-base font-medium">Job Description</h3>
            <p className="text-xs text-muted-foreground">
              Enter a job posting URL or paste the job description to tailor your resume and cover letter
            </p>
          </div>
        </div>
        <Badge 
          variant={hasJobDescription ? "default" : "destructive"}
          className={`job-description-badge ${hasJobDescription ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}`}
        >
          {hasJobDescription ? "Ready" : "Required"}
        </Badge>
      </div>
    
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
          {/* Job URL Input */}
          <div className="space-y-3">
            <FormField
              control={form.control}
              name="jobUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Link className="h-4 w-4" />
                    <span>Job Posting URL</span>
                  </FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        placeholder="https://example.com/job-posting"
                        className="bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                        {...field}
                        disabled={isLoading || isExtracting}
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      onClick={extractFromUrl}
                      disabled={isLoading || isExtracting}
                      variant="secondary"
                      className="shrink-0"
                    >
                      {isExtracting ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          Extract
                        </>
                      )}
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            
            <div className="flex justify-center">
              <ArrowDown className="text-slate-400" size={18} />
            </div>
          </div>
          
          {/* Job Description Textarea */}
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  <span>Job Description</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Paste or edit the job description here..."
                    className={`min-h-[300px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 ${saveSuccess ? 'textarea-saved' : ''}`}
                    {...field}
                    disabled={isLoading || isExtracting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex items-center justify-between">
            {/* Success indicator */}
            {saveSuccess && (
              <div className="flex items-center gap-2 text-green-600 animate-fade-in">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">Job description saved at {getLastSavedTime()}</span>
              </div>
            )}
            {!saveSuccess && lastSaved && (
              <div className="text-xs text-slate-500">
                Last saved: {getLastSavedTime()}
              </div>
            )}
            {!saveSuccess && !lastSaved && <div></div>}
            
            <Button 
              type="submit" 
              className="gap-2 bg-green-600 hover:bg-green-700 text-white font-medium transition-all duration-300 hover:shadow-md"
              disabled={isLoading || isExtracting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="animate-pulse">Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Job Description
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 