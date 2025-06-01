'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'

// Code snippet question type
interface CodeSnippet {
  id: string
  language: string
  code: string
  question: string
  answer: string
  options?: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
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

// Programming languages - keeping for future reference
// const languages = ['Python', 'JavaScript', 'Java', 'SQL', 'C#', 'PHP'];

// Sample code snippets - in a real app, these would be fetched from an API
const sampleCodeSnippets: CodeSnippet[] = [
  {
    id: '1',
    language: 'JavaScript',
    code: `function calculateTotal(items) {\n  let total = 0;\n  for (let i = 0; i < items.length; i++) {\n    total += items[i].price;\n  }\n  return total;\n}`,
    question: 'What would be returned if we call calculateTotal([{price: 10}, {price: 20}])?',
    answer: '30',
    options: ['10', '20', '30', 'undefined'],
    explanation:
      'The function iterates through the array and adds the price property of each item to the total variable.',
    difficulty: 'easy',
  },
  {
    id: '2',
    language: 'Python',
    code: `def process_data(data):\n  result = []\n  for item in data:\n    if item > 10:\n      result.append(item * 2)\n    else:\n      result.append(item)\n  return result`,
    question: 'What will process_data([5, 15, 8, 20]) return?',
    answer: '[5, 30, 8, 40]',
    options: ['[5, 15, 8, 20]', '[10, 30, 16, 40]', '[5, 30, 8, 40]', '[10, 15, 16, 20]'],
    explanation: 'The function doubles values greater than 10 and keeps others unchanged.',
    difficulty: 'easy',
  },
  {
    id: '3',
    language: 'SQL',
    code: `SELECT department, AVG(salary) as avg_salary\nFROM employees\nWHERE hire_date > '2020-01-01'\nGROUP BY department\nHAVING COUNT(*) > 5\nORDER BY avg_salary DESC;`,
    question: 'What does this SQL query do?',
    answer:
      'Finds departments with more than 5 employees hired after Jan 1, 2020, showing average salaries in descending order',
    options: [
      'Lists all departments and their average salaries',
      'Finds departments with more than 5 employees hired after Jan 1, 2020, showing average salaries in descending order',
      'Shows employees with salaries higher than average',
      'Lists departments where the average salary is more than 5',
    ],
    explanation:
      'The query filters employees hired after 2020-01-01, groups by department, includes only departments with more than 5 such employees, and sorts by average salary in descending order.',
    difficulty: 'medium',
  },
  {
    id: '4',
    language: 'JavaScript',
    code: `async function fetchUserData(userId) {\n  try {\n    const response = await fetch(\`/api/users/\${userId}\`);\n    if (!response.ok) {\n      throw new Error('Network response was not ok');\n    }\n    const data = await response.json();\n    return data;\n  } catch (error) {\n    console.error('Error fetching user data:', error);\n    return null;\n  }\n}`,
    question: 'What happens if the network request fails?',
    answer: 'The function logs the error and returns null',
    options: [
      'The function returns undefined',
      'The function throws an error',
      'The function logs the error and returns null',
      'The function retries the request',
    ],
    explanation:
      'When an error occurs in the try block, execution jumps to the catch block where the error is logged and null is returned.',
    difficulty: 'medium',
  },
  {
    id: '5',
    language: 'Java',
    code: `public class Node {\n  private int value;\n  private Node next;\n  \n  public Node(int value) {\n    this.value = value;\n    this.next = null;\n  }\n  \n  public void add(int value) {\n    if (next == null) {\n      next = new Node(value);\n    } else {\n      next.add(value);\n    }\n  }\n}`,
    question: 'What data structure is being implemented?',
    answer: 'Linked List',
    options: ['Binary Tree', 'Stack', 'Queue', 'Linked List'],
    explanation:
      'This code implements a node in a singly linked list, with each node storing a value and a reference to the next node.',
    difficulty: 'medium',
  },
  {
    id: '6',
    language: 'Python',
    code: `def recursive_function(n):\n  if n <= 1:\n    return 1\n  else:\n    return n * recursive_function(n-1)`,
    question: 'What mathematical operation does this function perform?',
    answer: 'Factorial',
    options: ['Exponentiation', 'Fibonacci sequence', 'Factorial', 'Logarithm'],
    explanation:
      'This is a recursive implementation of the factorial function. For input n, it calculates n! = n × (n-1) × ... × 2 × 1.',
    difficulty: 'easy',
  },
]

export default function CodeSnippetsChallenge() {
  const [selectedModule, setSelectedModule] = useState<string>('01') // Default to software development
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [score, setScore] = useState(0)
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'finished'>('setup')
  const [loading, setLoading] = useState(false)
  const [highScores, setHighScores] = useState<Record<string, number>>({})
  const [showExplanation, setShowExplanation] = useState(false)

  // Load high scores from localStorage
  useEffect(() => {
    const storedScores = localStorage.getItem('codeSnippetsHighScores')
    if (storedScores) {
      setHighScores(JSON.parse(storedScores))
    }
  }, [])

  // Simulate fetching snippets for the selected module
  const fetchSnippetsForModule = async (moduleId: string): Promise<CodeSnippet[]> => {
    // In a real app, this would make an API call
    // For now, just return sample snippets with slight filtering based on module
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter based on module (simplified approach)
        let filteredSnippets = [...sampleCodeSnippets]

        if (moduleId === '01') {
          // Software Development - favor programming languages
          filteredSnippets = sampleCodeSnippets.filter((s) =>
            ['JavaScript', 'Python', 'Java', 'C#'].includes(s.language)
          )
        } else if (moduleId === '02') {
          // Data - favor SQL and data processing
          filteredSnippets = sampleCodeSnippets.filter((s) => ['SQL', 'Python'].includes(s.language))
        }

        // Shuffle the snippets
        const shuffled = [...filteredSnippets].sort(() => Math.random() - 0.5)
        resolve(shuffled.slice(0, 5)) // Limit to 5 snippets per game
      }, 1000)
    })
  }

  // Start the game
  const startGame = async () => {
    setLoading(true)

    try {
      const fetchedSnippets = await fetchSnippetsForModule(selectedModule)
      setSnippets(fetchedSnippets)
      setCurrentIndex(0)
      setSelectedAnswer(null)
      setFeedback(null)
      setScore(0)
      setShowExplanation(false)

      // Start game
      setGameState('playing')
    } catch (error) {
      console.error('Error starting game:', error)
    } finally {
      setLoading(false)
    }
  }

  // Submit answer
  const submitAnswer = (answer: string) => {
    if (selectedAnswer !== null) return // Prevent multiple submissions

    setSelectedAnswer(answer)

    const currentSnippet = snippets[currentIndex]
    const isCorrect = answer === currentSnippet.answer

    if (isCorrect) {
      setFeedback({
        type: 'success',
        message: 'Correct! Well done.',
      })
      setScore(score + 1)
    } else {
      setFeedback({
        type: 'error',
        message: `Incorrect. The correct answer is: "${currentSnippet.answer}"`,
      })
    }
  }

  // Move to next snippet
  const nextSnippet = () => {
    if (currentIndex < snippets.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setSelectedAnswer(null)
      setFeedback(null)
      setShowExplanation(false)
    } else {
      finishGame()
    }
  }

  // Finish the game
  const finishGame = () => {
    setGameState('finished')

    // Save high score if it's a new record
    const scoreKey = selectedModule
    if (!highScores[scoreKey] || score > highScores[scoreKey]) {
      const newHighScores = {
        ...highScores,
        [scoreKey]: score,
      }
      setHighScores(newHighScores)
      localStorage.setItem('codeSnippetsHighScores', JSON.stringify(newHighScores))
    }
  }

  // Get current high score
  const getCurrentHighScore = () => {
    return highScores[selectedModule] || 0
  }

  // Toggle explanation visibility
  const toggleExplanation = () => {
    setShowExplanation(!showExplanation)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-800">
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
          <h1 className="text-3xl font-bold text-purple-600 dark:text-purple-400">Code Snippets Challenge</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Analyze code snippets, understand what they do, and answer questions about them.
          </p>
        </header>

        {gameState === 'setup' && (
          <div className="max-w-md mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select a module:
                    </label>
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
                  </div>

                  <div className="py-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">High Score:</h3>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {getCurrentHighScore()} / 5
                    </p>
                  </div>

                  <div className="pt-2">
                    <Button
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={startGame}
                      disabled={loading}
                    >
                      {loading ? 'Loading Snippets...' : 'Start Code Challenge'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {gameState === 'playing' && snippets.length > 0 && (
          <div className="max-w-3xl mx-auto">
            {/* Progress bar */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Snippet {currentIndex + 1} of {snippets.length}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score: {score} / {currentIndex + (selectedAnswer ? 1 : 0)}
                </span>
              </div>
              <Progress value={((currentIndex + (selectedAnswer ? 1 : 0)) / snippets.length) * 100} className="h-2" />
            </div>

            {/* Current snippet */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6"
              >
                <div className="mb-4 flex justify-between items-center">
                  <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                    {snippets[currentIndex].language}
                  </Badge>
                  <Badge
                    className={`
                    ${
                      snippets[currentIndex].difficulty === 'easy'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : snippets[currentIndex].difficulty === 'medium'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }
                  `}
                  >
                    {snippets[currentIndex].difficulty.charAt(0).toUpperCase() +
                      snippets[currentIndex].difficulty.slice(1)}
                  </Badge>
                </div>

                {/* Code block */}
                <div className="mb-6">
                  <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                      {snippets[currentIndex].code}
                    </pre>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                    {snippets[currentIndex].question}
                  </h3>

                  {/* Multiple choice options */}
                  {snippets[currentIndex].options ? (
                    <div className="space-y-2">
                      {snippets[currentIndex].options.map((option, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className={`w-full justify-start h-auto py-3 px-4 text-left ${
                            selectedAnswer === option
                              ? option === snippets[currentIndex].answer
                                ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200'
                                : 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:border-red-500 dark:text-red-200'
                              : selectedAnswer !== null && option === snippets[currentIndex].answer
                              ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:border-green-500 dark:text-green-200'
                              : ''
                          }`}
                          onClick={() => submitAnswer(option)}
                          disabled={selectedAnswer !== null}
                        >
                          <span className="mr-2">{String.fromCharCode(65 + index)}.</span> {option}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    // Free text input for answers without options
                    <div>
                      <Textarea
                        placeholder="Type your answer here..."
                        className="w-full h-24"
                        disabled={selectedAnswer !== null}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                      />
                      {selectedAnswer === null && (
                        <Button
                          className="mt-3 bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() => submitAnswer(selectedAnswer || '')}
                        >
                          Submit Answer
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                {feedback && (
                  <Alert
                    className={`mb-4 ${
                      feedback.type === 'success'
                        ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200'
                    }`}
                  >
                    <AlertDescription>{feedback.message}</AlertDescription>
                  </Alert>
                )}

                {/* Explanation (shown after answering) */}
                {selectedAnswer !== null && (
                  <div className="mt-4">
                    <Button variant="outline" onClick={toggleExplanation} className="mb-3">
                      {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                    </Button>

                    {showExplanation && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-medium mb-2 text-gray-900 dark:text-gray-100">Explanation:</h4>
                        <p className="text-gray-800 dark:text-gray-200">{snippets[currentIndex].explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Next button */}
                {selectedAnswer !== null && (
                  <div className="mt-6 text-center">
                    <Button onClick={nextSnippet} className="bg-purple-600 hover:bg-purple-700 text-white">
                      {currentIndex < snippets.length - 1 ? 'Next Snippet' : 'Finish'}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}

        {gameState === 'finished' && (
          <div className="max-w-md mx-auto">
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Challenge Complete!</h2>

                  <div className="py-6">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Your Score</p>
                    <p className="text-5xl font-bold text-purple-600 dark:text-purple-400">
                      {score} / {snippets.length}
                    </p>

                    <div className="flex justify-center mt-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
                        <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                          {Math.round((score / snippets.length) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {score === snippets.length && (
                    <div className="py-2">
                      <Badge className="bg-green-400 text-green-900 px-3 py-1 text-sm">Perfect Score!</Badge>
                    </div>
                  )}

                  {score > 0 && score === getCurrentHighScore() && score !== snippets.length && (
                    <div className="py-2">
                      <Badge className="bg-yellow-400 text-yellow-900 px-3 py-1 text-sm">New High Score!</Badge>
                    </div>
                  )}

                  <div className="space-y-3 pt-4">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={startGame}>
                      Play Again
                    </Button>

                    <Button variant="outline" className="w-full" onClick={() => setGameState('setup')}>
                      Change Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
