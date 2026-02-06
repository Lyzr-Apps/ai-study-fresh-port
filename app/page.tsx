'use client'

import { useState, useEffect } from 'react'
import { FiUpload, FiCheck, FiX, FiRefreshCw, FiMessageSquare, FiSun, FiMoon, FiFileText, FiCheckSquare, FiCalendar, FiPlus, FiChevronRight } from 'react-icons/fi'

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
  const [summaryApproved, setSummaryApproved] = useState(false)
  const [tasksApproved, setTasksApproved] = useState(false)

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

  const accent = theme === 'forest' ? 'emerald' : theme === 'paper' ? 'amber' : theme === 'neo' ? 'blue' : 'emerald'

  const generateSummary = async () => {
    setIsLoading(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const inputText = uploadedText.toLowerCase()
    const isExam = inputText.includes('exam') || inputText.includes('test') || inputText.includes('study')
    const isProject = inputText.includes('project') || inputText.includes('assignment') || inputText.includes('research')
    const isCoding = inputText.includes('code') || inputText.includes('programming') || inputText.includes('development')

    let projectData: Project

    if (isExam) {
      projectData = {
        id: Date.now().toString(),
        name: 'Advanced Data Structures Final Exam Preparation',
        summary: {
          title: 'Advanced Data Structures Final Exam Preparation',
          description: 'Comprehensive preparation plan for the final exam covering trees, graphs, dynamic programming, and advanced algorithmic techniques. The exam will test both theoretical knowledge and practical implementation skills.',
          key_points: [
            'Review all tree data structures including BST, AVL, Red-Black, and B-Trees',
            'Master graph algorithms: DFS, BFS, Dijkstra, Bellman-Ford, and Floyd-Warshall',
            'Practice dynamic programming problems with memoization and tabulation',
            'Understand time and space complexity analysis for all algorithms',
            'Complete practice problems from previous years and mock tests'
          ],
          objectives: [
            'Achieve proficiency in implementing tree balancing algorithms',
            'Solve 50+ practice problems covering all exam topics',
            'Complete 3 full-length mock exams under timed conditions',
            'Review and understand all lecture notes and textbook chapters'
          ]
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      }
    } else if (isCoding) {
      projectData = {
        id: Date.now().toString(),
        name: 'E-Commerce Platform Development',
        summary: {
          title: 'E-Commerce Platform Development',
          description: 'Build a full-stack e-commerce platform with modern technologies including React, Node.js, and PostgreSQL. The platform will feature user authentication, product catalog, shopping cart, payment integration, and admin dashboard.',
          key_points: [
            'Implement secure user authentication with JWT and OAuth',
            'Design scalable database schema for products, orders, and users',
            'Integrate payment gateway (Stripe) for secure transactions',
            'Build responsive UI with React and Tailwind CSS',
            'Create comprehensive admin panel for inventory management',
            'Implement search and filtering functionality with ElasticSearch'
          ],
          objectives: [
            'Complete user authentication and authorization system',
            'Develop product catalog with categories and advanced search',
            'Integrate shopping cart and checkout flow with payment processing',
            'Build admin dashboard with analytics and reporting features',
            'Deploy to production with CI/CD pipeline'
          ]
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      }
    } else if (isProject) {
      projectData = {
        id: Date.now().toString(),
        name: 'Climate Change Impact Research Project',
        summary: {
          title: 'Climate Change Impact Research Project',
          description: 'Comprehensive research project analyzing the impact of climate change on coastal ecosystems. The project involves data collection, statistical analysis, literature review, and presentation of findings with policy recommendations.',
          key_points: [
            'Conduct extensive literature review of recent climate studies (2020-2025)',
            'Collect and analyze temperature and sea level data from coastal regions',
            'Study biodiversity changes in marine ecosystems over the past decade',
            'Perform statistical analysis using R and Python data science tools',
            'Interview environmental scientists and local community stakeholders',
            'Develop actionable policy recommendations based on findings'
          ],
          objectives: [
            'Complete comprehensive literature review of 50+ peer-reviewed papers',
            'Gather and analyze 5 years of environmental data from target regions',
            'Conduct 15+ expert interviews and community surveys',
            'Create data visualizations and interactive dashboards',
            'Write 25-page research paper with citations and recommendations',
            'Prepare presentation for academic conference submission'
          ]
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      }
    } else {
      projectData = {
        id: Date.now().toString(),
        name: 'Machine Learning Course Project',
        summary: {
          title: 'Machine Learning Course Project',
          description: 'Develop and train machine learning models to predict customer churn for a telecommunications company. The project includes data preprocessing, feature engineering, model selection, training, and evaluation with comprehensive documentation.',
          key_points: [
            'Clean and preprocess customer data from multiple sources',
            'Perform exploratory data analysis to identify key patterns',
            'Engineer features based on customer behavior and demographics',
            'Train and compare multiple classification models (Random Forest, XGBoost, Neural Networks)',
            'Optimize hyperparameters using cross-validation techniques',
            'Evaluate model performance using precision, recall, F1-score, and ROC-AUC'
          ],
          objectives: [
            'Achieve model accuracy above 85% on test dataset',
            'Identify top 10 features contributing to customer churn',
            'Create interactive dashboard for business stakeholders',
            'Document entire ML pipeline with Jupyter notebooks',
            'Present findings to class with actionable business insights'
          ]
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      }
    }

    setCurrentProject(projectData)
    setCurrentStage('summary')
    setIsLoading(false)
  }

  const generateTasks = async () => {
    if (!currentProject) return
    setIsLoading(true)
    setSummaryApproved(false)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const projectName = currentProject.name.toLowerCase()
    let tasks: any[]

    if (projectName.includes('exam') || projectName.includes('data structures')) {
      tasks = [
        {
          id: 1,
          title: 'Review Tree Data Structures',
          description: 'Study BST, AVL trees, Red-Black trees, and B-Trees. Understand insertion, deletion, and balancing mechanisms.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 2,
          title: 'Master Graph Algorithms',
          description: 'Practice implementation of DFS, BFS, Dijkstra, Bellman-Ford, Floyd-Warshall, and MST algorithms.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 10
        },
        {
          id: 3,
          title: 'Dynamic Programming Practice',
          description: 'Solve classic DP problems including knapsack, LCS, LIS, and matrix chain multiplication.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 12
        },
        {
          id: 4,
          title: 'Time Complexity Analysis',
          description: 'Review Big-O notation and analyze complexity of all major algorithms covered in the course.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 6
        },
        {
          id: 5,
          title: 'Practice Problems',
          description: 'Complete 50+ coding problems from LeetCode and previous exam papers.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 15
        },
        {
          id: 6,
          title: 'Mock Exams',
          description: 'Take 3 full-length mock exams under timed conditions and review mistakes.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 9
        },
        {
          id: 7,
          title: 'Review Lecture Notes',
          description: 'Go through all lecture slides and textbook chapters, create summary notes.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 8
        }
      ]
    } else if (projectName.includes('e-commerce') || projectName.includes('development')) {
      tasks = [
        {
          id: 1,
          title: 'Setup Project Structure',
          description: 'Initialize Next.js project with TypeScript, configure Tailwind CSS, setup folder structure and dependencies.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 4
        },
        {
          id: 2,
          title: 'Database Schema Design',
          description: 'Design PostgreSQL schema for users, products, orders, and reviews. Setup Prisma ORM.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 6
        },
        {
          id: 3,
          title: 'User Authentication System',
          description: 'Implement JWT-based authentication, OAuth integration, password reset, and email verification.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 10
        },
        {
          id: 4,
          title: 'Product Catalog UI',
          description: 'Build product listing, detail pages, categories, filters, and search functionality.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 12
        },
        {
          id: 5,
          title: 'Shopping Cart & Checkout',
          description: 'Implement cart management, checkout flow, address handling, and order summary.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 6,
          title: 'Payment Integration',
          description: 'Integrate Stripe for payment processing, handle webhooks, and implement order confirmation.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 7,
          title: 'Admin Dashboard',
          description: 'Create admin panel for product management, order tracking, and analytics dashboard.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 12
        },
        {
          id: 8,
          title: 'Search with ElasticSearch',
          description: 'Setup ElasticSearch, index products, implement advanced search and autocomplete.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 9,
          title: 'Testing & Deployment',
          description: 'Write unit tests, integration tests, setup CI/CD pipeline, and deploy to production.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 10
        }
      ]
    } else if (projectName.includes('climate') || projectName.includes('research')) {
      tasks = [
        {
          id: 1,
          title: 'Literature Review',
          description: 'Read and summarize 50+ peer-reviewed papers on climate change impacts (2020-2025).',
          priority: 'high',
          status: 'pending',
          estimated_hours: 20
        },
        {
          id: 2,
          title: 'Data Collection',
          description: 'Gather temperature, sea level, and biodiversity data from coastal regions (5-year span).',
          priority: 'high',
          status: 'pending',
          estimated_hours: 15
        },
        {
          id: 3,
          title: 'Data Cleaning & Preprocessing',
          description: 'Clean datasets, handle missing values, normalize data using Python pandas.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 10
        },
        {
          id: 4,
          title: 'Statistical Analysis',
          description: 'Perform correlation analysis, regression modeling, and hypothesis testing using R.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 12
        },
        {
          id: 5,
          title: 'Expert Interviews',
          description: 'Conduct 15+ interviews with environmental scientists and community stakeholders.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 12
        },
        {
          id: 6,
          title: 'Data Visualization',
          description: 'Create charts, graphs, and interactive dashboards using Plotly and Tableau.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 7,
          title: 'Write Research Paper',
          description: 'Draft 25-page research paper with introduction, methodology, findings, and recommendations.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 20
        },
        {
          id: 8,
          title: 'Prepare Presentation',
          description: 'Create presentation slides and practice delivery for academic conference.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 6
        }
      ]
    } else {
      tasks = [
        {
          id: 1,
          title: 'Data Collection & Preprocessing',
          description: 'Gather customer data, clean missing values, handle outliers, and normalize features.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 2,
          title: 'Exploratory Data Analysis',
          description: 'Analyze data distributions, correlations, and identify patterns using pandas and seaborn.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 6
        },
        {
          id: 3,
          title: 'Feature Engineering',
          description: 'Create new features from customer behavior, demographics, and transaction history.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 4,
          title: 'Train Random Forest Model',
          description: 'Build and train Random Forest classifier, tune hyperparameters with GridSearchCV.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 6
        },
        {
          id: 5,
          title: 'Train XGBoost Model',
          description: 'Implement XGBoost classifier, optimize parameters, and compare with Random Forest.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 6
        },
        {
          id: 6,
          title: 'Build Neural Network',
          description: 'Design and train neural network using TensorFlow/Keras, experiment with architectures.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 7,
          title: 'Model Evaluation',
          description: 'Evaluate all models using accuracy, precision, recall, F1-score, and ROC-AUC metrics.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 5
        },
        {
          id: 8,
          title: 'Feature Importance Analysis',
          description: 'Identify top 10 features contributing to churn using SHAP values and feature importance.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 4
        },
        {
          id: 9,
          title: 'Create Dashboard',
          description: 'Build interactive Streamlit dashboard for stakeholders to explore predictions and insights.',
          priority: 'medium',
          status: 'pending',
          estimated_hours: 8
        },
        {
          id: 10,
          title: 'Documentation & Presentation',
          description: 'Document ML pipeline in Jupyter notebooks and prepare class presentation.',
          priority: 'high',
          status: 'pending',
          estimated_hours: 6
        }
      ]
    }

    setCurrentProject({
      ...currentProject,
      tasks
    })
    setCurrentStage('tasks')
    setIsLoading(false)
  }

  const generateTimeline = async () => {
    if (!currentProject) return
    setIsLoading(true)
    setTasksApproved(false)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const tasks = currentProject.tasks
    const totalDays = Math.ceil(tasks.reduce((sum: number, task: any) => sum + (task.estimated_hours || 0), 0) / 6)

    let timeline: any[] = []
    let currentDay = 1
    let currentDayHours = 0
    let currentDayTasks: string[] = []
    const today = new Date()

    tasks.forEach((task: any, index: number) => {
      const taskHours = task.estimated_hours || 6

      if (currentDayHours + taskHours > 8 && currentDayTasks.length > 0) {
        const dayDate = new Date(today)
        dayDate.setDate(today.getDate() + currentDay - 1)

        timeline.push({
          day: currentDay,
          date: dayDate.toISOString().split('T')[0],
          tasks: [...currentDayTasks],
          total_hours: currentDayHours
        })

        currentDay++
        currentDayHours = 0
        currentDayTasks = []
      }

      currentDayTasks.push(task.title)
      currentDayHours += taskHours

      if (index === tasks.length - 1 && currentDayTasks.length > 0) {
        const dayDate = new Date(today)
        dayDate.setDate(today.getDate() + currentDay - 1)

        timeline.push({
          day: currentDay,
          date: dayDate.toISOString().split('T')[0],
          tasks: [...currentDayTasks],
          total_hours: currentDayHours
        })
      }
    })

    setCurrentProject({
      ...currentProject,
      timeline
    })
    setCurrentStage('timeline')
    setIsLoading(false)
  }

  const approveStage = () => {
    if (currentStage === 'summary') {
      setSummaryApproved(true)
    } else if (currentStage === 'tasks') {
      setTasksApproved(true)
    } else if (currentStage === 'timeline') {
      if (currentProject) {
        setProjects(prev => [...prev.filter(p => p.id !== currentProject.id), currentProject])
      }
      setCurrentStage('dashboard')
    }
  }

  const regenerateStage = () => {
    if (currentStage === 'summary') {
      setSummaryApproved(false)
      generateSummary()
    } else if (currentStage === 'tasks') {
      setTasksApproved(false)
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

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setUploadedText(text.substring(0, 5000))
    }

    if (fileArray[0]) {
      reader.readAsText(fileArray[0])
    }
  }

  const sendCopilotMessage = async () => {
    if (!copilotInput.trim()) return

    const userMessage = copilotInput
    setCopilotMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setCopilotInput('')

    await new Promise(resolve => setTimeout(resolve, 800))

    const lowerMessage = userMessage.toLowerCase()
    let response = ''

    if (lowerMessage.includes('help') || lowerMessage.includes('what can you do')) {
      response = "I can help you with study planning, project organization, task management, and timeline creation. Just describe your project or exam, and I'll help you create a structured plan."
    } else if (lowerMessage.includes('exam') || lowerMessage.includes('test')) {
      response = "For exam preparation, I recommend: 1) Create a study schedule covering all topics, 2) Break down complex subjects into smaller chunks, 3) Practice with mock tests, 4) Review regularly using spaced repetition. Would you like me to help create a study plan?"
    } else if (lowerMessage.includes('project') || lowerMessage.includes('assignment')) {
      response = "For project management, I suggest: 1) Define clear objectives and deliverables, 2) Break the project into manageable tasks, 3) Set realistic deadlines for each phase, 4) Track progress regularly. I can help you create a detailed project plan with tasks and timeline."
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('schedule')) {
      response = "I can create day-by-day schedules based on your tasks. Each timeline considers task complexity and estimated hours, ensuring you have a realistic plan without overloading any single day."
    } else if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      response = "I'll help you break down your project into actionable tasks with priorities, descriptions, and time estimates. This makes it easier to track progress and stay organized."
    } else if (lowerMessage.includes('how') || lowerMessage.includes('start')) {
      response = "Getting started is easy! Click 'New Project', upload your materials or paste your notes, and I'll analyze them to create a comprehensive plan with summary, tasks, and timeline. You can approve or regenerate each stage until it's perfect."
    } else {
      response = "I understand you're working on something interesting! Whether it's exam prep, a coding project, or research work, I can help you organize it into a clear plan. Try creating a new project and I'll guide you through the process."
    }

    setCopilotMessages(prev => [...prev, { role: 'assistant', content: response }])
  }

  const bgClass = isDark
    ? 'bg-gray-900 text-white'
    : theme === 'light' ? 'bg-gray-50 text-gray-900'
    : theme === 'dark' ? 'bg-gray-900 text-white'
    : theme === 'forest' ? 'bg-gray-50 text-gray-900'
    : theme === 'paper' ? 'bg-amber-50 text-gray-900'
    : 'bg-blue-50 text-gray-900'

  const sidebarBg = isDark ? 'bg-gray-800' : theme === 'forest' ? 'bg-gray-800' : 'bg-gray-800'
  const sidebarText = 'text-white'
  const cardBg = isDark ? 'bg-gray-800' : 'bg-white'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600'
  const accentColor = `${accent}-500`

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-200`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`w-64 ${sidebarBg} ${sidebarText} flex flex-col border-r border-gray-700`}>
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">KLARIS</h1>
            <p className="text-sm text-gray-400 mt-1">AI Study & Planning</p>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setCurrentStage('upload')
                setCurrentProject(null)
                setUploadedText('')
                setUploadedFiles([])
                setUploadedAssets([])
                setSummaryApproved(false)
                setTasksApproved(false)
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 ${
                currentStage === 'upload'
                  ? `bg-${accent}-500 text-white shadow-lg`
                  : `text-gray-300 hover:bg-gray-700`
              }`}
            >
              <FiPlus className="text-lg" />
              <span className="font-medium">New Project</span>
            </button>

            <button
              onClick={() => setCurrentStage('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 ${
                currentStage === 'dashboard'
                  ? `bg-${accent}-500 text-white shadow-lg`
                  : `text-gray-300 hover:bg-gray-700`
              }`}
            >
              <FiFileText className="text-lg" />
              <span className="font-medium">Dashboard</span>
            </button>
          </nav>

          <div className="p-4 border-t border-gray-700 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-2 block">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as Theme)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="forest">Forest</option>
                <option value="paper">Paper</option>
                <option value="neo">Neo</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300">Dark Mode</span>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`relative w-12 h-6 rounded-full transition-all duration-200 ${
                  isDark ? 'bg-emerald-500' : 'bg-gray-600'
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
                      placeholder="Example: I need to prepare for my Data Structures exam covering trees, graphs, and dynamic programming...&#10;&#10;Or: I'm building an e-commerce platform with React and Node.js...&#10;&#10;Or: I have a research project on climate change..."
                      rows={10}
                      className={`w-full px-4 py-3 ${cardBg} border ${borderColor} rounded-lg resize-none transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-${accent}-500`}
                    />
                    <p className={`text-xs ${textSecondary} mt-2`}>
                      Tip: Include keywords like "exam", "project", "assignment", or "research" for better results
                    </p>
                  </div>

                  {(!uploadedText && uploadedFiles.length === 0) && (
                    <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-center`}>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Please upload a file or paste your notes to continue
                      </p>
                    </div>
                  )}

                  <button
                    onClick={generateSummary}
                    disabled={!uploadedText && uploadedFiles.length === 0}
                    className={`w-full py-4 px-6 bg-${accent}-600 text-white rounded-lg font-semibold text-lg transition-all duration-150 hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                  >
                    {isLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Generate AI Plan
                        <FiChevronRight />
                      </>
                    )}
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

                  {!summaryApproved ? (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={approveStage}
                        className={`flex-1 py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 flex items-center justify-center gap-2`}
                      >
                        <FiCheck />
                        Approve Summary
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
                  ) : (
                    <div className="pt-4">
                      <div className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4 text-center`}>
                        <p className="text-sm text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
                          <FiCheck className="text-lg" />
                          Summary approved! Ready to generate tasks and to-dos.
                        </p>
                      </div>
                      <button
                        onClick={generateTasks}
                        disabled={isLoading}
                        className={`w-full py-4 px-6 bg-${accent}-600 text-white rounded-lg font-semibold text-lg transition-all duration-150 hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                      >
                        {isLoading ? (
                          <>
                            <FiRefreshCw className="animate-spin" />
                            Generating Tasks...
                          </>
                        ) : (
                          <>
                            <FiCheckSquare />
                            Generate Tasks & To-Dos
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tasks Stage */}
            {currentStage === 'tasks' && currentProject && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Tasks & To-Dos</h2>
                  <p className={textSecondary}>Review and approve the task list</p>
                </div>

                <div className={`${cardBg} border ${borderColor} rounded-xl p-8 space-y-4`}>
                  {currentProject.tasks.map((task: any, idx: number) => (
                    <div key={idx} className={`p-4 border ${borderColor} rounded-lg`}>
                      <div className="flex items-start gap-3">
                        <FiCheckSquare className={`text-${accent}-600 mt-1`} />
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold">{task.title || task.name}</h4>
                            {task.estimated_hours && (
                              <span className={`text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 ${textSecondary} ml-2 flex-shrink-0`}>
                                {task.estimated_hours}h
                              </span>
                            )}
                          </div>
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

                  {!tasksApproved ? (
                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={approveStage}
                        className={`flex-1 py-3 px-6 bg-${accent}-600 text-white rounded-lg font-medium transition-all duration-150 hover:bg-${accent}-700 flex items-center justify-center gap-2`}
                      >
                        <FiCheck />
                        Approve Tasks
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
                  ) : (
                    <div className="pt-4">
                      <div className={`p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4 text-center`}>
                        <p className="text-sm text-green-800 dark:text-green-200 flex items-center justify-center gap-2">
                          <FiCheck className="text-lg" />
                          Tasks approved! Ready to generate schedule.
                        </p>
                      </div>
                      <button
                        onClick={generateTimeline}
                        disabled={isLoading}
                        className={`w-full py-4 px-6 bg-${accent}-600 text-white rounded-lg font-semibold text-lg transition-all duration-150 hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl`}
                      >
                        {isLoading ? (
                          <>
                            <FiRefreshCw className="animate-spin" />
                            Generating Schedule...
                          </>
                        ) : (
                          <>
                            <FiCalendar />
                            Generate Schedule & Timeline
                          </>
                        )}
                      </button>
                    </div>
                  )}
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
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">Day {day.day || idx + 1}</h4>
                            {day.total_hours && (
                              <span className={`text-xs px-2 py-1 rounded bg-${accent}-100 dark:bg-${accent}-900/30 text-${accent}-700 dark:text-${accent}-300`}>
                                {day.total_hours}h
                              </span>
                            )}
                          </div>
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
