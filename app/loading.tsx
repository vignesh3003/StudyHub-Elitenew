import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Loading StudyHub Elite</h2>
          <p className="text-sm text-muted-foreground text-center">Preparing your learning experience...</p>
        </CardContent>
      </Card>
    </div>
  )
}
