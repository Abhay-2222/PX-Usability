"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Bot, Loader2 } from "lucide-react"
import ReactMarkdown from "react-markdown"

function SubmitButton({ isLoading }: { isLoading: boolean }) {
  return (
    <Button type="submit" disabled={isLoading} className="w-full">
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        "Analyze Usability"
      )}
    </Button>
  )
}

// Helper function to read file as Base64
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      // Stripping the data URL prefix, e.g., "data:image/png;base64,"
      const base64String = (reader.result as string).split(",")[1]
      resolve(base64String)
    }
    reader.onerror = (error) => reject(error)
  })

export default function UsabilityTester() {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreview(null)
      setSelectedFile(null)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFile) {
      setError("Please select an image to upload.")
      return
    }

    setIsLoading(true)
    setError(null)
    setAnalysis(null)

    try {
      const imageBase64 = await toBase64(selectedFile)

      const response = await fetch("https://v0-n8n-dashboard-omega.vercel.app/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64 }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "An unknown error occurred.")
      }

      setAnalysis(result.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get analysis.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Design</CardTitle>
          <CardDescription>
            Upload a screenshot of a UI to get an expert usability analysis from Gemini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="image-upload"
                className="block aspect-video w-full cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {preview ? (
                  <img
                    src={preview || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center space-y-2">
                    <Upload className="mx-auto h-8 w-8" />
                    <p>Click to upload or drag and drop</p>
                    <p className="text-xs">PNG, JPG, or WEBP</p>
                  </div>
                )}
              </label>
              <input
                id="image-upload"
                name="image"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
              />
            </div>
            <SubmitButton isLoading={isLoading} />
          </form>
        </CardContent>
      </Card>

      <Card className="sticky top-20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot />
            AI Analysis
          </div>
          <CardDescription>The usability report from Gemini will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[300px] prose prose-sm dark:prose-invert max-w-none">
          {isLoading && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <p>Getting analysis from n8n...</p>
            </div>
          )}
          {analysis && <ReactMarkdown>{analysis}</ReactMarkdown>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !analysis && !error && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Awaiting analysis...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
