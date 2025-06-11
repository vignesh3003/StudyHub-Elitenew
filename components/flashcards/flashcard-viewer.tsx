"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookOpen, Search, ChevronLeft, ChevronRight, Eye, EyeOff, Shuffle, Star, Trash2, Edit } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { gamificationService } from "@/lib/gamification-service"

interface Flashcard {
  id: string
  question: string
  answer: string
  subject: string
  difficulty: "easy" | "medium" | "hard"
  tags?: string[]
  createdAt: Date
  reviewCount: number
  lastReviewed?: Date
}

interface FlashcardViewerProps {
  user: any
  onClose?: () => void
}

export default function FlashcardViewer({ user, onClose }: FlashcardViewerProps) {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [studyMode, setStudyMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Load flashcards from localStorage (mock data for now)
  useEffect(() => {
    loadFlashcards()
  }, [user])

  // Filter flashcards when filters change
  useEffect(() => {
    filterFlashcards()
  }, [flashcards, selectedSubject, selectedDifficulty, searchQuery])

  const loadFlashcards = async () => {
    try {
      setIsLoading(true)
      const savedCards = localStorage.getItem(`flashcards_${user?.uid}`)
      if (savedCards) {
        const cards = JSON.parse(savedCards).map((card: any) => ({
          ...card,
          createdAt: new Date(card.createdAt),
          lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
        }))
        setFlashcards(cards)

        // Update gamification stats based on existing flashcards
        if (user?.uid && cards.length > 0) {
          console.log(`📊 Syncing ${cards.length} existing flashcards with gamification`)
          // This will ensure the count is accurate
          await gamificationService.recordFlashcardCreated(user.uid, 0) // Just trigger the achievement check
        }
      } else {
        // Add some sample flashcards for demo
        const sampleCards: Flashcard[] = [
          {
            id: "1",
            question: "What is the capital of France?",
            answer: "Paris",
            subject: "Geography",
            difficulty: "easy",
            tags: ["capitals", "europe"],
            createdAt: new Date(),
            reviewCount: 0,
          },
          {
            id: "2",
            question: "What is the formula for the area of a circle?",
            answer: "A = πr²",
            subject: "Mathematics",
            difficulty: "medium",
            tags: ["geometry", "formulas"],
            createdAt: new Date(),
            reviewCount: 0,
          },
        ]
        setFlashcards(sampleCards)
        localStorage.setItem(`flashcards_${user?.uid}`, JSON.stringify(sampleCards))
      }
    } catch (error) {
      console.error("Error loading flashcards:", error)
      toast({
        title: "Error",
        description: "Failed to load flashcards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterFlashcards = () => {
    let filtered = [...flashcards]

    if (selectedSubject !== "all") {
      filtered = filtered.filter((card) => card.subject === selectedSubject)
    }

    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((card) => card.difficulty === selectedDifficulty)
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (card) =>
          card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
          card.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    setFilteredCards(filtered)
    setCurrentCardIndex(0)
    setShowAnswer(false)
  }

  const getUniqueSubjects = () => {
    return [...new Set(flashcards.map((card) => card.subject))]
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const nextCard = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1)
      setShowAnswer(false)
    }
  }

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1)
      setShowAnswer(false)
    }
  }

  const shuffleCards = () => {
    const shuffled = [...filteredCards].sort(() => Math.random() - 0.5)
    setFilteredCards(shuffled)
    setCurrentCardIndex(0)
    setShowAnswer(false)
    toast({
      title: "Cards Shuffled! 🔀",
      description: "Flashcards have been randomized for better learning",
    })
  }

  const markAsReviewed = () => {
    const currentCard = filteredCards[currentCardIndex]
    if (currentCard) {
      const updatedCards = flashcards.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              reviewCount: card.reviewCount + 1,
              lastReviewed: new Date(),
            }
          : card,
      )
      setFlashcards(updatedCards)
      localStorage.setItem(`flashcards_${user?.uid}`, JSON.stringify(updatedCards))
    }
  }

  const deleteCard = (cardId: string) => {
    const updatedCards = flashcards.filter((card) => card.id !== cardId)
    setFlashcards(updatedCards)
    localStorage.setItem(`flashcards_${user?.uid}`, JSON.stringify(updatedCards))
    toast({
      title: "Flashcard Deleted",
      description: "The flashcard has been removed from your collection",
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-pulse text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading your flashcards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Flashcards
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {flashcards.length} total cards • {filteredCards.length} showing
          </p>
        </div>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search flashcards..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {getUniqueSubjects().map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Difficulty</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Actions</label>
              <div className="flex gap-2">
                <Button onClick={shuffleCards} variant="outline" size="sm" className="flex-1">
                  <Shuffle className="h-4 w-4 mr-1" />
                  Shuffle
                </Button>
                <Button
                  onClick={() => setStudyMode(!studyMode)}
                  variant={studyMode ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                >
                  {studyMode ? "Exit Study" : "Study Mode"}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredCards.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Flashcards Found</h3>
            <p className="text-gray-500 text-center max-w-md">
              {flashcards.length === 0
                ? "You haven't created any flashcards yet. Start by generating some with our AI tools!"
                : "No flashcards match your current filters. Try adjusting your search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={studyMode ? "study" : "browse"} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse" onClick={() => setStudyMode(false)}>
              Browse Mode
            </TabsTrigger>
            <TabsTrigger value="study" onClick={() => setStudyMode(true)}>
              Study Mode
            </TabsTrigger>
          </TabsList>

          {/* Browse Mode */}
          <TabsContent value="browse" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card, index) => (
                <Card
                  key={card.id}
                  className="bg-white/90 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="outline" className={getDifficultyColor(card.difficulty)}>
                        {card.difficulty}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCard(card.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{card.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Question:</h4>
                      <p className="text-gray-600">{card.question}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Answer:</h4>
                      <p className="text-gray-600">{card.answer}</p>
                    </div>
                    {card.tags && card.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {card.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      <p>Reviewed {card.reviewCount} times</p>
                      {card.lastReviewed && <p>Last reviewed: {card.lastReviewed.toLocaleDateString()}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Study Mode */}
          <TabsContent value="study" className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200/50 shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-blue-700">
                      Card {currentCardIndex + 1} of {filteredCards.length}
                    </CardTitle>
                    <p className="text-blue-600">Subject: {filteredCards[currentCardIndex]?.subject}</p>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(filteredCards[currentCardIndex]?.difficulty)}>
                    {filteredCards[currentCardIndex]?.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Question */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Question:</h3>
                  <div className="bg-white p-6 rounded-xl shadow-lg border-2 border-blue-200">
                    <p className="text-lg text-gray-700">{filteredCards[currentCardIndex]?.question}</p>
                  </div>
                </div>

                {/* Answer */}
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Answer:</h3>
                  <div
                    className={`bg-white p-6 rounded-xl shadow-lg border-2 transition-all duration-300 ${
                      showAnswer ? "border-green-200" : "border-gray-200"
                    }`}
                  >
                    {showAnswer ? (
                      <p className="text-lg text-gray-700">{filteredCards[currentCardIndex]?.answer}</p>
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <Button
                          onClick={() => setShowAnswer(true)}
                          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Reveal Answer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button onClick={prevCard} disabled={currentCardIndex === 0} variant="outline">
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => setShowAnswer(!showAnswer)}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      {showAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {showAnswer ? "Hide" : "Show"} Answer
                    </Button>
                    {showAnswer && (
                      <Button onClick={markAsReviewed} variant="outline" className="text-green-600">
                        <Star className="h-4 w-4 mr-2" />
                        Mark Reviewed
                      </Button>
                    )}
                  </div>

                  <Button onClick={nextCard} disabled={currentCardIndex === filteredCards.length - 1} variant="outline">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>

                {/* Progress */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentCardIndex + 1) / filteredCards.length) * 100}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
