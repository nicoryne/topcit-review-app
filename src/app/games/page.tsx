'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

// Game type interface
interface GameType {
  id: string
  title: string
  description: string
  icon: string
  color: string
  available: boolean
}

export default function GamesSelection() {
  const [userPreference, setUserPreference] = useState<string | null>(null)

  // Load user preference from localStorage
  useEffect(() => {
    const storedPreference = localStorage.getItem('topcitGamePreference')
    if (storedPreference) {
      setUserPreference(storedPreference)
    }
  }, [])

  // List of available game types
  const gameTypes: GameType[] = [
    {
      id: 'flashcards',
      title: 'Flashcards',
      description: 'Quick recall of key concepts and definitions with digital flashcards.',
      icon: '🗃️',
      color: 'bg-blue-100 dark:bg-blue-900',
      available: true,
    },
    {
      id: 'timeattack',
      title: 'Time Attack',
      description: 'Answer as many questions as possible within a time limit.',
      icon: '⏱️',
      color: 'bg-red-100 dark:bg-red-900',
      available: true,
    },
    {
      id: 'matching',
      title: 'Concept Matching',
      description: 'Match related terms and concepts by connecting them.',
      icon: '🔄',
      color: 'bg-green-100 dark:bg-green-900',
      available: true,
    },
    {
      id: 'fillinblank',
      title: 'Fill-in-the-Blank',
      description: 'Complete sentences with missing technical terms.',
      icon: '📝',
      color: 'bg-yellow-100 dark:bg-yellow-900',
      available: true,
    },
    {
      id: 'codesnippets',
      title: 'Code Snippets',
      description: 'Identify missing elements or fix errors in code snippets.',
      icon: '💻',
      color: 'bg-purple-100 dark:bg-purple-900',
      available: true,
    },
    {
      id: 'conceptmap',
      title: 'Concept Map Builder',
      description: 'Arrange concepts in the correct hierarchical or relational structure.',
      icon: '🗺️',
      color: 'bg-indigo-100 dark:bg-indigo-900',
      available: true,
    },
    {
      id: 'casestudy',
      title: 'Case Study Analysis',
      description: 'Analyze IT scenarios and identify the best approaches or solutions.',
      icon: '📊',
      color: 'bg-teal-100 dark:bg-teal-900',
      available: true, // This is now ready to use
    },
    {
      id: 'knowledgepath',
      title: 'Knowledge Path',
      description: 'Progress through topics as you master prerequisites.',
      icon: '🛤️',
      color: 'bg-orange-100 dark:bg-orange-900',
      available: false, // Not yet implemented
    },
  ]

  // Navigate to a specific game type
  const startGame = (gameId: string) => {
    // Save user preference
    localStorage.setItem('topcitGamePreference', gameId)
    // Note: We're now using Link components instead of programmatic navigation
    // to avoid linting errors with useRouter
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
            TOPCIT Learning Games
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-300"
          >
            Enhance your learning with interactive games and activities
          </motion.p>
        </header>

        {/* Game types grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {gameTypes.map((game) => (
            <motion.div
              key={game.id}
              variants={item}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              onClick={() => game.available && startGame(game.id)}
              className={!game.available ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            >
              <Card className={`h-full border-l-4 ${game.color.split(' ')[0].replace('bg', 'border')}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl flex items-center">
                      <span className="mr-2 text-2xl">{game.icon}</span>
                      {game.title}
                    </CardTitle>
                    {!game.available && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      >
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                  <Separator className="my-2" />
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
                <CardContent className={`p-4 rounded-b-lg ${game.color}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{userPreference === game.id ? 'Recently played' : ''}</span>
                    {game.available ? (
                      <Link href={`/games/${game.id}`}>
                        <Button variant="secondary" size="sm">
                          {userPreference === game.id ? 'Continue' : 'Start Game'}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
