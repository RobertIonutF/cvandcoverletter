'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Education, educationSchema } from '@/types'
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
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  Building, 
  MapPin, 
  Calendar, 
  FileText,
  Pencil,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'
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

export function EducationForm() {
  // Get educations and actions from Zustand store
  const { 
    educations, 
    addEducation, 
    updateEducation, 
    removeEducation 
  } = useCVStore()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentEducationId, setCurrentEducationId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null)
  
  const form = useForm<Education>({
    resolver: zodResolver(educationSchema),
    defaultValues: {
      id: uuidv4(),
      degree: '',
      institution: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }
  })
  
  const { watch, setValue, reset } = form
  const watchCurrent = watch('current')

  const handleAddEducation = async (data: Education) => {
    try {
      setIsSubmitting(true)
      
      // Add or update in Zustand store
      if (currentEducationId) {
        // Update existing education
        if (data.id) {
          updateEducation(data.id, data)
        }
      } else {
        // Add new education
        addEducation(data)
      }
      
      toast.success(`Education ${currentEducationId ? 'updated' : 'added'} successfully`)
      reset()
      setIsDialogOpen(false)
      setCurrentEducationId(null)
    } catch (error) {
      console.error('Error saving education:', error)
      toast.error(`Failed to ${currentEducationId ? 'update' : 'add'} education`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (education: Education) => {
    if (education.id) {
      setCurrentEducationId(education.id)
    }
    
    // Set form values
    Object.entries(education).forEach(([key, value]) => {
      // @ts-expect-error - dynamic key setting
      setValue(key, value)
    })
    
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setEducationToDelete(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (educationToDelete) {
      try {
        // Remove from Zustand store
        removeEducation(educationToDelete)
        toast.success('Education deleted successfully')
      } catch (error) {
        console.error('Error deleting education:', error)
        toast.error('Failed to delete education')
      } finally {
        setDeleteDialogOpen(false)
        setEducationToDelete(null)
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education
          </h3>
          <p className="text-sm text-muted-foreground">
            Add your educational background in reverse chronological order
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                reset()
                setCurrentEducationId(null)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Education
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {currentEducationId ? 'Edit Education' : 'Add Education'}
              </DialogTitle>
              <DialogDescription>
                {currentEducationId 
                  ? 'Update your education details below' 
                  : 'Add your education details below'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddEducation)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="degree"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <GraduationCap className="h-3.5 w-3.5" />
                        Degree / Certificate
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bachelor of Science in Computer Science" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="institution"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">
                          <Building className="h-3.5 w-3.5" />
                          Institution
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="University Name" 
                            {...field} 
                          />
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
                          <Input 
                            placeholder="City, State" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            disabled={watchCurrent}
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
                              setValue('endDate', '')
                            }
                          }}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          I am currently studying here
                        </FormLabel>
                        <FormDescription>
                          Check this if you are currently enrolled
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
                        <FileText className="h-3.5 w-3.5" />
                        Description (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Relevant coursework, achievements, activities..." 
                          className="min-h-[120px] resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Include relevant coursework, achievements, or extracurricular activities
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : currentEducationId ? 'Update Education' : 'Add Education'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {educations.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No education added yet</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => setIsDialogOpen(true)}
            >
              Add your first education
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-4">
          {educations.map((education) => (
            <AccordionItem 
              key={education.id} 
              value={education.id || ''}
              className="border rounded-lg px-1"
            >
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex flex-col items-start text-left">
                  <div className="font-medium">{education.degree}</div>
                  <div className="text-sm text-muted-foreground">
                    {education.institution}, {education.location}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mr-4">
                  {education.startDate} - {education.current ? 'Present' : education.endDate}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-1">
                {education.description && (
                  <p className="text-sm whitespace-pre-line mb-4">{education.description}</p>
                )}
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1"
                    onClick={() => handleEdit(education)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-1 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(education.id || '')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this education entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 