"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  Plus,
  Clock,
  Lock,
  Unlock,
  Share2,
  UserPlus,
  Timer,
  MessageSquare,
  BookOpen,
  X,
  Loader2,
  Copy,
  Key,
  Send,
  Mic,
  MicOff,
  Shield,
  MoreVertical,
} from "lucide-react"
import { db } from "@/lib/firebase"
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  deleteDoc,
} from "firebase/firestore"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface StudyRoom {
  id: string
  name: string
  description: string
  subject: string
  isPrivate: boolean
  inviteCode?: string
  createdBy: string
  creatorName: string
  creatorPhotoURL?: string
  members: string[]
  memberNames: string[]
  memberPhotos: string[]
  mutedMembers: string[] // New field for muted users
  maxMembers: number
  timerDuration: number
  timerStartedAt?: any
  timerPausedAt?: any
  isPaused: boolean
  messages: Array<{
    id: string
    userId: string
    userName: string
    userPhotoURL?: string
    text: string
    timestamp: any
  }>
  sharedResources: Array<{
    id: string
    type: "flashcard" | "note" | "link"
    title: string
    content: string
    addedBy: string
    addedByName: string
  }>
  createdAt: any
}

interface StudyRoomsProps {
  user: any
}

export default function StudyRooms({ user }: StudyRoomsProps) {
  const [activeTab, setActiveTab] = useState("browse")
  const [publicRooms, setPublicRooms] = useState<StudyRoom[]>([])
  const [myRooms, setMyRooms] = useState<StudyRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<StudyRoom | null>(null)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showJoinByCodeDialog, setShowJoinByCodeDialog] = useState(false)
  const [inviteCode, setInviteCode] = useState("")
  const [newRoomData, setNewRoomData] = useState({
    name: "",
    description: "",
    subject: "",
    isPrivate: false,
    maxMembers: 5,
    timerDuration: 25,
  })
  const [newMessage, setNewMessage] = useState("")
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [newResource, setNewResource] = useState({
    type: "link" as "flashcard" | "note" | "link",
    title: "",
    content: "",
  })

  const { toast } = useToast()

  // Generate a random invite code
  const generateInviteCode = () => {
    return Math.random().toString(36).substr(2, 8).toUpperCase()
  }

  // Real-time listener for selected room updates
  useEffect(() => {
    if (!selectedRoom) return

    const roomRef = doc(db, "studyRooms", selectedRoom.id)
    const unsubscribe = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        const updatedRoom = { id: doc.id, ...doc.data() } as StudyRoom
        setSelectedRoom(updatedRoom)
      } else {
        // Room was deleted
        setSelectedRoom(null)
        toast({
          title: "Room Deleted",
          description: "This study room has been deleted.",
          variant: "destructive",
        })
      }
    })

    return () => unsubscribe()
  }, [selectedRoom?.id, toast])

  // Load study rooms
  useEffect(() => {
    setIsLoading(true)

    // Get public rooms
    const publicRoomsQuery = query(collection(db, "studyRooms"), where("isPrivate", "==", false))
    const unsubscribePublic = onSnapshot(publicRoomsQuery, (snapshot) => {
      const rooms: StudyRoom[] = []
      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as StudyRoom)
      })
      setPublicRooms(rooms)
      setIsLoading(false)
    })

    // Get rooms where user is a member
    const myRoomsQuery = query(collection(db, "studyRooms"), where("members", "array-contains", user.uid))
    const unsubscribeMy = onSnapshot(myRoomsQuery, (snapshot) => {
      const rooms: StudyRoom[] = []
      snapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() } as StudyRoom)
      })
      setMyRooms(rooms)
    })

    return () => {
      unsubscribePublic()
      unsubscribeMy()
    }
  }, [user.uid])

  // Create a new study room
  const createRoom = async () => {
    if (!newRoomData.name || !newRoomData.subject) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and subject for your study room.",
        variant: "destructive",
      })
      return
    }

    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const roomRef = doc(db, "studyRooms", roomId)

      const newRoom: Omit<StudyRoom, "id"> = {
        name: newRoomData.name,
        description: newRoomData.description,
        subject: newRoomData.subject,
        isPrivate: newRoomData.isPrivate,
        inviteCode: newRoomData.isPrivate ? generateInviteCode() : undefined,
        createdBy: user.uid,
        creatorName: user.displayName || user.email?.split("@")[0] || "User",
        creatorPhotoURL: user.photoURL || undefined,
        members: [user.uid],
        memberNames: [user.displayName || user.email?.split("@")[0] || "User"],
        memberPhotos: [user.photoURL || ""],
        mutedMembers: [], // Initialize empty muted members array
        maxMembers: newRoomData.maxMembers,
        timerDuration: newRoomData.timerDuration,
        isPaused: true,
        messages: [],
        sharedResources: [],
        createdAt: serverTimestamp(),
      }

      await setDoc(roomRef, newRoom)

      toast({
        title: "Study Room Created",
        description: newRoomData.isPrivate
          ? "Private room created! Share the invite code with friends."
          : "Your study room has been created successfully!",
      })

      setIsCreatingRoom(false)
      setNewRoomData({
        name: "",
        description: "",
        subject: "",
        isPrivate: false,
        maxMembers: 5,
        timerDuration: 25,
      })

      // Switch to My Rooms tab
      setActiveTab("my-rooms")
    } catch (error) {
      console.error("Error creating study room:", error)
      toast({
        title: "Error",
        description: "Failed to create study room. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Join room by invite code
  const joinByInviteCode = async () => {
    if (!inviteCode.trim()) {
      toast({
        title: "Missing Invite Code",
        description: "Please enter an invite code.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsJoiningRoom(true)

      // Find room by invite code
      const roomsQuery = query(collection(db, "studyRooms"), where("inviteCode", "==", inviteCode.toUpperCase()))
      const roomsSnapshot = (await new Promise((resolve, reject) => {
        const unsubscribe = onSnapshot(roomsQuery, resolve, reject)
        setTimeout(() => {
          unsubscribe()
          reject(new Error("Timeout"))
        }, 5000)
      })) as any

      if (roomsSnapshot.empty) {
        toast({
          title: "Invalid Invite Code",
          description: "No room found with this invite code.",
          variant: "destructive",
        })
        setIsJoiningRoom(false)
        return
      }

      const roomDoc = roomsSnapshot.docs[0]
      const room = { id: roomDoc.id, ...roomDoc.data() } as StudyRoom

      if (room.members.includes(user.uid)) {
        toast({
          title: "Already a Member",
          description: "You're already a member of this room!",
        })
        setSelectedRoom(room)
        setShowJoinByCodeDialog(false)
        setInviteCode("")
        setIsJoiningRoom(false)
        return
      }

      if (room.members.length >= room.maxMembers) {
        toast({
          title: "Room Full",
          description: "This study room has reached its maximum capacity.",
          variant: "destructive",
        })
        setIsJoiningRoom(false)
        return
      }

      const roomRef = doc(db, "studyRooms", room.id)
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
        memberNames: arrayUnion(user.displayName || user.email?.split("@")[0] || "User"),
        memberPhotos: arrayUnion(user.photoURL || ""),
      })

      toast({
        title: "Joined Study Room",
        description: `You have joined "${room.name}"!`,
      })

      setSelectedRoom(room)
      setShowJoinByCodeDialog(false)
      setInviteCode("")
      setIsJoiningRoom(false)
    } catch (error) {
      console.error("Error joining room by invite code:", error)
      toast({
        title: "Error",
        description: "Failed to join room. Please check the invite code and try again.",
        variant: "destructive",
      })
      setIsJoiningRoom(false)
    }
  }

  // Join a study room
  const joinRoom = async (room: StudyRoom) => {
    if (room.members.includes(user.uid)) {
      setSelectedRoom(room)
      return
    }

    if (room.members.length >= room.maxMembers) {
      toast({
        title: "Room Full",
        description: "This study room has reached its maximum capacity.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsJoiningRoom(true)
      const roomRef = doc(db, "studyRooms", room.id)

      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
        memberNames: arrayUnion(user.displayName || user.email?.split("@")[0] || "User"),
        memberPhotos: arrayUnion(user.photoURL || ""),
      })

      toast({
        title: "Joined Study Room",
        description: `You have joined "${room.name}"!`,
      })

      setSelectedRoom(room)
      setIsJoiningRoom(false)
    } catch (error) {
      console.error("Error joining study room:", error)
      toast({
        title: "Error",
        description: "Failed to join study room. Please try again.",
        variant: "destructive",
      })
      setIsJoiningRoom(false)
    }
  }

  // Leave a study room
  const leaveRoom = async (room: StudyRoom) => {
    try {
      const roomRef = doc(db, "studyRooms", room.id)

      // If user is the creator, delete the room
      if (room.createdBy === user.uid) {
        await deleteDoc(roomRef)
        toast({
          title: "Study Room Deleted",
          description: "Your study room has been deleted.",
        })
      } else {
        // Otherwise, remove user from members
        const memberName = user.displayName || user.email?.split("@")[0] || "User"
        const memberPhoto = user.photoURL || ""

        await updateDoc(roomRef, {
          members: arrayRemove(user.uid),
          memberNames: arrayRemove(memberName),
          memberPhotos: arrayRemove(memberPhoto),
          mutedMembers: arrayRemove(user.uid), // Remove from muted list too
        })

        toast({
          title: "Left Study Room",
          description: `You have left "${room.name}".`,
        })
      }

      setSelectedRoom(null)
    } catch (error) {
      console.error("Error leaving study room:", error)
      toast({
        title: "Error",
        description: "Failed to leave study room. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle mute status for a member (host only)
  const toggleMuteMember = async (memberId: string, memberName: string) => {
    if (!selectedRoom || selectedRoom.createdBy !== user.uid) return

    try {
      const roomRef = doc(db, "studyRooms", selectedRoom.id)
      const isMuted = selectedRoom.mutedMembers?.includes(memberId)

      if (isMuted) {
        // Unmute member
        await updateDoc(roomRef, {
          mutedMembers: arrayRemove(memberId),
        })
        toast({
          title: "Member Unmuted",
          description: `${memberName} can now send messages.`,
        })
      } else {
        // Mute member
        await updateDoc(roomRef, {
          mutedMembers: arrayUnion(memberId),
        })
        toast({
          title: "Member Muted",
          description: `${memberName} has been muted.`,
        })
      }
    } catch (error) {
      console.error("Error toggling mute:", error)
      toast({
        title: "Error",
        description: "Failed to update member status.",
        variant: "destructive",
      })
    }
  }

  // Send a message in the study room
  const sendMessage = async () => {
    if (!selectedRoom || !newMessage.trim()) return

    // Check if user is muted
    if (selectedRoom.mutedMembers?.includes(user.uid)) {
      toast({
        title: "You are muted",
        description: "The host has muted you from sending messages.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSendingMessage(true)
      const roomRef = doc(db, "studyRooms", selectedRoom.id)

      // Get current room data first
      const roomDoc = await getDoc(roomRef)
      if (!roomDoc.exists()) {
        toast({
          title: "Error",
          description: "This study room no longer exists.",
          variant: "destructive",
        })
        setSelectedRoom(null)
        setIsSendingMessage(false)
        return
      }

      const roomData = roomDoc.data() as Omit<StudyRoom, "id">
      const currentMessages = roomData.messages || []

      const newMessageObj = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.uid,
        userName: user.displayName || user.email?.split("@")[0] || "User",
        userPhotoURL: user.photoURL || undefined,
        text: newMessage,
        timestamp: new Date(),
      }

      // Update with the new messages array
      await updateDoc(roomRef, {
        messages: [...currentMessages, newMessageObj],
      })

      setNewMessage("")
      setIsSendingMessage(false)

      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully!",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
      setIsSendingMessage(false)
    }
  }

  // Add a shared resource to the study room
  const addResource = async () => {
    if (!selectedRoom || !newResource.title || !newResource.content) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and content for your resource.",
        variant: "destructive",
      })
      return
    }

    try {
      const roomRef = doc(db, "studyRooms", selectedRoom.id)

      const newResourceObj = {
        id: `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: newResource.type,
        title: newResource.title,
        content: newResource.content,
        addedBy: user.uid,
        addedByName: user.displayName || user.email?.split("@")[0] || "User",
      }

      await updateDoc(roomRef, {
        sharedResources: arrayUnion(newResourceObj),
      })

      toast({
        title: "Resource Added",
        description: "Your resource has been added to the study room.",
      })

      setIsAddingResource(false)
      setNewResource({
        type: "link",
        title: "",
        content: "",
      })
    } catch (error) {
      console.error("Error adding resource:", error)
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Start or pause the timer
  const toggleTimer = async () => {
    if (!selectedRoom) return

    try {
      const roomRef = doc(db, "studyRooms", selectedRoom.id)

      if (selectedRoom.isPaused) {
        // Start timer
        await updateDoc(roomRef, {
          timerStartedAt: serverTimestamp(),
          isPaused: false,
          timerPausedAt: null,
        })

        toast({
          title: "Timer Started",
          description: `Study session timer started for ${selectedRoom.timerDuration} minutes.`,
        })
      } else {
        // Pause timer
        await updateDoc(roomRef, {
          isPaused: true,
          timerPausedAt: serverTimestamp(),
        })

        toast({
          title: "Timer Paused",
          description: "Study session timer paused.",
        })
      }
    } catch (error) {
      console.error("Error toggling timer:", error)
      toast({
        title: "Error",
        description: "Failed to control timer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Reset the timer
  const resetTimer = async () => {
    if (!selectedRoom) return

    try {
      const roomRef = doc(db, "studyRooms", selectedRoom.id)

      await updateDoc(roomRef, {
        timerStartedAt: null,
        timerPausedAt: null,
        isPaused: true,
      })

      toast({
        title: "Timer Reset",
        description: "Study session timer has been reset.",
      })
    } catch (error) {
      console.error("Error resetting timer:", error)
      toast({
        title: "Error",
        description: "Failed to reset timer. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Copy invite code for private rooms
  const copyInviteCode = (room: StudyRoom) => {
    if (room.inviteCode) {
      navigator.clipboard.writeText(room.inviteCode)
      toast({
        title: "Invite Code Copied",
        description: `Share this code: ${room.inviteCode}`,
      })
    }
  }

  // Show invite options for a room
  const showInviteOptions = (room: StudyRoom) => {
    setSelectedRoom(room)
    setShowInviteDialog(true)
  }

  // Check if current user is the host
  const isHost = selectedRoom?.createdBy === user.uid

  // Check if user is muted
  const isUserMuted = (userId: string) => selectedRoom?.mutedMembers?.includes(userId) || false

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Study Rooms
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Collaborate with friends in real-time study sessions</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowJoinByCodeDialog(true)}
            variant="outline"
            className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Key className="h-5 w-5 mr-2" />
            Join by Code
          </Button>
          <Button
            onClick={() => setIsCreatingRoom(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Study Room
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="grid grid-cols-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg rounded-2xl p-1">
          <TabsTrigger
            value="browse"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            Browse Rooms
          </TabsTrigger>
          <TabsTrigger
            value="my-rooms"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-xl py-3 px-4 font-medium"
          >
            My Rooms
          </TabsTrigger>
        </TabsList>

        {/* Browse Rooms Tab */}
        <TabsContent value="browse" className="space-y-8 animate-in fade-in-50 duration-500">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : publicRooms.length === 0 ? (
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Public Rooms</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  There are no public study rooms available right now. Create your own room or join a private room with
                  an invite code!
                </p>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setShowJoinByCodeDialog(true)}
                    variant="outline"
                    className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Key className="h-5 w-5 mr-2" />
                    Join by Code
                  </Button>
                  <Button
                    onClick={() => setIsCreatingRoom(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Study Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicRooms.map((room) => (
                <Card
                  key={room.id}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {room.name}
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                          {room.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                      >
                        {room.subject}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                          <AvatarImage src={room.creatorPhotoURL || "/placeholder.svg?height=32&width=32"} />
                          <AvatarFallback className="bg-blue-500 text-white">
                            {room.creatorName?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Created by {room.creatorName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {room.members.length}/{room.maxMembers}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {room.timerDuration} min sessions
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(room.createdAt?.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Button
                      onClick={() => joinRoom(room)}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      disabled={isJoiningRoom}
                    >
                      {isJoiningRoom ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      {room.members.includes(user.uid) ? "Enter Room" : "Join Room"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Rooms Tab */}
        <TabsContent value="my-rooms" className="space-y-8 animate-in fade-in-50 duration-500">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : myRooms.length === 0 ? (
            <Card className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Study Rooms</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                  You haven't joined any study rooms yet. Browse public rooms, join with an invite code, or create your
                  own!
                </p>
                <div className="flex gap-4 mt-6">
                  <Button
                    onClick={() => setActiveTab("browse")}
                    variant="outline"
                    className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    Browse Rooms
                  </Button>
                  <Button
                    onClick={() => setShowJoinByCodeDialog(true)}
                    variant="outline"
                    className="border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                  >
                    <Key className="h-5 w-5 mr-2" />
                    Join by Code
                  </Button>
                  <Button
                    onClick={() => setIsCreatingRoom(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Room
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myRooms.map((room) => (
                <Card
                  key={room.id}
                  className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-800 dark:text-gray-200">
                          {room.name}
                        </CardTitle>
                        <CardDescription className="text-gray-500 dark:text-gray-400 mt-1">
                          {room.description || "No description provided"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                        >
                          {room.subject}
                        </Badge>
                        {room.isPrivate ? (
                          <Lock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <Unlock className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {room.members.length}/{room.maxMembers} members
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Timer className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{room.timerDuration} min</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedRoom(room)}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                      >
                        Enter Room
                      </Button>
                      <Button
                        onClick={() => showInviteOptions(room)}
                        variant="outline"
                        size="icon"
                        className="border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Join by Code Dialog */}
      <Dialog open={showJoinByCodeDialog} onOpenChange={setShowJoinByCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5 text-blue-600" />
              Join Private Room
            </DialogTitle>
            <DialogDescription>
              Enter the invite code shared by the room creator to join a private study room.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Invite Code</label>
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="Enter 8-character code (e.g., ABC12345)"
                className="mt-1 font-mono text-center text-lg tracking-wider"
                maxLength={8}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => {
                  setShowJoinByCodeDialog(false)
                  setInviteCode("")
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={joinByInviteCode}
                disabled={isJoiningRoom || !inviteCode.trim()}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isJoiningRoom ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Join Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Options Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-blue-600" />
              Invite Friends
            </DialogTitle>
            <DialogDescription>Share your study room with friends using these options.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedRoom?.isPrivate && selectedRoom?.inviteCode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Invite Code</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={selectedRoom.inviteCode}
                      readOnly
                      className="font-mono text-center text-lg tracking-wider bg-gray-50 dark:bg-gray-900"
                    />
                    <Button
                      onClick={() => copyInviteCode(selectedRoom)}
                      variant="outline"
                      size="icon"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Share this code with friends to let them join your private room
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Public Room Link</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={`${window.location.origin}/rooms/${selectedRoom?.id}`}
                      readOnly
                      className="text-sm bg-gray-50 dark:bg-gray-900"
                    />
                    <Button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/rooms/${selectedRoom?.id}`)
                        toast({
                          title: "Link Copied",
                          description: "Room link copied to clipboard!",
                        })
                      }}
                      variant="outline"
                      size="icon"
                      className="border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Anyone can join this public room using this link
                  </p>
                </div>
              </div>
            )}
            <Button
              onClick={() => setShowInviteDialog(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Room Dialog */}
      <Dialog open={isCreatingRoom} onOpenChange={setIsCreatingRoom}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Study Room</DialogTitle>
            <DialogDescription>Set up a new study room for collaborative learning sessions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Room Name</label>
              <Input
                value={newRoomData.name}
                onChange={(e) => setNewRoomData({ ...newRoomData, name: e.target.value })}
                placeholder="e.g., Math Study Group"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <Input
                value={newRoomData.description}
                onChange={(e) => setNewRoomData({ ...newRoomData, description: e.target.value })}
                placeholder="Brief description of your study room"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
              <Input
                value={newRoomData.subject}
                onChange={(e) => setNewRoomData({ ...newRoomData, subject: e.target.value })}
                placeholder="e.g., Mathematics, Physics, History"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Max Members</label>
                <Input
                  type="number"
                  min="2"
                  max="20"
                  value={newRoomData.maxMembers}
                  onChange={(e) => setNewRoomData({ ...newRoomData, maxMembers: Number.parseInt(e.target.value) || 5 })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Timer Duration (min)</label>
                <Input
                  type="number"
                  min="5"
                  max="120"
                  value={newRoomData.timerDuration}
                  onChange={(e) =>
                    setNewRoomData({ ...newRoomData, timerDuration: Number.parseInt(e.target.value) || 25 })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="private"
                checked={newRoomData.isPrivate}
                onChange={(e) => setNewRoomData({ ...newRoomData, isPrivate: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="private" className="text-sm text-gray-700 dark:text-gray-300">
                Make this room private (invite only)
              </label>
            </div>
            {newRoomData.isPrivate && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <Key className="h-4 w-4 inline mr-1" />
                  Private rooms get a unique invite code that you can share with friends.
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsCreatingRoom(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={createRoom}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                Create Room
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Study Room Interface Dialog */}
      {selectedRoom && (
        <Dialog open={!!selectedRoom} onOpenChange={() => setSelectedRoom(null)}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl flex items-center gap-2">
                    {selectedRoom.name}
                    {selectedRoom.isPrivate && <Lock className="h-5 w-5 text-gray-500" />}
                    {isHost && <Shield className="h-5 w-5 text-yellow-600" title="You are the host" />}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {selectedRoom.description} • {selectedRoom.subject}
                    {selectedRoom.isPrivate && selectedRoom.inviteCode && (
                      <span className="ml-2 font-mono text-blue-600">Code: {selectedRoom.inviteCode}</span>
                    )}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                    {selectedRoom.members.length}/{selectedRoom.maxMembers} members
                  </Badge>
                  <Button
                    onClick={() => leaveRoom(selectedRoom)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Leave
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Timer Section */}
              <div className="lg:col-span-1">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200/50 dark:border-blue-700/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Timer className="h-5 w-5 text-blue-600" />
                      Study Timer
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedRoom.timerDuration}:00
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedRoom.isPaused ? "Paused" : "Running"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={toggleTimer}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        {selectedRoom.isPaused ? "Start" : "Pause"}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        variant="outline"
                        className="border-gray-300 text-gray-600 hover:bg-gray-50"
                      >
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Members Section */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-600" />
                      Members
                      {isHost && <span className="text-xs text-gray-500">(Host Controls)</span>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedRoom.memberNames.map((memberName, index) => {
                        const memberId = selectedRoom.members[index]
                        const isMuted = isUserMuted(memberId)
                        const isMemberHost = memberId === selectedRoom.createdBy

                        return (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-white dark:border-gray-800">
                                <AvatarImage
                                  src={selectedRoom.memberPhotos[index] || "/placeholder.svg?height=32&width=32"}
                                />
                                <AvatarFallback className="bg-purple-500 text-white">
                                  {memberName?.charAt(0) || "U"}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                  {memberName}
                                  {isMemberHost && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-yellow-100 text-yellow-700 border-yellow-200"
                                    >
                                      Host
                                    </Badge>
                                  )}
                                  {isMuted && (
                                    <Badge variant="outline" className="text-xs bg-red-100 text-red-700 border-red-200">
                                      Muted
                                    </Badge>
                                  )}
                                </span>
                              </div>
                            </div>
                            {isHost && !isMemberHost && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuItem
                                    onClick={() => toggleMuteMember(memberId, memberName)}
                                    className="flex items-center gap-2"
                                  >
                                    {isMuted ? (
                                      <>
                                        <Mic className="h-4 w-4" />
                                        Unmute
                                      </>
                                    ) : (
                                      <>
                                        <MicOff className="h-4 w-4" />
                                        Mute
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chat and Resources Section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Chat Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-green-600" />
                      Chat
                      {isUserMuted(user.uid) && (
                        <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                          You are muted
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50 dark:bg-gray-900/50">
                        {selectedRoom.messages.length === 0 ? (
                          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            No messages yet. Start the conversation!
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {selectedRoom.messages.map((message) => (
                              <div key={message.id} className="flex items-start gap-3">
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={message.userPhotoURL || "/placeholder.svg?height=24&width=24"} />
                                  <AvatarFallback className="bg-blue-500 text-white text-xs">
                                    {message.userName?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                      {message.userName}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {message.timestamp?.toDate?.()?.toLocaleTimeString() ||
                                        new Date(message.timestamp).toLocaleTimeString()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{message.text}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder={isUserMuted(user.uid) ? "You are muted by the host" : "Type a message..."}
                          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                          className="flex-1"
                          disabled={isUserMuted(user.uid)}
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={isSendingMessage || !newMessage.trim() || isUserMuted(user.uid)}
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                        >
                          {isSendingMessage ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Shared Resources Section */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-orange-600" />
                        Shared Resources
                      </CardTitle>
                      <Button
                        onClick={() => setIsAddingResource(true)}
                        size="sm"
                        variant="outline"
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedRoom.sharedResources.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                        No shared resources yet. Add some to help your study group!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {selectedRoom.sharedResources.map((resource) => (
                          <div key={resource.id} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-900/50">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-800 dark:text-gray-200">{resource.title}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{resource.content}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Added by {resource.addedByName}
                                </p>
                              </div>
                              <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-200">
                                {resource.type}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Resource Dialog */}
      <Dialog open={isAddingResource} onOpenChange={setIsAddingResource}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shared Resource</DialogTitle>
            <DialogDescription>Share a helpful resource with your study group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Resource Type</label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="link">Link</option>
                <option value="note">Note</option>
                <option value="flashcard">Flashcard</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
              <Input
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="e.g., Helpful Math Formula"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {newResource.type === "link" ? "URL" : "Content"}
              </label>
              <Input
                value={newResource.content}
                onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                placeholder={newResource.type === "link" ? "https://example.com" : "Enter your content here..."}
                className="mt-1"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={() => setIsAddingResource(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={addResource}
                className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
              >
                Add Resource
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
