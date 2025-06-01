'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
// Alert component may be used in future updates
// import { Alert, AlertDescription } from '@/components/ui/alert';

// Concept node interface
interface ConceptNode {
  id: string
  label: string
  description?: string
  parentId?: string
  level: number
}

// Concept map interface
interface ConceptMap {
  id: string
  title: string
  description: string
  moduleId: string
  nodes: ConceptNode[]
}

// Module options
const moduleOptions = [
  { id: '01', name: 'Module 01: Software Development' },
  { id: '02', name: 'Module 02: Understanding & Using Data' },
  { id: '03', name: 'Module 03: Overview of System Architecture' },
  { id: '04', name: 'Module 04: Understanding Information Security' },
  { id: '05', name: 'Module 05: Understanding the IT Business and Ethics' },
  { id: '06', name: 'Module 06: Project Management and Technical Communication' },
]

// Sample concept maps - in a real app these would be fetched from an API
const sampleConceptMaps: ConceptMap[] = [
  {
    id: 'map1',
    title: 'Software Development Lifecycle',
    description: 'Arrange the phases of the software development lifecycle in the correct order.',
    moduleId: '01',
    nodes: [
      { id: 'node1', label: 'Requirements Analysis', level: 1 },
      { id: 'node2', label: 'Design', level: 2 },
      { id: 'node3', label: 'Implementation', level: 3 },
      { id: 'node4', label: 'Testing', level: 4 },
      { id: 'node5', label: 'Deployment', level: 5 },
      { id: 'node6', label: 'Maintenance', level: 6 },
    ],
  },
  {
    id: 'map2',
    title: 'Database Concepts Hierarchy',
    description: 'Arrange these database concepts from most general to most specific.',
    moduleId: '02',
    nodes: [
      { id: 'node1', label: 'Database Management System (DBMS)', level: 1 },
      { id: 'node2', label: 'Relational Database', level: 2 },
      { id: 'node3', label: 'Table', level: 3 },
      { id: 'node4', label: 'Record', level: 4 },
      { id: 'node5', label: 'Field', level: 5 },
    ],
  },
  {
    id: 'map3',
    title: 'Network Architecture Layers',
    description: 'Arrange these network layers from highest to lowest in the OSI model.',
    moduleId: '03',
    nodes: [
      { id: 'node1', label: 'Application Layer', level: 1 },
      { id: 'node2', label: 'Presentation Layer', level: 2 },
      { id: 'node3', label: 'Session Layer', level: 3 },
      { id: 'node4', label: 'Transport Layer', level: 4 },
      { id: 'node5', label: 'Network Layer', level: 5 },
      { id: 'node6', label: 'Data Link Layer', level: 6 },
      { id: 'node7', label: 'Physical Layer', level: 7 },
    ],
  },
  {
    id: 'map4',
    title: 'Information Security Concepts',
    description: 'Arrange these information security concepts from most fundamental to most specialized.',
    moduleId: '04',
    nodes: [
      { id: 'node1', label: 'CIA Triad (Confidentiality, Integrity, Availability)', level: 1 },
      { id: 'node2', label: 'Authentication and Authorization', level: 2 },
      { id: 'node3', label: 'Risk Management', level: 3 },
      { id: 'node4', label: 'Security Controls', level: 4 },
      { id: 'node5', label: 'Cryptography', level: 5 },
      { id: 'node6', label: 'Security Auditing', level: 6 },
    ],
  },
  {
    id: 'map5',
    title: 'IT Business Strategy Hierarchy',
    description: 'Arrange these business strategy components from highest to lowest level.',
    moduleId: '05',
    nodes: [
      { id: 'node1', label: 'Business Vision and Mission', level: 1 },
      { id: 'node2', label: 'Strategic Goals', level: 2 },
      { id: 'node3', label: 'Business Objectives', level: 3 },
      { id: 'node4', label: 'IT Strategy', level: 4 },
      { id: 'node5', label: 'IT Projects', level: 5 },
      { id: 'node6', label: 'IT Operations', level: 6 },
    ],
  },
  {
    id: 'map6',
    title: 'Project Management Process Groups',
    description: 'Arrange these project management process groups in their typical sequence.',
    moduleId: '06',
    nodes: [
      { id: 'node1', label: 'Initiating', level: 1 },
      { id: 'node2', label: 'Planning', level: 2 },
      { id: 'node3', label: 'Executing', level: 3 },
      { id: 'node4', label: 'Monitoring and Controlling', level: 4 },
      { id: 'node5', label: 'Closing', level: 5 },
    ],
  },
]

export default function ConceptMapBuilder() {
  const [selectedModule, setSelectedModule] = useState<string>('')
  const [conceptMaps, setConceptMaps] = useState<ConceptMap[]>([])
  const [selectedMap, setSelectedMap] = useState<ConceptMap | null>(null)
  const [userArrangement, setUserArrangement] = useState<ConceptNode[]>([])
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'feedback' | 'finished'>('setup')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ correct: boolean; message: string } | null>(null)
  const [completedMaps, setCompletedMaps] = useState<string[]>([])
  const [attemptCount, setAttemptCount] = useState(0)

  // Load completed maps from localStorage
  useEffect(() => {
    const storedCompleted = localStorage.getItem('conceptMapCompleted')
    if (storedCompleted) {
      setCompletedMaps(JSON.parse(storedCompleted))
    }
  }, [])

  // Fetch concept maps for the selected module
  useEffect(() => {
    if (selectedModule) {
      setLoading(true)
      // Simulate API call - in a real app, this would fetch from a backend
      setTimeout(() => {
        const maps = sampleConceptMaps.filter((map) => map.moduleId === selectedModule)
        setConceptMaps(maps)
        setLoading(false)
      }, 500)
    }
  }, [selectedModule])

  // Start a concept map exercise
  const startMap = (map: ConceptMap) => {
    setSelectedMap(map)

    // Shuffle the nodes for the user to arrange
    const shuffled = [...map.nodes].sort(() => Math.random() - 0.5)
    setUserArrangement(shuffled)

    setGameState('playing')
    setAttemptCount(0)
    setFeedback(null)
  }

  // Check if the user's arrangement is correct
  const checkArrangement = () => {
    if (!selectedMap) return

    // Increment attempt count
    setAttemptCount(attemptCount + 1)

    // Check if the arrangement matches the correct order
    const isCorrect = userArrangement.every((node, index) => node.level === selectedMap.nodes[index].level)

    if (isCorrect) {
      setFeedback({
        correct: true,
        message: "Perfect! You've arranged the concepts correctly.",
      })

      // Add to completed maps if not already there
      if (!completedMaps.includes(selectedMap.id)) {
        const updated = [...completedMaps, selectedMap.id]
        setCompletedMaps(updated)
        localStorage.setItem('conceptMapCompleted', JSON.stringify(updated))
      }
    } else {
      // Find which nodes are out of place
      const incorrectPositions = userArrangement.filter(
        (node, index) => node.level !== selectedMap.nodes[index].level
      ).length

      setFeedback({
        correct: false,
        message: `There ${incorrectPositions === 1 ? 'is' : 'are'} ${incorrectPositions} concept${
          incorrectPositions === 1 ? '' : 's'
        } out of place. Try again!`,
      })
    }

    setGameState('feedback')
  }

  // Get percentage of maps completed for the current module
  const getCompletionPercentage = () => {
    if (!conceptMaps.length) return 0

    const mapIds = conceptMaps.map((map) => map.id)
    const completedCount = completedMaps.filter((id) => mapIds.includes(id)).length

    return Math.round((completedCount / conceptMaps.length) * 100)
  }

  // Return to map selection
  const returnToMapSelection = () => {
    setSelectedMap(null)
    setUserArrangement([])
    setGameState('setup')
    setFeedback(null)
  }

  // Continue after feedback
  const continueAfterFeedback = () => {
    if (feedback?.correct) {
      // If correct, return to map selection
      returnToMapSelection()
    } else {
      // If incorrect, continue playing
      setGameState('playing')
      setFeedback(null)
    }
  }

  // Check if a map is completed
  const isMapCompleted = (mapId: string) => {
    return completedMaps.includes(mapId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/games" className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Games
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">Concept Map Builder</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Arrange concepts in the correct hierarchical or sequential order to build a complete concept map.
          </p>
        </header>

        {gameState === 'setup' && (
          <>
            <div className="max-w-xl mx-auto mb-8">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Select a Module</h2>
                <Select value={selectedModule} onValueChange={(value) => setSelectedModule(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a module" />
                  </SelectTrigger>
                  <SelectContent>
                    {moduleOptions.map((module) => (
                      <SelectItem key={module.id} value={module.id}>
                        {module.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedModule && conceptMaps.length > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Completion Progress</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2" />
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-12 w-12 rounded-full border-2 border-indigo-500 border-t-transparent"
                />
              </div>
            ) : selectedModule && conceptMaps.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <AnimatePresence>
                  {conceptMaps.map((map) => (
                    <motion.div
                      key={map.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      <Card
                        className={`h-full cursor-pointer transition-all duration-200 hover:shadow-lg ${
                          isMapCompleted(map.id) ? 'border-green-500 dark:border-green-700' : ''
                        }`}
                        onClick={() => startMap(map)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{map.title}</h3>
                            {isMapCompleted(map.id) && (
                              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                Completed
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">{map.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500 dark:text-gray-500">
                              {map.nodes.length} concepts
                            </span>
                            <Button variant="outline" size="sm">
                              Start Exercise
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : selectedModule ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">No concept maps available for this module.</p>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">
                  Please select a module to view available concept maps.
                </p>
              </div>
            )}
          </>
        )}

        {gameState === 'playing' && selectedMap && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{selectedMap.title}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{selectedMap.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                    Drag and drop the concepts in the correct order:
                  </h3>

                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <Reorder.Group
                      axis="y"
                      values={userArrangement}
                      onReorder={setUserArrangement}
                      className="space-y-2"
                    >
                      {userArrangement.map((node, index) => (
                        <Reorder.Item key={node.id} value={node} className="cursor-grab active:cursor-grabbing">
                          <motion.div
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-sm font-medium">
                                {index + 1}
                              </div>
                              <span className="text-gray-800 dark:text-gray-200 font-medium">{node.label}</span>
                              <div className="ml-auto">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-gray-400 dark:text-gray-500"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                            {node.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-9">{node.description}</p>
                            )}
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={returnToMapSelection}>
                    Cancel
                  </Button>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={checkArrangement}>
                    Check Answer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'feedback' && feedback && (
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div
                    className={`inline-flex items-center justify-center h-16 w-16 rounded-full mb-6 ${
                      feedback.correct ? 'bg-green-100 dark:bg-green-900' : 'bg-amber-100 dark:bg-amber-900'
                    }`}
                  >
                    {feedback.correct ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-green-600 dark:text-green-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-amber-600 dark:text-amber-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>

                  <h2
                    className={`text-xl font-semibold mb-3 ${
                      feedback.correct ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {feedback.correct ? 'Excellent Work!' : 'Not Quite Right'}
                  </h2>

                  <p className="text-gray-700 dark:text-gray-300 mb-6">{feedback.message}</p>

                  {feedback.correct && (
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Correct Order:</h3>
                      <ol className="list-decimal list-inside text-left">
                        {selectedMap?.nodes
                          .sort((a, b) => a.level - b.level)
                          .map((node) => (
                            <li key={node.id} className="mb-1 text-gray-800 dark:text-gray-200">
                              {node.label}
                            </li>
                          ))}
                      </ol>
                    </div>
                  )}

                  {!feedback.correct && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Attempts: {attemptCount}</p>
                  )}

                  <Button
                    className={`${
                      feedback.correct ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white`}
                    onClick={continueAfterFeedback}
                  >
                    {feedback.correct ? 'Return to Map Selection' : 'Try Again'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
