'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Project, projectSchema } from '@/types'
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
  Code, 
  FolderGit, 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  Loader2,
  Link as LinkIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'

export function ProjectsForm() {
  // Get projects and actions from Zustand store
  const { 
    projects, 
    addProject, 
    updateProject, 
    removeProject 
  } = useCVStore()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [newTechnology, setNewTechnology] = useState('')
  
  const form = useForm<Project>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      id: '',
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: ''
    }
  })
  
  // Reset form when dialog opens/closes or when editing a different project
  const resetForm = () => {
    form.reset({
      id: uuidv4(),
      name: '',
      description: '',
      technologies: [],
      url: '',
      startDate: '',
      endDate: ''
    })
  }
  
  const handleEdit = (project: Project) => {
    setCurrentProject(project)
    form.reset(project)
    setIsDialogOpen(true)
  }
  
  const handleDelete = (id: string) => {
    setProjectToDelete(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDelete = async () => {
    if (projectToDelete) {
      try {
        // Remove from Zustand store
        removeProject(projectToDelete)
        toast.success('Project deleted successfully')
      } catch (error) {
        console.error('Error deleting project:', error)
        toast.error('Failed to delete project')
      } finally {
        setDeleteDialogOpen(false)
        setProjectToDelete(null)
      }
    }
  }
  
  const addTechnology = () => {
    if (!newTechnology.trim()) return
    
    const currentTechnologies = form.getValues('technologies') || []
    form.setValue('technologies', [...currentTechnologies, newTechnology.trim()])
    setNewTechnology('')
  }
  
  const removeTechnology = (tech: string) => {
    const currentTechnologies = form.getValues('technologies') || []
    form.setValue(
      'technologies', 
      currentTechnologies.filter(t => t !== tech)
    )
  }
  
  const onSubmit = async (data: Project) => {
    try {
      setIsSubmitting(true)
      
      // Add or update in Zustand store
      if (currentProject) {
        if (data.id) {
          updateProject(data.id, data)
        }
      } else {
        addProject(data)
      }
      
      toast.success(`Project ${currentProject ? 'updated' : 'added'} successfully`)
      setIsDialogOpen(false)
      setCurrentProject(null)
      resetForm()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error(`Failed to ${currentProject ? 'update' : 'add'} project`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Projects</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                resetForm()
                setCurrentProject(null)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>
                {currentProject ? 'Edit Project' : 'Add Project'}
              </DialogTitle>
              <DialogDescription>
                {currentProject 
                  ? 'Update your project details below' 
                  : 'Add a new project to showcase your work'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <FolderGit className="h-3.5 w-3.5" />
                        Project Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="E-commerce Website" {...field} />
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
                          />
                        </FormControl>
                        <FormDescription>
                          Leave empty if ongoing
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Project URL
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/yourusername/project" {...field} />
                      </FormControl>
                      <FormDescription>
                        GitHub repository or live demo URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5">
                        <FolderGit className="h-3.5 w-3.5" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your project, its purpose, and your role..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel className="flex items-center gap-1.5">
                    <Code className="h-3.5 w-3.5" />
                    Technologies Used
                  </FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.watch('technologies')?.map((tech, index) => (
                      <div key={index} className="bg-muted text-sm px-2 py-1 rounded-md flex items-center gap-1">
                        {tech}
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          className="h-4 w-4 rounded-full"
                          onClick={() => removeTechnology(tech)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Add a technology (e.g., React)" 
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTechnology()
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      onClick={addTechnology}
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : currentProject ? 'Update Project' : 'Add Project'}
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
              This action cannot be undone. This will permanently delete this project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Projects list */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No projects added yet. Click &quot;Add Project&quot; to get started.
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" className="space-y-2">
          {projects.map((project) => (
            <AccordionItem key={project.id} value={project.id || ''} className="border rounded-md">
              <div className="flex items-center justify-between px-4">
                <AccordionTrigger className="py-2 hover:no-underline">
                  <div className="flex flex-col items-start text-left">
                    <div className="font-medium">{project.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {project.startDate} - {project.endDate || 'Present'}
                    </div>
                  </div>
                </AccordionTrigger>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEdit(project)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => {
                      e.stopPropagation()
                      if (project.id) {
                        handleDelete(project.id)
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <AccordionContent className="px-4 pb-4">
                <p className="text-sm mb-2">{project.description}</p>
                
                {project.url && (
                  <div className="flex items-center gap-1 text-sm text-primary mb-2">
                    <LinkIcon className="h-3 w-3" />
                    <a href={project.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {project.url}
                    </a>
                  </div>
                )}
                
                {project.technologies && project.technologies.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-muted-foreground mb-1">Technologies:</div>
                    <div className="flex flex-wrap gap-1">
                      {project.technologies.map((tech, index) => (
                        <span key={index} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
} 