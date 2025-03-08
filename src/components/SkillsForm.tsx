'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { SkillCategory, skillCategorySchema } from '@/types'
import { Input } from '@/components/ui/input'
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
  CardHeader, 
  CardTitle 
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
  Plus, 
  X, 
  Edit, 
  Trash2, 
  Loader2, 
  Lightbulb 
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useCVStore } from '@/store'
import { v4 as uuidv4 } from 'uuid'

export function SkillsForm() {
  // Get skill categories and actions from Zustand store
  const { 
    skillCategories, 
    addSkillCategory, 
    updateSkillCategory, 
    removeSkillCategory,
    addSkillToCategory,
    removeSkillFromCategory
  } = useCVStore()
  
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentCategoryId, setCurrentCategoryId] = useState<string | null>(null)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [newSkill, setNewSkill] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)
  
  const form = useForm<SkillCategory>({
    resolver: zodResolver(skillCategorySchema),
    defaultValues: {
      id: '',
      name: '',
      skills: []
    }
  })

  const handleAddCategory = async (data: SkillCategory) => {
    try {
      setIsSubmitting(true)
      
      // Add ID if it's a new category
      if (!data.id) {
        data.id = uuidv4();
      }
      
      if (currentCategoryId) {
        // Update existing category
        updateSkillCategory(currentCategoryId, data)
        toast.success('Category updated successfully')
      } else {
        // Add new category
        addSkillCategory(data)
        setSelectedCategoryId(data.id || '')
        toast.success('Category added successfully')
      }
      
      // Reset form and close dialog
      form.reset()
      setIsDialogOpen(false)
      setCurrentCategoryId(null)
    } catch (error) {
      console.error('Error saving skill category:', error)
      toast.error(`Failed to ${currentCategoryId ? 'update' : 'add'} category`)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteCategory = (id: string) => {
    setCategoryToDelete(id)
    setDeleteDialogOpen(true)
  }
  
  const confirmDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        // Remove from Zustand store
        removeSkillCategory(categoryToDelete)
        
        // Update selected category if needed
        if (selectedCategoryId === categoryToDelete) {
          setSelectedCategoryId(skillCategories[0]?.id || '')
        }
        
        toast.success('Category deleted successfully')
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Failed to delete category')
      } finally {
        setDeleteDialogOpen(false)
        setCategoryToDelete(null)
      }
    }
  }
  
  const handleAddSkill = async (categoryId: string) => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill')
      return
    }
    
    try {
      // Add skill to category in Zustand store
      addSkillToCategory(categoryId, newSkill.trim())
      
      // Reset input
      setNewSkill('')
      toast.success('Skill added successfully')
    } catch (error) {
      console.error('Error adding skill:', error)
      toast.error('Failed to add skill')
    }
  }
  
  const handleRemoveSkill = async (categoryId: string, skill: string) => {
    try {
      // Remove skill from category in Zustand store
      removeSkillFromCategory(categoryId, skill)
      
      toast.success('Skill removed successfully')
    } catch (error) {
      console.error('Error removing skill:', error)
      toast.error('Failed to remove skill')
    }
  }
  
  const handleEditCategory = (category: SkillCategory) => {
    if (category.id) {
      setCurrentCategoryId(category.id)
    }
    
    // Set form values
    form.reset(category)
    
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Skills
          </h3>
          <p className="text-sm text-muted-foreground">
            Add categories of skills to showcase your expertise
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => {
                form.reset({
                  id: '',
                  name: '',
                  skills: []
                })
                setCurrentCategoryId(null)
              }}
            >
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {currentCategoryId ? 'Edit Skill Category' : 'Add Skill Category'}
              </DialogTitle>
              <DialogDescription>
                {currentCategoryId 
                  ? 'Update your skill category details below' 
                  : 'Add a new skill category to organize your skills'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddCategory)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Programming Languages" {...field} />
                      </FormControl>
                      <FormDescription>
                        Name for this group of related skills
                      </FormDescription>
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
                    ) : (
                      <>Save</>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Confirmation dialog for deleting a category */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the skill category and all skills within it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteCategory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {skillCategories.length === 0 ? (
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t added any skill categories yet
            </p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => {
                form.reset({
                  id: '',
                  name: '',
                  skills: []
                })
                setCurrentCategoryId(null)
                setIsDialogOpen(true)
              }}
            >
              <Plus className="h-4 w-4" />
              Add First Category
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {skillCategories.map((category) => (
            <Card key={category.id} className="bg-card">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{category.name}</CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit category</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteCategory(category.id || '')}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete category</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {category.skills.map((skill, index) => (
                      <Badge key={`${category.id}-${index}`} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1 hover:bg-transparent text-muted-foreground"
                          onClick={() => handleRemoveSkill(category.id || '', skill)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove skill</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add a skill..."
                      value={selectedCategoryId === category.id ? newSkill : ''}
                      onChange={(e) => {
                        setSelectedCategoryId(category.id || '')
                        setNewSkill(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddSkill(category.id || '')
                        }
                      }}
                      className="h-8 text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => handleAddSkill(category.id || '')}
                    >
                      <Plus className="h-3 w-3" />
                      <span className="sr-only">Add skill</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 