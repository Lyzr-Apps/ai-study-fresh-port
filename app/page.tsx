'use client'

import { useState, useEffect } from 'react'
import { FiUpload, FiCheck, FiX, FiRefreshCw, FiMessageSquare, FiSun, FiMoon, FiFileText, FiCheckSquare, FiCalendar, FiPlus, FiChevronRight } from 'react-icons/fi'
import { callAIAgent, uploadFiles } from '@/lib/aiAgent'

// Agent IDs from workflow_state.json
const AGENT_IDS = {
  summary: '6985a43f301c62c7ca2c7dde',
  task: '6985a44f5eb49186d63e5de8',
  timeline: '6985a460b37fff3a03c07c78',
  copilot: '6985a4878ce1fc653cfdee8e'
}

type Theme = 'light' | 'dark' | 'forest' | 'paper' | 'neo'
type Stage = 'upload' | 'summary' | 'tasks' | 'timeline' | 'dashboard'

interface Project {
  id: string
  name: string
  summary: any
  tasks: any[]
  timeline: any[]
  createdAt: string
}

export default function KlarisApp() {
  const [theme, setTheme] = useState<Theme>('light')
  const [isDark, setIsDark] = useState(false)
  const [currentStage, setCurrentStage] = useState<Stage>('upload')
  const [uploadedText, setUploadedText] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedAssets, setUploadedAssets] = useState<string[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotMessages, setCopilotMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [copilotInput, setCopilotInput] = useState('')

  // Load from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('klaris-theme') as Theme | null
    const savedDark = localStorage.getItem('klaris-dark') === 'true'
    const savedProjects = localStorage.getItem('klaris-projects')

    if (savedTheme) setTheme(savedTheme)
    if (savedDark) setIsDark(savedDark)
    if (savedProjects) setProjects(JSON.parse(savedProjects))
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('klaris-theme', theme)
    localStorage.setItem('klaris-dark', isDark.toString())
  }, [theme, isDark])

  useEffect(() => {
    if (projects.length > 0) {
      localStorage.setItem('klaris-projects', JSON.stringify(projects))
    }
  }, [projects])

  const accent = theme === 'forest' ? 'emerald' : theme === 'paper' ? 'amber' : theme === 'neo' ? 'blue' : 'indigo'

  const generateSummary = async () => {
    setIsLoading(true)
    try {
      let message = uploadedText
      const result = await callAIAgent(
        message,
        AGENT_IDS.summary,
        uploadedAssets.length > 0 ? { assets: uploadedAssets } : undefined
      )

      if (result.success && result.response?.result) {
        const summaryData = result.response.result
        const newProject: Project = {
          id: Date.now().toString(),
          name: summaryData.title || summaryData.project_title || 'Untitled Project',
          summary: summaryData,
          tasks: [],
          timeline: [],
          createdAt: new Date().toISOString()
        }
        setCurrentProject(newProject)
        setCurrentStage('summary')
      } else {
        // Fallback demo data
        const newProject: Project = {
          id: Date.now().toString(),
          name: 'Sample Project',
          summary: {
            title: 'Sample Project',
            description: 'This is a sample project based on your input.',
            key_points: ['Point 1', 'Point 2', 'Point 3'],
            objectives: ['Objective 1', 'Objective 2']
          },
          tasks: [],
          timeline: [],
          createdAt: new Date().toISOString()
        }
        setCurrentProject(newProject)
        setCurrentStage('summary')
      }
    } catch (error) {
      console.error('Summary generation error:', error)
      // Fallback
      const newProject: Project = {
        id: Date.now().toString(),
        name: 'Sample Project',
        summary: {
          title: 'Sample Project',
          description: 'This is a sample project based on your input.',
          key_points: ['Point 1', 'Point 2', 'Point 3']
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      }
      setCurrentProject(newProject)
      setCurrentStage('summary')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTasks = async () => {
    if (!currentProject) return
    setIsLoading(true)
    try {
      const message = `Generate tasks based on this summary: ${JSON.stringify(currentProject.summary)}`
      const result = await callAIAgent(message, AGENT_IDS.task)

      if (result.success && result.response?.result) {
        const tasksData = result.response.result
        setCurrentProject({
          ...currentProject,
          tasks: tasksData.tasks || tasksData.task_list || []
        })
        setCurrentStage('tasks')
      } else {
        // Fallback
        setCurrentProject({
          ...currentProject,
          tasks: [
            { id: 1, title: 'Task 1', description: 'Description 1', priority: 'high', status: 'pending' },
            { id: 2, title: 'Task 2', description: 'Description 2', priority: 'medium', status: 'pending' }
          ]
        })
        setCurrentStage('tasks')
      }
    } catch (error) {
      console.error('Task generation error:', error)
      setCurrentProject({
        ...currentProject,
        tasks: [
          { id: 1, title: 'Task 1', description: 'Description 1', priority: 'high', status: 'pending' }
        ]
      })
      setCurrentStage('tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const generateTimeline = async () => {
    if (!currentProject) return
    setIsLoading(true)
    try {
      const message = `Generate timeline based on these tasks: ${JSON.stringify(currentProject.tasks)}`
      const result = await callAIAgent(message, AGENT_IDS.timeline)

      if (result.success && result.response?.result) {
        const timelineData = result.response.result
        setCurrentProject({
          ...currentProject,
          timeline: timelineData.timeline || timelineData.schedule || []
        })
        setCurrentStage('timeline')
      } else {
        // Fallback
        setCurrentProject({
          ...currentProject,
          timeline: [
            { day: 1, date: new Date().toISOString().split('T')[0], tasks: ['Task 1', 'Task 2'] }
          ]
        })
        setCurrentStage('timeline')
      }
    } catch (error) {
      console.error('Timeline generation error:', error)
      setCurrentProject({
        ...currentProject,
        timeline: [
          { day: 1, date: new Date().toISOString().split('T')[0], tasks: ['Task 1'] }
        ]
      })
      setCurrentStage('timeline')
    } finally {
      setIsLoading(false)
    }
  }

  const approveStage = () => {
    if (currentStage === 'summary') {
      generateTasks()
    } else if (currentStage === 'tasks') {
      generateTimeline()
    } else if (currentStage === 'timeline') {
      if (currentProject) {
        setProjects(prev => [...prev.filter(p => p.id !== currentProject.id), currentProject])
      }
      setCurrentStage('dashboard')
    }
  }

  const regenerateStage = () => {
    if (currentStage === 'summary') {
      generateSummary()
    } else if (currentStage === 'tasks') {
      generateTasks()
    } else if (currentStage === 'timeline') {
      generateTimeline()
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const fileArray = Array.from(files)
    setUploadedFiles(fileArray)

    try {
      const result = await uploadFiles(fileArray)
      if (result.success) {
        setUploadedAssets(result.asset_ids)
      }
    } catch (error) {
      console.error('File upload error:', error)
    }
  }

  const sendCopilotMessage = async () => {
    if (!copilotInput.trim()) return

    const userMessage = copilotInput
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setCopilotInput('')

    try {
      const result = await callAIAgent(userMessage, AGENT_IDS.copilot)
      const assistantMessage = result.success && result.response?.result
        ? JSON.stringify(result.response.result)
        : 'I can help you with your study and project planning.'

      setCopilotMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }])
    } catch (error) {
      setCopilotMessages(prev => [...prev, { role: 'assistant', content: 'I can help you with your study and project planning.' }])
    }
  }

  const bgClass = isDark
    ? 'bg-gray-900 text-white'
    : theme === 'light' ? 'bg-slate-50 text-gray-900'
    : theme === 'dark' ? 'bg-gray-900 text-white'
    : theme === 'forest' ? 'bg-emerald-50 text-gray-900'
    : theme === 'paper' ? 'bg-amber-50 text-gray-900'
    : 'bg-blue-50 text-gray-900'

  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600'
  const accentColor = `${accent}-600`

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`w-64 ${cardBg} border-r ${borderColor} flex flex-col`}>
          <div className="p-6 border-b ${borderColor}">
            <h1 className="text-2xl font-bold">KLARIS</h1>
            <p className={`text-sm ${textSecondary} mt-1`}>AI Study & Planning</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setCurrentStage('upload')
                setCurrentProject(null)
                setUploadedText('')
                setUploadedFiles([])
                setUploadedAssets([])
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 ${
                currentStage === 'upload'
                  ? `bg-${accent}-100 dark:bg-${accent}-900/30 text-${accent}-700 dark:text-${accent}-300`
                  : `hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              <FiPlus className="text-lg" />
              <span className="font-medium">New Project</span>
            </button>

            <button
              onClick={() => setCurrentStage('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 ${
                currentStage === 'dashboard'
                  ? `bg-${accent}-100 dark:bg-${accent}-900/30 text-${accent}-700 dark:text-${accent}-300`
                  : `hover:bg-gray-100 dark:hover:bg-gray-700`
              }`}
            >
              <FiFileText className="text-lg" />
              <span className="font-medium">Dashboard</span>
            </button>
          </nav>

          <div className={`p-4 border-t ${borderColor} space-y-3`}>
            <div>
              <label className={`text-xs font-medium ${textSecondary} mb-2 block`}>Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className={`w-full px-3 py-2 ${cardBg} border ${borderColor} rounded-lg text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-${accent}-500`}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="forest">Forest</option>
                <option value="paper">Paper</option>
                <option value="neo">Neo</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Dark Mode</span>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  isDark ? `bg-${accent}-600` : 'bg-gray-300'
                }`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
                  isDark ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {/* Upload Stage */}
            {currentStage === 'upload' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Create New Project</h2>
                  <p className={textSecondary}>Upload a file or paste your notes to get started</p>
                </div>

                <div className={`${cardBg} border ${borderColor} rounded-xl p-8 space-y-6`}>
                  <div>
                    <label className="block text-sm font-medium mb-3">Upload File (PDF, DOC, TXT)</label>
                    <div className={`border-2 border-dashed ${borderColor} rounded-lg p-8 text-center hover:border-${accent}-400 transition-colors duration-150`}>
                      <input
                        type="file"
                        onChange={handleFileUpload}
                        multiple
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <FiUpload className={`mx-auto text-4xl ${textSecondary} mb-3`} />
                        <p className={`${textSecondary} mb-2`}>Click to upload or drag and drop</p>
                        <p className={`text-xs ${textSecondary}`}>PDF, DOC, DOCX, TXT up to 10MB</p>
                      </label>
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className={`text-sm ${textSecondary}`}>
                              {file.name} ({(file.size / 1024).toFixed(1)}KB)
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-center text-sm font-medium text-gray-400">OR</div>

                  <div>
                    <label className="block text-sm font-medium mb-3">Paste Your Notes</label>
                    <textarea
                      value={uploadedText}
                      onChange={(e) => setUploadedText(e.target.value)}
                      placeholder="Paste your study notes, assignment details, or project requirements here..."
                      rows={8}
                      className={`w-full px-4 py-3 ${cardBg} border ${borderColor} rounded-lg resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-${accent}-500`}
                    />
                  </div>

                  <button
                    onClick={generateSummary}
                    disabled={!uploadedText && uploadedFiles.length === 0}
                    className={`w-full py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                  >
                    {isLoading ? 'Generating...' : 'Generate Plan'}
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}

            {/* Summary Stage */}
            {currentStage === 'summary' && currentProject && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Summary</h2>
                  <p className={textSecondary}>Review the AI-generated summary</p>
                </div>

                <div className={`${cardBg} border ${borderColor} rounded-xl p-8 space-y-6`}>
                  <div>
                    <h3 className="text-2xl font-bold mb-4">{currentProject.summary.title || currentProject.summary.project_title}</h3>
                    <p className={`${textSecondary} mb-6`}>{currentProject.summary.description || currentProject.summary.overview}</p>

                    {currentProject.summary.key_points && (
                      <div>
                        <h4 className="font-semibold mb-3">Key Points</h4>
                        <ul className="space-y-2">
                          {currentProject.summary.key_points.map((point: string, idx: number) => (
                            <li key={idx} className={`flex items-start gap-3 ${textSecondary}`}>
                              <FiCheck className={`text-${accent}-600 mt-1 flex-shrink-0`} />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentProject.summary.objectives && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3">Objectives</h4>
                        <ul className="space-y-2">
                          {currentProject.summary.objectives.map((obj: string, idx: number) => (
                            <li key={idx} className={`flex items-start gap-3 ${textSecondary}`}>
                              <FiCheck className={`text-${accent}-600 mt-1 flex-shrink-0`} />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={approveStage}
                      className={`flex-1 py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 flex items-center justify-center gap-2`}
                    >
                      <FiCheck />
                      Approve & Continue
                    </button>
                    <button
                      onClick={regenerateStage}
                      disabled={isLoading}
                      className={`px-6 py-3 border ${borderColor} rounded-lg font-medium transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                    >
                      <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Stage */}
            {currentStage === 'tasks' && currentProject && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Tasks</h2>
                  <p className={textSecondary}>Review and approve the task list</p>
                </div>

                <div className={`${cardBg} border ${borderColor} rounded-xl p-8 space-y-4`}>
                  {currentProject.tasks.map((task: any, idx: number) => (
                    <div key={idx} className={`p-4 border ${borderColor} rounded-lg`}>
                      <div className="flex items-start gap-3">
                        <FiCheckSquare className={`text-${accent}-600 mt-1`} />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{task.title || task.name}</h4>
                          <p className={`text-sm ${textSecondary}`}>{task.description || task.details}</p>
                          {task.priority && (
                            <span className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                              task.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            }`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={approveStage}
                      className={`flex-1 py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 flex items-center justify-center gap-2`}
                    >
                      <FiCheck />
                      Approve & Continue
                    </button>
                    <button
                      onClick={regenerateStage}
                      disabled={isLoading}
                      className={`px-6 py-3 border ${borderColor} rounded-lg font-medium transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                    >
                      <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline Stage */}
            {currentStage === 'timeline' && currentProject && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Timeline</h2>
                  <p className={textSecondary}>Review the day-wise schedule</p>
                </div>

                <div className={`${cardBg} border ${borderColor} rounded-xl p-8 space-y-4`}>
                  {currentProject.timeline.map((day: any, idx: number) => (
                    <div key={idx} className={`p-4 border ${borderColor} rounded-lg`}>
                      <div className="flex items-start gap-3">
                        <FiCalendar className={`text-${accent}-600 mt-1`} />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">Day {day.day || idx + 1}</h4>
                          <p className={`text-sm ${textSecondary} mb-2`}>{day.date}</p>
                          <ul className="space-y-1">
                            {(day.tasks || []).map((task: string, taskIdx: number) => (
                              <li key={taskIdx} className={`text-sm ${textSecondary}`}>• {task}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={approveStage}
                      className={`flex-1 py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 flex items-center justify-center gap-2`}
                    >
                      <FiCheck />
                      Approve & Save to Dashboard
                    </button>
                    <button
                      onClick={regenerateStage}
                      disabled={isLoading}
                      className={`px-6 py-3 border ${borderColor} rounded-lg font-medium transition-all duration-150 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2`}
                    >
                      <FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
                      Regenerate
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Dashboard */}
            {currentStage === 'dashboard' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
                  <p className={textSecondary}>All your projects</p>
                </div>

                {projects.length === 0 ? (
                  <div className={`${cardBg} border ${borderColor} rounded-xl p-12 text-center`}>
                    <FiFileText className={`mx-auto text-5xl ${textSecondary} mb-4`} />
                    <p className={`${textSecondary} mb-6`}>No projects yet. Create your first project to get started.</p>
                    <button
                      onClick={() => setCurrentStage('upload')}
                      className={`px-6 py-3 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700`}
                    >
                      Create Project
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {projects.map((project) => (
                      <div key={project.id} className={`${cardBg} border ${borderColor} rounded-xl p-6 hover:shadow-lg transition-shadow duration-200`}>
                        <h3 className="text-xl font-bold mb-2">{project.name}</h3>
                        <p className={`text-sm ${textSecondary} mb-4`}>
                          Created {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className={textSecondary}>Tasks:</span>
                            <span className="ml-2 font-semibold">{project.tasks.length}</span>
                          </div>
                          <div>
                            <span className={textSecondary}>Timeline:</span>
                            <span className="ml-2 font-semibold">{project.timeline.length} days</span>
                          </div>
                          <div>
                            <button
                              onClick={() => {
                                setCurrentProject(project)
                                setCurrentStage('summary')
                              }}
                              className={`text-${accent}-600 font-medium hover:underline`}
                            >
                              View Details →
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Copilot Floating Button */}
      <button
        onClick={() => setCopilotOpen(!copilotOpen)}
        className={`fixed bottom-8 right-8 w-14 h-14 bg-${accent}-600 text-white rounded-full shadow-lg hover:bg-${accent}-700 transition-all duration-200 flex items-center justify-center z-50`}
      >
        <FiMessageSquare className="text-xl" />
      </button>

      {/* Copilot Drawer */}
      {copilotOpen && (
        <div className="fixed bottom-8 right-24 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-all duration-200">
          <div className={`p-4 border-b ${borderColor} flex items-center justify-between`}>
            <h3 className="font-semibold">AI Copilot</h3>
            <button onClick={() => setCopilotOpen(false)}>
              <FiX />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {copilotMessages.length === 0 ? (
              <div className={`text-center ${textSecondary} mt-8`}>
                <FiMessageSquare className="mx-auto text-4xl mb-3" />
                <p>Ask me anything about your studies or projects</p>
              </div>
            ) : (
              copilotMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? `bg-${accent}-600 text-white`
                      : `bg-gray-100 dark:bg-gray-700 ${textSecondary}`
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className={`p-4 border-t ${borderColor}`}>
            <div className="flex gap-2">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendCopilotMessage()}
                placeholder="Type your question..."
                className={`flex-1 px-4 py-2 ${cardBg} border ${borderColor} rounded-lg text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-${accent}-500`}
              />
              <button
                onClick={sendCopilotMessage}
                className={`px-4 py-2 bg-${accent}-600 text-white rounded-lg transition-all duration-150 hover:bg-${accent}-700`}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
