'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Quiz category interface
interface QuizCategory {
  id: string
  title: string
  description: string
  totalQuestions: number
}

export default function QuizSelection() {
  const router = useRouter()
  const [quizCategories, setQuizCategories] = useState<QuizCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<Record<string, { completed: number; score: number }>>({})

  // Load quiz categories from API and user stats from localStorage
  useEffect(() => {
    // Fetch quiz categories
    fetch('/api/quiz')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load quiz categories')
        }
        return response.json()
      })
      .then((data) => {
        setQuizCategories(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error loading quiz categories:', error)
        setLoading(false)
      })

    // Load user stats from localStorage
    const storedStats = localStorage.getItem('topcitQuizStats')
    if (storedStats) {
      setUserStats(JSON.parse(storedStats))
    }
  }, [])

  // Calculate total progress
  const totalQuestions = quizCategories.reduce((total, category) => total + category.totalQuestions, 0)
  const totalCompleted = Object.values(userStats).reduce((sum, stat) => sum + stat.completed, 0)
  const progressPercentage = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0

  // Start a quiz for a specific category
  const startQuiz = (categoryId: string) => {
    router.push(`/quiz/${categoryId}`)
  }

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-12"
      >
        <header className="text-center mb-12">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/" className="inline-flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to Home
            </Link>
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-bold mb-2 text-blue-600 dark:text-blue-400"
          >
            TOPCIT Quiz Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Test your knowledge through interactive quizzes
          </motion.p>
        </header>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
              <CardDescription>Track your journey through TOPCIT modules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={progressPercentage} className="h-2" />
              </div>
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>
                  {totalCompleted} of {totalQuestions} questions completed
                </span>
                <Badge variant="outline">{progressPercentage}% complete</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quiz categories */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-12 w-12 rounded-full border-2 border-blue-500 border-t-transparent"
            />
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
          >
            {quizCategories.map((category) => {
              const stats = userStats[category.id] || { completed: 0, score: 0 }
              const completionPercent = Math.round((stats.completed / category.totalQuestions) * 100) || 0
              const completion =
                stats.completed > 0 ? `${stats.completed}/${category.totalQuestions} completed` : 'Not started'
              const bestScore = stats.score > 0 ? `${stats.score}%` : ''

              return (
                <motion.div
                  key={category.id}
                  variants={item}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  onClick={() => startQuiz(category.id)}
                >
                  <Card className="cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          Module {category.id}: {category.title}
                        </CardTitle>
                        <Badge className="ml-2">{category.totalQuestions} Questions</Badge>
                      </div>
                      <Separator className="my-2" />
                      <CardDescription>{category.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <Progress value={completionPercent} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{completion}</span>
                        {bestScore && (
                          <Badge variant="outline" className="text-green-600 dark:text-green-400">
                            Best: {bestScore}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="pt-1">
                      <Button variant="ghost" className="w-full" size="sm">
                        {stats.completed === 0 ? 'Start Quiz' : 'Continue Quiz'}
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
