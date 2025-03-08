'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserDetails, userDetailsSchema } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { 
  User, 
  Briefcase, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  FileText,
  Save,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'

export function UserDetailsForm() {
  // Get user details and setter from Zustand store
  const { userDetails, setUserDetails } = useCVStore()
  
  // Initialize form with user details from store
  const form = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      fullName: '',
      jobTitle: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      website: '',
      linkedin: '',
      github: ''
    }
  })
  
  // Load user details from store when component mounts
  useEffect(() => {
    if (userDetails) {
      form.reset(userDetails)
    }
  }, [userDetails, form])
  
  const { formState: { isSubmitting } } = form

  const onSubmit = async (data: UserDetails) => {
    try {
      // Intentional slight delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update Zustand store
      setUserDetails(data)
      
      toast.success('Personal details saved successfully')
    } catch (error) {
      console.error('Error saving user details:', error)
      toast.error('Failed to save personal details')
    }
  }

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="px-0 pt-0">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          Personal Details
        </CardTitle>
        <CardDescription>
          Enter your personal information to be displayed on your resume and cover letter
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="John Doe" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5" />
                      Job Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Frontend Developer" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john.doe@example.com" 
                          type="email" 
                          {...field} 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="(123) 456-7890" 
                          {...field} 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Location
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="New York, NY" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        Website (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://yourwebsite.com" 
                          {...field} 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Linkedin className="h-3.5 w-3.5" />
                        LinkedIn (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://linkedin.com/in/username" 
                          {...field} 
                          className="bg-background"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="github"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <Github className="h-3.5 w-3.5" />
                      GitHub (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://github.com/username" 
                        {...field} 
                        className="bg-background"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Professional Summary
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="A brief summary of your professional background and key strengths..." 
                        className="min-h-[120px] resize-none bg-background" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Write a concise summary highlighting your experience, skills, and career goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 