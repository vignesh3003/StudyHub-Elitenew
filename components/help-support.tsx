"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { HelpCircle, Mail, MessageSquare, Bug, Lightbulb, Heart, Send, X, ExternalLink } from "lucide-react"

interface HelpSupportProps {
  isOpen: boolean
  onClose: () => void
  user: any
}

export function HelpSupport({ isOpen, onClose, user }: HelpSupportProps) {
  const [formData, setFormData] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    subject: "",
    category: "general",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const categories = [
    { value: "bug", label: "🐛 Bug Report", icon: Bug },
    { value: "feature", label: "💡 Feature Request", icon: Lightbulb },
    { value: "help", label: "❓ Need Help", icon: HelpCircle },
    { value: "general", label: "💬 General Inquiry", icon: MessageSquare },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create email content
      const emailSubject = `StudyHub Elite - ${formData.category.toUpperCase()}: ${formData.subject}`
      const emailBody = `
Hello Vignesh,

A user has submitted a ${formData.category} request through StudyHub Elite:

📧 User Details:
- Name: ${formData.name}
- Email: ${formData.email}
- User ID: ${user?.uid || "Not logged in"}

📝 Request Details:
- Category: ${formData.category.toUpperCase()}
- Subject: ${formData.subject}

💬 Message:
${formData.message}

---
Sent from StudyHub Elite Help System
Time: ${new Date().toLocaleString()}
      `.trim()

      // Create mailto link
      const mailtoLink = `mailto:vigneshrr2005@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`

      // Open email client
      window.open(mailtoLink, "_blank")

      toast({
        title: "Email Client Opened! 📧",
        description: "Your default email app should open with the pre-filled message. Just hit send!",
      })

      // Reset form
      setFormData({
        name: user?.displayName || "",
        email: user?.email || "",
        subject: "",
        category: "general",
        message: "",
      })

      // Close modal after a short delay
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error("Error opening email client:", error)
      toast({
        title: "Error",
        description: "Could not open email client. Please email vigneshrr2005@gmail.com directly.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <HelpCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl">Help & Support</CardTitle>
                <CardDescription>Get help with StudyHub Elite or send feedback</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => window.open("mailto:vigneshrr2005@gmail.com", "_blank")}
            >
              <Mail className="h-6 w-6 text-blue-500" />
              <div className="text-center">
                <div className="font-medium">Direct Email</div>
                <div className="text-sm text-gray-500">vigneshrr2005@gmail.com</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => {
                const subject = "StudyHub Elite - Quick Question"
                const body = `Hi Vignesh,\n\nI have a quick question about StudyHub Elite:\n\n[Your question here]\n\nThanks!\n${user?.displayName || "A user"}`
                window.open(
                  `mailto:vigneshrr2005@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
                  "_blank",
                )
              }}
            >
              <MessageSquare className="h-6 w-6 text-green-500" />
              <div className="text-center">
                <div className="font-medium">Quick Question</div>
                <div className="text-sm text-gray-500">Pre-filled template</div>
              </div>
            </Button>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <Button
                      key={category.value}
                      type="button"
                      variant={formData.category === category.value ? "default" : "outline"}
                      className="h-auto p-3 flex flex-col items-center gap-1 text-xs"
                      onClick={() => handleInputChange("category", category.value)}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-center leading-tight">{category.label.split(" ").slice(1).join(" ")}</span>
                    </Button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                placeholder="Brief description of your request"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleInputChange("message", e.target.value)}
                placeholder="Describe your issue, question, or feedback in detail..."
                rows={5}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Opening Email Client...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send via Email
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-current" />
              <span>by Vignesh</span>
              <span>•</span>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-sm text-blue-500 hover:text-blue-600"
                onClick={() => window.open("mailto:vigneshrr2005@gmail.com", "_blank")}
              >
                Contact Developer
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
