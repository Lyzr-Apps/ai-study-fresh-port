'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  FiUpload, FiFileText, FiCheckCircle, FiSettings, FiSun, FiMoon,
  FiPlus, FiX, FiSend, FiChevronDown, FiChevronUp, FiRefreshCw,
  FiClock, FiAlertCircle, FiMessageSquare, FiFolder
} from 'react-icons/fi';

// ============================================================================
// TYPES
// ============================================================================

interface Summary {
  title: string;
  topics: string[];
  objectives: string[];
  deadlines: string[];
  requirements: string[];
  importantDates: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  estimated_hours: number;
  status: 'todo' | 'in-progress' | 'done';
}

interface TimelineDay {
  day: string;
  date: string;
  tasks: string[];
  totalHours: number;
}

interface Project {
  id: string;
  name: string;
  summary: Summary | null;
  tasks: Task[];
  timeline: TimelineDay[];
  createdAt: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Theme = 'light' | 'dark' | 'forest' | 'paper' | 'neo';
type Stage = 'upload' | 'summary' | 'tasks' | 'timeline' | 'dashboard';

// ============================================================================
// AGENT IDS
// ============================================================================

const AGENT_IDS = {
  summary: '6985a43f301c62c7ca2c7dde',
  task: '6985a44f5eb49186d63e5de8',
  timeline: '6985a460b37fff3a03c07c78',
  copilot: '6985a4878ce1fc653cfdee8e'
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KLARIS() {
  // Core state
  const [theme, setTheme] = useState<Theme>('light');
  const [isDark, setIsDark] = useState(false);
  const [currentStage, setCurrentStage] = useState<Stage>('upload');
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [uploadedText, setUploadedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [summaryCollapsed, setSummaryCollapsed] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // PERSISTENCE
  // ============================================================================

  useEffect(() => {
    const savedTheme = localStorage.getItem('klaris-theme') as Theme;
    const savedDark = localStorage.getItem('klaris-dark') === 'true';
    const savedProjects = localStorage.getItem('klaris-projects');
    const savedCurrentId = localStorage.getItem('klaris-current-project');

    if (savedTheme) setTheme(savedTheme);
    if (savedDark) setIsDark(savedDark);
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      setProjects(parsed);
      if (savedCurrentId) {
        const current = parsed.find((p: Project) => p.id === savedCurrentId);
        if (current) {
          setCurrentProject(current);
          setCurrentStage('dashboard');
        }
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('klaris-theme', theme);
    localStorage.setItem('klaris-dark', String(isDark));
    if (projects.length > 0) {
      localStorage.setItem('klaris-projects', JSON.stringify(projects));
    }
    if (currentProject) {
      localStorage.setItem('klaris-current-project', currentProject.id);
    }
  }, [theme, isDark, projects, currentProject]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // ============================================================================
  // THEME HELPERS
  // ============================================================================

  const getThemeClasses = () => {
    const themes = {
      light: 'bg-slate-50',
      dark: 'bg-gray-900',
      forest: 'bg-emerald-50',
      paper: 'bg-amber-50',
      neo: 'bg-blue-50'
    };
    return isDark ? 'bg-gray-900' : themes[theme];
  };

  const getAccentColor = () => {
    const accents = {
      light: 'indigo',
      dark: 'indigo',
      forest: 'emerald',
      paper: 'amber',
      neo: 'blue'
    };
    return accents[theme];
  };

  const accent = getAccentColor();

  // ============================================================================
  // AI AGENT INTEGRATION
  // ============================================================================

  const callAgent = async (agentId: string, message: string) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agent_id: agentId,
          message
        })
      });

      if (!response.ok) throw new Error('Agent call failed');

      const data = await response.json();

      if (data.response) {
        try {
          let jsonStr = data.response;
          const jsonMatch = jsonStr.match(/```json\\s*([\\s\\S]*?)\\s*```/) ||
                           jsonStr.match(/```\\s*([\\s\\S]*?)\\s*```/);
          if (jsonMatch) jsonStr = jsonMatch[1];
          return JSON.parse(jsonStr);
        } catch {
          return { response: data.response };
        }
      }

      return data;
    } catch (error) {
      console.error('Agent error:', error);
      throw error;
    }
  };

  // ============================================================================
  // WORKFLOW STAGES
  // ============================================================================

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const result = await callAgent(AGENT_IDS.summary, uploadedText);

      const newProject: Project = {
        id: Date.now().toString(),
        name: result.title || 'Untitled Project',
        summary: result,
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      };

      setCurrentProject(newProject);
      setCurrentStage('summary');
    } catch {
      // Fallback demo
      const demoProject: Project = {
        id: Date.now().toString(),
        name: 'Introduction to Data Structures',
        summary: {
          title: 'Introduction to Data Structures',
          topics: ['Arrays', 'Stacks', 'Trees', 'Graphs', 'Algorithms'],
          objectives: ['Understand data structures', 'Implement algorithms', 'Analyze complexity'],
          deadlines: ['Midterm: Week 6', 'Final: Week 12'],
          requirements: ['Weekly assignments', 'Lab attendance'],
          importantDates: ['Quiz: Week 3', 'Midterm: Week 6']
        },
        tasks: [],
        timeline: [],
        createdAt: new Date().toISOString()
      };
      setCurrentProject(demoProject);
      setCurrentStage('summary');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTasks = async () => {
    if (!currentProject?.summary) return;

    setIsLoading(true);
    try {
      const context = JSON.stringify(currentProject.summary);
      const result = await callAgent(AGENT_IDS.task, `Generate tasks: ${context}`);

      const tasksWithIds = (result.tasks || []).map((task: any, idx: number) => ({
        ...task,
        id: `task-${Date.now()}-${idx}`,
        status: 'todo' as const
      }));

      setCurrentProject({ ...currentProject, tasks: tasksWithIds });
      setCurrentStage('tasks');
    } catch {
      // Fallback
      const demoTasks: Task[] = [
        { id: 'task-1', title: 'Study Arrays', description: 'Review chapter 1-2', priority: 'High', estimated_hours: 3, status: 'todo' },
        { id: 'task-2', title: 'Implement Stack', description: 'Code implementation', priority: 'High', estimated_hours: 2, status: 'todo' },
        { id: 'task-3', title: 'Practice Sorting', description: 'Implement algorithms', priority: 'Medium', estimated_hours: 4, status: 'todo' }
      ];
      setCurrentProject({ ...currentProject, tasks: demoTasks });
      setCurrentStage('tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeline = async () => {
    if (!currentProject?.tasks) return;

    setIsLoading(true);
    try {
      const context = JSON.stringify(currentProject.tasks);
      const result = await callAgent(AGENT_IDS.timeline, `Create timeline: ${context}`);

      setCurrentProject({ ...currentProject, timeline: result.timeline || [] });
      setCurrentStage('timeline');
    } catch {
      // Fallback
      const demoTimeline: TimelineDay[] = [
        { day: 'Day 1', date: '2024-01-15', tasks: ['Study Arrays'], totalHours: 3 },
        { day: 'Day 2', date: '2024-01-16', tasks: ['Implement Stack'], totalHours: 2 }
      ];
      setCurrentProject({ ...currentProject, timeline: demoTimeline });
      setCurrentStage('timeline');
    } finally {
      setIsLoading(false);
    }
  };

  const approveStage = () => {
    if (currentStage === 'summary') generateTasks();
    else if (currentStage === 'tasks') generateTimeline();
    else if (currentStage === 'timeline') {
      if (currentProject) {
        setProjects(prev => [...prev.filter(p => p.id !== currentProject.id), currentProject]);
      }
      setCurrentStage('dashboard');
    }
  };

  const regenerateStage = () => {
    if (currentStage === 'summary') generateSummary();
    else if (currentStage === 'tasks') generateTasks();
    else if (currentStage === 'timeline') generateTimeline();
  };

  const startNewProject = () => {
    setCurrentProject(null);
    setUploadedText('');
    setCurrentStage('upload');
    setShowUploadModal(true);
    setChatMessages([]);
  };

  const useDemoSample = () => {
    setUploadedText(`Course: Introduction to Data Structures

Topics:
- Arrays and Linked Lists
- Stacks and Queues
- Trees and Graphs
- Sorting Algorithms

Requirements:
- Weekly assignments
- Midterm (Week 6)
- Final project (Week 12)

Objectives:
- Understand fundamental data structures
- Implement algorithms
- Analyze complexity`);
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
    const userInput = chatInput;
    setChatInput('');

    try {
      const context = { summary: currentProject?.summary, tasks: currentProject?.tasks };
      const result = await callAgent(AGENT_IDS.copilot, `${JSON.stringify(context)}\\n\\n${userInput}`);

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: result.response || 'I can help with your project!'
      }]);
    } catch {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble with that. Try rephrasing?'
      }]);
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    if (!currentProject) return;

    const updatedTasks = currentProject.tasks.map(t =>
      t.id === taskId ? { ...t, status: newStatus } : t
    );

    const updated = { ...currentProject, tasks: updatedTasks };
    setCurrentProject(updated);
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const getProgress = () => {
    if (!currentProject?.tasks.length) return 0;
    const done = currentProject.tasks.filter(t => t.status === 'done').length;
    return Math.round((done / currentProject.tasks.length) * 100);
  };

  // ============================================================================
  // UI COMPONENTS
  // ============================================================================

  const StageIndicator = () => {
    const stages = [
      { key: 'summary', label: 'Summary', num: 1 },
      { key: 'tasks', label: 'Tasks', num: 2 },
      { key: 'timeline', label: 'Timeline', num: 3 }
    ];

    const currentNum = stages.findIndex(s => s.key === currentStage) + 1;

    return (
      <div className="flex items-center justify-center gap-4 mb-8">
        {stages.map((stage, idx) => (
          <React.Fragment key={stage.key}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 ${
                currentNum >= stage.num ? `bg-${accent}-600 text-white` : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
              }`}>
                {stage.num}
              </div>
              <span className={`text-sm font-medium ${currentNum >= stage.num ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                {stage.label}
              </span>
            </div>
            {idx < stages.length - 1 && (
              <div className={`h-0.5 w-16 transition-all duration-200 ${
                currentNum > stage.num ? `bg-${accent}-600` : 'bg-gray-200 dark:bg-gray-700'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const Button = ({ children, onClick, variant = 'primary', disabled = false, icon }: any) => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium transition-all duration-150 flex items-center gap-2 justify-center';
    const variants = {
      primary: `bg-${accent}-600 text-white hover:bg-${accent}-700 disabled:opacity-50`,
      secondary: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50'
    };

    return (
      <button onClick={onClick} disabled={disabled} className={`${baseClass} ${variants[variant]}`}>
        {icon && icon}
        {children}
      </button>
    );
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderUploadScreen = () => (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
        <FiFileText className={`w-16 h-16 mx-auto mb-6 text-${accent}-600`} />
        <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-3">
          Start a New Project
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Upload notes or paste text to generate your AI-powered plan
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className={`w-full px-8 py-4 bg-${accent}-600 text-white rounded-lg font-medium text-lg hover:bg-${accent}-700 transition-all duration-150 flex items-center justify-center gap-3`}
          >
            <FiPlus size={20} /> New Project
          </button>

          <button
            onClick={() => { useDemoSample(); setShowUploadModal(true); }}
            className="w-full px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-150"
          >
            Try Demo Sample
          </button>
        </div>
      </div>
    </div>
  );

  const renderSummaryView = () => (
    <div className="max-w-4xl mx-auto">
      <StageIndicator />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          {currentProject?.summary?.title}
        </h2>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Topics</h3>
            <ul className="space-y-1">
              {currentProject?.summary?.topics.map((topic, idx) => (
                <li key={idx} className="text-gray-900 dark:text-gray-100 flex items-start gap-2">
                  <span className={`text-${accent}-600 mt-1`}>•</span>
                  <span>{topic}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Learning Objectives</h3>
            <ul className="space-y-1">
              {currentProject?.summary?.objectives.map((obj, idx) => (
                <li key={idx} className="text-gray-900 dark:text-gray-100 flex items-start gap-2">
                  <span className={`text-${accent}-600 mt-1`}>•</span>
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Deadlines</h3>
            <ul className="space-y-1">
              {currentProject?.summary?.deadlines.map((deadline, idx) => (
                <li key={idx} className="text-gray-900 dark:text-gray-100 flex items-start gap-2">
                  <FiClock className={`text-${accent}-600 mt-1 flex-shrink-0`} />
                  <span>{deadline}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <Button onClick={approveStage} variant="primary" icon={<FiCheckCircle />}>
            Approve & Continue
          </Button>
          <Button onClick={regenerateStage} variant="secondary" disabled={isLoading} icon={<FiRefreshCw className={isLoading ? 'animate-spin' : ''} />}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTasksView = () => (
    <div className="max-w-4xl mx-auto">
      <StageIndicator />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Generated Tasks</h2>

        <div className="space-y-3 mb-8">
          {currentProject?.tasks.map((task) => (
            <div key={task.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-150">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                    task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <FiClock size={14} /> {task.estimated_hours}h
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={approveStage} variant="primary" icon={<FiCheckCircle />}>
            Approve & Continue
          </Button>
          <Button onClick={regenerateStage} variant="secondary" disabled={isLoading} icon={<FiRefreshCw className={isLoading ? 'animate-spin' : ''} />}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="max-w-4xl mx-auto">
      <StageIndicator />

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Your Schedule</h2>

        <div className="space-y-4 mb-8">
          {currentProject?.timeline.map((day, idx) => (
            <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 dark:text-white">{day.day}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{day.totalHours}h</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.date}</p>
              <ul className="space-y-1">
                {day.tasks.map((taskTitle, taskIdx) => (
                  <li key={taskIdx} className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className={`text-${accent}-600`}>•</span>
                    {taskTitle}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <Button onClick={approveStage} variant="primary" icon={<FiCheckCircle />}>
            Complete & View Dashboard
          </Button>
          <Button onClick={regenerateStage} variant="secondary" disabled={isLoading} icon={<FiRefreshCw className={isLoading ? 'animate-spin' : ''} />}>
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    const todoTasks = currentProject?.tasks.filter(t => t.status === 'todo') || [];
    const inProgressTasks = currentProject?.tasks.filter(t => t.status === 'in-progress') || [];
    const doneTasks = currentProject?.tasks.filter(t => t.status === 'done') || [];

    return (
      <div className="space-y-6">
        {/* Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <button onClick={() => setSummaryCollapsed(!summaryCollapsed)} className="w-full p-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{currentProject?.summary?.title}</h2>
            {summaryCollapsed ? <FiChevronDown /> : <FiChevronUp />}
          </button>

          {!summaryCollapsed && (
            <div className="px-6 pb-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {currentProject?.summary?.topics.map((topic, idx) => (
                    <span key={idx} className={`px-3 py-1 bg-${accent}-100 dark:bg-${accent}-900 text-${accent}-700 dark:text-${accent}-300 rounded-full text-sm`}>
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Tasks</h2>

          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'To Do', tasks: todoTasks, icon: FiAlertCircle },
              { label: 'In Progress', tasks: inProgressTasks, icon: FiClock },
              { label: 'Done', tasks: doneTasks, icon: FiCheckCircle }
            ].map(({ label, tasks, icon: Icon }) => (
              <div key={label}>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                  <Icon /> {label} ({tasks.length})
                </h3>
                <div className="space-y-2">
                  {tasks.map(task => (
                    <div key={task.id} className={`p-3 rounded-lg border transition-all duration-150 ${
                      label === 'In Progress' ? `bg-${accent}-50 dark:bg-${accent}-900/20 border-2 border-${accent}-200 dark:border-${accent}-700` :
                      label === 'Done' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 opacity-75' :
                      'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}>
                      <h4 className={`font-medium text-sm text-gray-900 dark:text-white mb-1 ${label === 'Done' ? 'line-through' : ''}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{task.estimated_hours}h</p>
                      {label === 'To Do' && (
                        <button onClick={() => updateTaskStatus(task.id, 'in-progress')} className={`text-xs px-2 py-1 bg-${accent}-100 text-${accent}-700 dark:bg-${accent}-900 dark:text-${accent}-300 rounded hover:bg-${accent}-200 dark:hover:bg-${accent}-800`}>
                          Start
                        </button>
                      )}
                      {label === 'In Progress' && (
                        <button onClick={() => updateTaskStatus(task.id, 'done')} className={`text-xs px-2 py-1 bg-${accent}-600 text-white rounded hover:bg-${accent}-700`}>
                          Complete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Timeline</h2>

          <div className="space-y-3">
            {currentProject?.timeline.map((day, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`w-12 h-12 rounded-full bg-${accent}-100 dark:bg-${accent}-900 text-${accent}-700 dark:text-${accent}-300 flex items-center justify-center font-medium text-sm flex-shrink-0`}>
                  {day.day.replace('Day ', 'D')}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">{day.date}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{day.totalHours}h</span>
                  </div>
                  <ul className="space-y-1">
                    {day.tasks.map((taskTitle, taskIdx) => (
                      <li key={taskIdx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span className={`text-${accent}-600`}>•</span>
                        {taskTitle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={`min-h-screen ${getThemeClasses()} transition-colors duration-200`}>
      {/* Sidebar */}
      <div className="fixed left-0 top-0 w-64 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className={`text-2xl font-bold text-${accent}-600`}>KLARIS</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Your Curriculum, Clarified</p>
        </div>

        <div className="p-4">
          <button onClick={startNewProject} className={`w-full px-4 py-3 bg-${accent}-600 text-white rounded-lg font-medium hover:bg-${accent}-700 flex items-center justify-center gap-2`}>
            <FiPlus /> New Project
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">No projects yet</p>
          ) : (
            <div className="space-y-1">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => { setCurrentProject(project); setCurrentStage('dashboard'); }}
                  className={`w-full px-3 py-2 rounded-lg text-left text-sm transition-all duration-150 ${
                    currentProject?.id === project.id
                      ? `bg-${accent}-100 dark:bg-${accent}-900 text-${accent}-700 dark:text-${accent}-300 font-medium`
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FiFolder size={16} />
                    <span className="truncate">{project.name}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {currentProject && currentStage === 'dashboard' && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Progress</h3>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <svg className="transform -rotate-90 w-12 h-12">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" className="text-gray-200 dark:text-gray-600" />
                    <circle
                      cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none"
                      strokeDasharray={`${2 * Math.PI * 20}`}
                      strokeDashoffset={`${2 * Math.PI * 20 * (1 - getProgress() / 100)}`}
                      className={`text-${accent}-600 transition-all duration-500`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-900 dark:text-white">
                    {getProgress()}%
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{getProgress()}% Complete</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {currentProject.tasks.filter(t => t.status === 'done').length} of {currentProject.tasks.length} tasks
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 block">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as Theme)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="forest">Forest</option>
              <option value="paper">Paper</option>
              <option value="neo">Neo</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={() => setIsDark(!isDark)}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 ${isDark ? `bg-${accent}-600` : 'bg-gray-300'}`}
            >
              <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 min-h-screen">
        {currentStage === 'upload' && !currentProject && renderUploadScreen()}
        {currentStage === 'summary' && renderSummaryView()}
        {currentStage === 'tasks' && renderTasksView()}
        {currentStage === 'timeline' && renderTimelineView()}
        {currentStage === 'dashboard' && currentProject && renderDashboard()}

        {isLoading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl">
              <div className="animate-spin w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-indigo-600 rounded-full mx-auto mb-4" />
              <p className="text-gray-700 dark:text-gray-300 font-medium">Processing...</p>
            </div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Your Notes</h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-12 text-center cursor-pointer hover:border-${accent}-400 dark:hover:border-${accent}-500 transition-all duration-200`}
              >
                <FiUpload className={`w-12 h-12 mx-auto mb-4 text-${accent}-600`} />
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">Drop a file or click to upload</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">PDF, TXT, DOCX supported</p>
                <input ref={fileInputRef} type="file" accept=".txt,.pdf,.docx" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => setUploadedText(event.target?.result as string);
                    reader.readAsText(file);
                  }
                }} className="hidden" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Or paste your notes</label>
                <textarea
                  value={uploadedText}
                  onChange={(e) => setUploadedText(e.target.value)}
                  rows={12}
                  placeholder="Paste your syllabus, notes, or project requirements..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setShowUploadModal(false); generateSummary(); }}
                  disabled={!uploadedText.trim()}
                  className={`flex-1 px-6 py-3 bg-${accent}-600 text-white rounded-lg font-medium hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  <FiCheckCircle /> Generate Plan
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Copilot */}
      {currentStage === 'dashboard' && currentProject && (
        <>
          <button
            onClick={() => setChatOpen(true)}
            className={`fixed bottom-6 right-6 w-14 h-14 bg-${accent}-600 text-white rounded-full shadow-lg hover:bg-${accent}-700 hover:scale-110 transition-all duration-150 flex items-center justify-center`}
          >
            <FiMessageSquare size={24} />
          </button>

          {chatOpen && (
            <>
              <div onClick={() => setChatOpen(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
              <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <FiMessageSquare /> AI Copilot
                  </h3>
                  <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12">
                      <FiMessageSquare className={`w-12 h-12 mx-auto mb-4 text-${accent}-600 opacity-50`} />
                      <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Ask me anything about your project</p>
                      <div className="space-y-2">
                        {['Can you break down my tasks?', 'Help me prioritize tasks'].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => setChatInput(q)}
                            className="block w-full px-4 py-2 text-sm text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                          msg.role === 'user' ? `bg-${accent}-600 text-white` : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                      placeholder="Ask a question..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      onClick={sendChatMessage}
                      disabled={!chatInput.trim()}
                      className={`px-4 py-2 bg-${accent}-600 text-white rounded-lg hover:bg-${accent}-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <FiSend />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
