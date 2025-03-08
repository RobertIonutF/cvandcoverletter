import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useCVStore } from '@/store'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Info, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'

const formSchema = z.object({
  jobDescription: z.string().min(100, {
    message: 'Job description should be at least 100 characters',
  }),
})

type JobDescription = z.infer<typeof formSchema>

interface JobDescriptionFormProps {
  onSubmit: (data: JobDescription) => Promise<void>
  isLoading?: boolean
}

export function JobDescriptionForm({ onSubmit, isLoading: externalIsLoading }: JobDescriptionFormProps) {
  const { jobDescription } = useCVStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : isSubmitting
  
  const form = useForm<JobDescription>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobDescription: jobDescription || '',
    },
  })

  const hasJobDescription = !!jobDescription && jobDescription.length > 100
  
  const handleSubmit = async (data: JobDescription) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } catch (error) {
      console.error('Error submitting job description:', error)
    } finally {
      setIsSubmitting(false)
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
              Paste the job description to tailor your resume and cover letter
            </p>
          </div>
        </div>
        <Badge 
          variant={hasJobDescription ? "default" : "destructive"}
          className={hasJobDescription ? "bg-green-100 text-green-800 hover:bg-green-200" : ""}
        >
          {hasJobDescription ? "Ready" : "Required"}
        </Badge>
      </div>
    
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
          <FormField
            control={form.control}
            name="jobDescription"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px] bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
} 