'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Experience, experienceSchema } from '@/types'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
  CardContent
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { 
  Briefcase, 
  Building, 
  MapPin, 
  Calendar, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2 
} from 'lucide-react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'

export function ExperienceForm() {
  // Get experiences and actions from Zustand store
  const { 
    experiences, 
    addExperience, 
    updateExperience, 
    removeExperience 
  } = useCVStore()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentExperience, setCurrentExperience] = useState<Experience | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [experienceToDelete, setExperienceToDelete] = useState<string | null>(null)
  
  const form = useForm<Experience>({
    resolver: zodResolver(experienceSchema),
    defaultValues: {
      id: '',
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
  })
  
  // Reset form when dialog opens/closes or when editing a different experience
  useEffect(() => {
    if (isDialogOpen && currentExperience) {
      form.reset(currentExperience)
    } else if (isDialogOpen) {
      form.reset({
        id: uuidv4(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      })
    }
  }, [isDialogOpen, currentExperience, form])
  
  const handleEdit = (experience: Experience) => {
    setCurrentExperience(experience)
    setIsDialogOpen(true)
  }
  
  const handleDelete = (id: string) => {
    setExperienceToDelete(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (experienceToDelete) {
      try {
        // Remove from Zustand store
        removeExperience(experienceToDelete)
        toast.success('Experience deleted successfully')
      } catch (error) {
        console.error('Error deleting experience:', error)
        toast.error('Failed to delete experience')
      } finally {
        setDeleteDialogOpen(false)
        setExperienceToDelete(null)
      }
    }
  }
  
  const onSubmit = async (data: Experience) => {
    try {
      setIsSubmitting(true)
      
      // Add or update in Zustand store
      if (currentExperience) {
        if (data.id) {
          updateExperience(data.id, data)
        }
      } else {
        addExperience(data)
      }
      
      toast.success(`Experience ${currentExperience ? 'updated' : 'added'} successfully`)
      setIsDialogOpen(false)
      setCurrentExperience(null)
    } catch (error) {
      console.error('Error saving experience:', error)
      toast.error(`Failed to ${currentExperience ? 'update' : 'add'} experience`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Work Experience</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                form.reset()
                setCurrentExperience(null)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Experience
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {currentExperience ? 'Edit Experience' : 'Add Experience'}
              </DialogTitle>
              <DialogDescription>
                {currentExperience 
                  ? 'Update your work experience details below' 
                  : 'Add your work experience details below'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
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
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Building className="h-3.5 w-3.5" />
                        Company
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
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
                        <Input placeholder="New York, NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          Start Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          End Date
                        </FormLabel>
                        <FormControl>
                          <Input 
                            type="month" 
                            {...field} 
                            disabled={form.watch('current')}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="current"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            field.onChange(checked)
                            if (checked) {
                              form.setValue('endDate', '')
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Current Position
                        </FormLabel>
                        <FormDescription>
                          Check if you currently work here
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your responsibilities and achievements..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : currentExperience ? 'Update Experience' : 'Add Experience'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this work experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Experience list */}
      {experiences.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No work experience added yet. Click &quot;Add Experience&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {experiences.map((experience) => (
            <AccordionItem key={experience.id} value={experience.id || ''} className="border rounded-md">
              <div className="flex items-center justify-between px-4">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{experience.jobTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {experience.company}, {experience.location}
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(experience)
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (experience.id) {
                        handleDelete(experience.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4">
                <div className="text-sm text-muted-foreground mb-2">
                  {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
                </div>
                <div className="text-sm whitespace-pre-line">
                  {experience.description}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
} 