"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Edit3, Save, X, Camera } from "lucide-react"

interface EditProfileProps {
  user: any
  displayName: string
  onSave: (newDisplayName: string) => void
  onCancel: () => void
}

export default function EditProfile({ user, displayName, onSave, onCancel }: EditProfileProps) {
  const [newDisplayName, setNewDisplayName] = useState(displayName)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    if (!newDisplayName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Please enter a valid display name.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Update Firebase Auth profile
      if (user) {
        const { updateProfile } = await import("firebase/auth")
        await updateProfile(user, {
          displayName: newDisplayName.trim(),
        })
      }

      // Call the onSave callback
      onSave(newDisplayName.trim())

      toast({
        title: "Profile Updated! ✨",
        description: "Your display name has been updated successfully.",
      })
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    toast({
      title: "Feature Coming Soon! 📸",
      description: "Profile picture upload will be available in the next update.",
    })
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-5 w-5" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Picture */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
              <AvatarImage src={user?.photoURL || "/placeholder.svg?height=96&width=96"} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-2xl font-bold">
                {newDisplayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-lg transition-all duration-200 hover:scale-110">
              <Camera className="h-4 w-4" />
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
          </div>
          <p className="text-sm text-gray-500 text-center">Click the camera icon to change your profile picture</p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName" className="text-sm font-medium">
            Display Name
          </Label>
          <Input
            id="displayName"
            type="text"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder="Enter your display name"
            className="h-12"
            maxLength={50}
          />
          <p className="text-xs text-gray-500">This is how you'll appear throughout StudyHub Elite</p>
        </div>

        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-500">Email Address</Label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-gray-500">
            {user?.email || "Not available"}
          </div>
          <p className="text-xs text-gray-400">Email address cannot be changed</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading || !newDisplayName.trim() || newDisplayName === displayName}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
          <Button onClick={onCancel} variant="outline" disabled={isLoading} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
