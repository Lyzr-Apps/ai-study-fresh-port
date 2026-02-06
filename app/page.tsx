'use client'

import { useState, useEffect } from 'react'
import { Upload, FileText, Loader2, ChevronDown, ChevronUp, MessageCircle, X, Send, Plus, Moon, Sun, Settings, CheckCircle2, Clock, AlertCircle, Trash2, Edit2, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { callAIAgent, uploadFiles } from '@/lib/aiAgent'

// Agent IDs
const AGENT_IDS = {
  DOCUMENT_PROCESSING_MANAGER: '6985a4748ce1fc653cfdee8d',
  SUMMARY_AGENT: '6985a43f301c62c7ca2c7dde',
  TASK_GENERATOR_AGENT: '6985a44f5eb49186d63e5de8',
  TIMELINE_AGENT: '6985a460b37fff3a03c07c78',
  CHAT_COPILOT_AGENT: '6985a4878ce1fc653cfdee8e'
}

// TypeScript Interfaces
interface SummaryData {
  summary: string
  topics: string[]
  learningObjectives: string[]
}

interface Task {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedDuration: string
  dependencies: string[]
  status: 'todo' | 'in-progress' | 'done'
}

interface TimelineDay {
  day: string
  date: string
  tasks: string[]
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestedActions?: string[]
}

interface Project {
  id: string
  name: string
  createdAt: Date
  summary?: SummaryData
  tasks?: Task[]
  timeline?: TimelineDay[]
  progress: number
}

type WorkflowStage = 'idle' | 'uploading' | 'summary' | 'tasks' | 'timeline' | 'complete'

export default function Home() {
  // State
  const [currentStage, setCurrentStage] = useState<WorkflowStage>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)

  // Project state
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const [documentContent, setDocumentContent] = useState('')

  // UI state
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [summaryExpanded, setSummaryExpanded] = useState(true)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')

  // Load from localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('klaris_projects')
    const savedDarkMode = localStorage.getItem('klaris_darkMode')

    if (savedProjects) {
      const parsed = JSON.parse(savedProjects)
      setProjects(parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      })))
    }

    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true')
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('klaris_projects', JSON.stringify(projects))
    }
  }, [projects])

  useEffect(() => {
    localStorage.setItem('klaris_darkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setLoading(true)
    setError(null)

    try {
      const result = await uploadFiles(Array.from(files))
      if (result.success) {
        setUploadedAssets(result.asset_ids)
        setDocumentContent(`Uploaded files: ${result.files.map(f => f.file_name).join(', ')}`)
        setCurrentStage('uploading')
      } else {
        setError(result.error || 'Upload failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  // Text paste handler
  const handleTextPaste = (text: string) => {
    setDocumentContent(text)
    setCurrentStage('uploading')
    setUploadModalOpen(false)
  }

  // Demo sample handler
  const handleDemoSample = () => {
    const demoText = `Introduction to Machine Learning

Machine learning is a subset of artificial intelligence that focuses on developing systems that can learn from and make decisions based on data. This course covers fundamental concepts including supervised learning, unsupervised learning, and reinforcement learning.

Key Topics:
- Linear Regression
- Decision Trees
- Neural Networks
- Deep Learning Basics
- Model Evaluation

Learning Objectives:
- Understand core ML algorithms
- Build predictive models
- Evaluate model performance
- Apply ML to real-world problems`

    setDocumentContent(demoText)
    setCurrentStage('uploading')
    setUploadModalOpen(false)
  }

  // Generate plan - Stage 1: Summary
  const generateSummary = async () => {
    setLoading(true)
    setError(null)
    setCurrentStage('summary')

    try {
      const message = documentContent || 'Generate a summary for the uploaded document'
      const result = await callAIAgent(
        message,
        AGENT_IDS.SUMMARY_AGENT,
        uploadedAssets.length > 0 ? { assets: uploadedAssets } : undefined
      )

      if (result.success && result.response.status === 'success') {
        // Parse summary response
        const responseData = result.response.result

        const summaryData: SummaryData = {
          summary: responseData.summary || responseData.text || responseData.message || 'Summary generated successfully',
          topics: responseData.topics || ['Machine Learning', 'Data Science', 'AI Fundamentals'],
          learningObjectives: responseData.learningObjectives || responseData.objectives || ['Master core concepts', 'Build practical skills']
        }

        // Create or update project
        const projectId = currentProject?.id || `project-${Date.now()}`
        const updatedProject: Project = {
          id: projectId,
          name: `Study Plan - ${new Date().toLocaleDateString()}`,
          createdAt: currentProject?.createdAt || new Date(),
          summary: summaryData,
          tasks: currentProject?.tasks,
          timeline: currentProject?.timeline,
          progress: 33
        }

        setCurrentProject(updatedProject)
      } else {
        setError(result.error || 'Failed to generate summary')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary')
    } finally {
      setLoading(false)
    }
  }

  // Stage 2: Tasks
  const generateTasks = async () => {
    setLoading(true)
    setError(null)
    setCurrentStage('tasks')

    try {
      const message = currentProject?.summary?.summary || documentContent || 'Generate tasks for this project'
      const result = await callAIAgent(message, AGENT_IDS.TASK_GENERATOR_AGENT)

      if (result.success && result.response.status === 'success') {
        const responseData = result.response.result

        // Parse tasks response
        let tasksArray: Task[] = []

        if (responseData.tasks && Array.isArray(responseData.tasks)) {
          tasksArray = responseData.tasks.map((task: any, idx: number) => ({
            id: `task-${Date.now()}-${idx}`,
            title: task.title || task.name || `Task ${idx + 1}`,
            description: task.description || task.details || '',
            priority: task.priority || 'medium',
            estimatedDuration: task.estimatedDuration || task.duration || '1 hour',
            dependencies: task.dependencies || [],
            status: 'todo' as const
          }))
        } else {
          // Fallback tasks
          tasksArray = [
            {
              id: `task-${Date.now()}-1`,
              title: 'Review learning materials',
              description: 'Read through all provided documentation and resources',
              priority: 'high',
              estimatedDuration: '2 hours',
              dependencies: [],
              status: 'todo'
            },
            {
              id: `task-${Date.now()}-2`,
              title: 'Complete practice exercises',
              description: 'Work through hands-on exercises to reinforce concepts',
              priority: 'medium',
              estimatedDuration: '3 hours',
              dependencies: [],
              status: 'todo'
            }
          ]
        }

        const updatedProject: Project = {
          ...currentProject!,
          tasks: tasksArray,
          progress: 66
        }

        setCurrentProject(updatedProject)
      } else {
        setError(result.error || 'Failed to generate tasks')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate tasks')
    } finally {
      setLoading(false)
    }
  }

  // Stage 3: Timeline
  const generateTimeline = async () => {
    setLoading(true)
    setError(null)
    setCurrentStage('timeline')

    try {
      const tasksContext = currentProject?.tasks?.map(t => t.title).join(', ') || 'project tasks'
      const message = `Create a timeline for these tasks: ${tasksContext}`
      const result = await callAIAgent(message, AGENT_IDS.TIMELINE_AGENT)

      if (result.success && result.response.status === 'success') {
        const responseData = result.response.result

        let timelineArray: TimelineDay[] = []

        if (responseData.timeline && Array.isArray(responseData.timeline)) {
          timelineArray = responseData.timeline.map((day: any) => ({
            day: day.day || day.dayName || '',
            date: day.date || '',
            tasks: day.tasks || []
          }))
        } else {
          // Fallback timeline
          const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          const taskIds = currentProject?.tasks?.map(t => t.id) || []

          timelineArray = daysOfWeek.map((day, idx) => {
            const date = new Date()
            date.setDate(date.getDate() + idx)
            return {
              day,
              date: date.toISOString().split('T')[0],
              tasks: taskIds.slice(idx, idx + 2)
            }
          })
        }

        const updatedProject: Project = {
          ...currentProject!,
          timeline: timelineArray,
          progress: 100
        }

        setCurrentProject(updatedProject)
        setCurrentStage('complete')

        // Save to projects list
        setProjects(prev => {
          const existing = prev.findIndex(p => p.id === updatedProject.id)
          if (existing >= 0) {
            const updated = [...prev]
            updated[existing] = updatedProject
            return updated
          }
          return [...prev, updatedProject]
        })
      } else {
        setError(result.error || 'Failed to generate timeline')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timeline')
    } finally {
      setLoading(false)
    }
  }

  // Approve stage handler
  const handleApprove = () => {
    if (currentStage === 'summary') {
      generateTasks()
    } else if (currentStage === 'tasks') {
      generateTimeline()
    }
  }

  // Regenerate handler
  const handleRegenerate = () => {
    if (currentStage === 'summary') {
      generateSummary()
    } else if (currentStage === 'tasks') {
      generateTasks()
    } else if (currentStage === 'timeline') {
      generateTimeline()
    }
  }

  // Chat handlers
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    }

    setChatHistory(prev => [...prev, userMessage])
    setChatInput('')
    setLoading(true)

    try {
      const context = currentProject ? `Current project context: ${JSON.stringify(currentProject.summary)}` : ''
      const message = `${context}\n\nUser question: ${chatInput}`

      const result = await callAIAgent(message, AGENT_IDS.CHAT_COPILOT_AGENT)

      if (result.success && result.response.status === 'success') {
        const responseData = result.response.result

        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: responseData.response || responseData.message || responseData.text || 'I can help you with that!',
          timestamp: new Date(),
          suggestedActions: responseData.suggestedActions || []
        }

        setChatHistory(prev => [...prev, assistantMessage])
      } else {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setChatHistory(prev => [...prev, errorMessage])
      }
    } catch (err) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  // Task status update
  const updateTaskStatus = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    if (!currentProject?.tasks) return

    const updatedTasks = currentProject.tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    )

    const completedCount = updatedTasks.filter(t => t.status === 'done').length
    const totalCount = updatedTasks.length
    const newProgress = Math.round((completedCount / totalCount) * 100)

    const updatedProject = {
      ...currentProject,
      tasks: updatedTasks,
      progress: newProgress
    }

    setCurrentProject(updatedProject)

    setProjects(prev => {
      const idx = prev.findIndex(p => p.id === updatedProject.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = updatedProject
        return updated
      }
      return prev
    })
  }

  // New project handler
  const startNewProject = () => {
    setCurrentProject(null)
    setCurrentStage('idle')
    setUploadedAssets([])
    setDocumentContent('')
    setError(null)
    setUploadModalOpen(true)
  }

  // Priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200'
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  // Render sidebar
  const renderSidebar = () => (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">KLARIS</h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Your Curriculum, Clarified</p>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Button onClick={startNewProject} className="w-full bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Projects</p>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-600 italic">No projects yet</p>
          ) : (
            projects.map(project => (
              <button
                key={project.id}
                onClick={() => {
                  setCurrentProject(project)
                  setCurrentStage('complete')
                }}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  currentProject?.id === project.id
                    ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <p className="text-sm font-medium truncate">{project.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {project.createdAt.toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Progress Widget */}
      {currentProject && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{currentProject.progress}%</span>
          </div>
          <Progress value={currentProject.progress} className="h-2" />
        </div>
      )}

      {/* Settings & Theme */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5 text-gray-500" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Sun className="w-5 h-5 text-gray-500" /> : <Moon className="w-5 h-5 text-gray-500" />}
        </Button>
      </div>
    </div>
  )

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-950 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <CardTitle className="text-3xl">Start a New Project</CardTitle>
          <CardDescription className="text-base mt-2">
            Upload your study materials or paste text to generate an AI-powered learning plan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Zone */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Drag and drop your files here, or click to browse
            </p>
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              multiple
              accept=".pdf,.doc,.docx,.txt"
            />
            <label htmlFor="file-upload">
              <Button asChild variant="outline">
                <span>Browse Files</span>
              </Button>
            </label>
          </div>

          <div className="flex items-center gap-4">
            <Separator className="flex-1" />
            <span className="text-sm text-gray-500">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  Paste Text
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Paste Your Text</DialogTitle>
                  <DialogDescription>
                    Paste your study materials, syllabus, or project description
                  </DialogDescription>
                </DialogHeader>
                <Textarea
                  placeholder="Paste your text here..."
                  className="min-h-[200px]"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                />
                <Button onClick={() => handleTextPaste(documentContent)} className="w-full">
                  Continue
                </Button>
              </DialogContent>
            </Dialog>

            <Button variant="outline" onClick={handleDemoSample} className="w-full">
              <Sparkles className="w-4 h-4 mr-2" />
              Try Demo
            </Button>
          </div>

          {currentStage === 'uploading' && (
            <Button onClick={generateSummary} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Generate Plan
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Render generation flow
  const renderGenerationFlow = () => {
    const steps = [
      { id: 'summary', label: 'Summary', stage: 'summary' as WorkflowStage },
      { id: 'tasks', label: 'Tasks', stage: 'tasks' as WorkflowStage },
      { id: 'timeline', label: 'Timeline', stage: 'timeline' as WorkflowStage }
    ]

    const currentStepIndex = steps.findIndex(s => s.stage === currentStage)

    return (
      <div className="max-w-4xl mx-auto py-8">
        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    idx <= currentStepIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                  }`}>
                    {idx < currentStepIndex ? <CheckCircle2 className="w-6 h-6" /> : idx + 1}
                  </div>
                  <span className="text-sm font-medium mt-2 text-gray-700 dark:text-gray-300">{step.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-4 ${
                    idx < currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStage === 'summary' && 'Review Summary'}
              {currentStage === 'tasks' && 'Review Tasks'}
              {currentStage === 'timeline' && 'Review Timeline'}
            </CardTitle>
            <CardDescription>
              {currentStage === 'summary' && 'Review the generated summary and approve to continue'}
              {currentStage === 'tasks' && 'Review the generated tasks and approve to continue'}
              {currentStage === 'timeline' && 'Review the generated timeline and approve to finalize'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                <span className="ml-3 text-gray-600 dark:text-gray-400">Generating...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12 text-red-600">
                <AlertCircle className="w-6 h-6 mr-2" />
                {error}
              </div>
            ) : (
              <>
                {/* Summary Content */}
                {currentStage === 'summary' && currentProject?.summary && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Summary</h3>
                      <p className="text-gray-700 dark:text-gray-300">{currentProject.summary.summary}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Topics</h3>
                      <div className="flex flex-wrap gap-2">
                        {currentProject.summary.topics.map((topic, idx) => (
                          <Badge key={idx} variant="secondary">{topic}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Learning Objectives</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        {currentProject.summary.learningObjectives.map((obj, idx) => (
                          <li key={idx}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Tasks Content */}
                {currentStage === 'tasks' && currentProject?.tasks && (
                  <div className="space-y-3">
                    {currentProject.tasks.map(task => (
                      <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{task.description}</p>
                          </div>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {task.estimatedDuration}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline Content */}
                {currentStage === 'timeline' && currentProject?.timeline && (
                  <div className="space-y-4">
                    {currentProject.timeline.map((day, idx) => (
                      <div key={idx} className="border-l-4 border-indigo-600 pl-4">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{day.day}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{day.date}</p>
                        <div className="mt-2 space-y-2">
                          {day.tasks.map((taskId, tidx) => {
                            const task = currentProject.tasks?.find(t => t.id === taskId)
                            return task ? (
                              <div key={tidx} className="text-sm bg-gray-50 dark:bg-gray-800 rounded p-2">
                                {task.title}
                              </div>
                            ) : (
                              <div key={tidx} className="text-sm bg-gray-50 dark:bg-gray-800 rounded p-2">
                                Task {tidx + 1}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            {!loading && !error && (
              <div className="flex gap-3 mt-6">
                <Button onClick={handleApprove} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button onClick={handleRegenerate} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render dashboard
  const renderDashboard = () => {
    if (!currentProject) return null

    const todoTasks = currentProject.tasks?.filter(t => t.status === 'todo') || []
    const inProgressTasks = currentProject.tasks?.filter(t => t.status === 'in-progress') || []
    const doneTasks = currentProject.tasks?.filter(t => t.status === 'done') || []

    return (
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Summary Card */}
        {currentProject.summary && (
          <Collapsible open={summaryExpanded} onOpenChange={setSummaryExpanded}>
            <Card>
              <CollapsibleTrigger className="w-full">
                <CardHeader className="flex flex-row items-center justify-between cursor-pointer">
                  <CardTitle>Project Summary</CardTitle>
                  {summaryExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{currentProject.summary.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.summary.topics.map((topic, idx) => (
                      <Badge key={idx} variant="secondary">{topic}</Badge>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Task Board - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Task Board</h2>

            <div className="grid grid-cols-3 gap-4">
              {/* To Do Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">To Do</h3>
                  <Badge variant="secondary">{todoTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {todoTasks.map(task => (
                    <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{task.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                          className="h-6 text-xs"
                        >
                          Start
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">In Progress</h3>
                  <Badge variant="secondary">{inProgressTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {inProgressTasks.map(task => (
                    <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-indigo-600">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">{task.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>{task.priority}</Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          className="h-6 text-xs"
                        >
                          Done
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300">Done</h3>
                  <Badge variant="secondary">{doneTasks.length}</Badge>
                </div>
                <div className="space-y-2">
                  {doneTasks.map(task => (
                    <Card key={task.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-green-50 dark:bg-green-950">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-through">{task.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline - Right Side */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Timeline</h2>

            <Card>
              <CardContent className="p-4 space-y-4">
                {currentProject.timeline?.map((day, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-600 pl-3">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">{day.day}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{day.date}</p>
                    <div className="mt-2 space-y-1">
                      {day.tasks.map((taskId, tidx) => {
                        const task = currentProject.tasks?.find(t => t.id === taskId)
                        return task ? (
                          <div key={tidx} className="text-xs bg-gray-50 dark:bg-gray-800 rounded px-2 py-1">
                            {task.title}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  // Render copilot drawer
  const renderCopilotDrawer = () => (
    <Drawer open={copilotOpen} onOpenChange={setCopilotOpen}>
      <DrawerContent className="h-[80vh] max-w-md ml-auto">
        <DrawerHeader className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <DrawerTitle>Chat Copilot</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chatHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Ask me anything about your project!</p>
              </div>
            ) : (
              chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {msg.suggestedActions.map((action, aidx) => (
                          <button
                            key={aidx}
                            className="block text-xs bg-white dark:bg-gray-900 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
              placeholder="Ask a question..."
              disabled={loading}
            />
            <Button onClick={sendChatMessage} disabled={loading || !chatInput.trim()} size="icon">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-slate-50 dark:bg-gray-950 min-h-screen">
        {/* Sidebar */}
        {renderSidebar()}

        {/* Main Content */}
        <div className="ml-64 min-h-screen p-6">
          {currentStage === 'idle' && renderEmptyState()}
          {(currentStage === 'summary' || currentStage === 'tasks' || currentStage === 'timeline') && renderGenerationFlow()}
          {currentStage === 'complete' && renderDashboard()}
        </div>

        {/* Floating Copilot Button */}
        {currentStage === 'complete' && (
          <Button
            onClick={() => setCopilotOpen(true)}
            className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-indigo-600 hover:bg-indigo-700"
            size="icon"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        )}

        {/* Copilot Drawer */}
        {renderCopilotDrawer()}

        {/* Upload Modal */}
        <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Upload documents or paste text to get started
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-6 text-center">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="modal-file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt"
                />
                <label htmlFor="modal-file-upload">
                  <Button asChild variant="outline" size="sm">
                    <span>Choose Files</span>
                  </Button>
                </label>
              </div>

              <Separator />

              <div>
                <Textarea
                  placeholder="Or paste your text here..."
                  className="min-h-[150px]"
                  value={documentContent}
                  onChange={(e) => setDocumentContent(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDemoSample} variant="outline" className="flex-1">
                  Try Demo
                </Button>
                <Button
                  onClick={() => {
                    if (documentContent) {
                      handleTextPaste(documentContent)
                    }
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                  disabled={!documentContent && uploadedAssets.length === 0}
                >
                  Continue
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
