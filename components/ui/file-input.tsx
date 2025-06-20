"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /**
   * Visible label text rendered next to the button.
   * If omitted, a default label of “Choose file” is used.
   */
  label?: string
  /**
   * Show a list of the selected file names under the control.
   * Defaults to true.
   */
  showSelected?: boolean
}

export const FileInput = React.forwardRef<HTMLInputElement, FileInputProps>(
  ({ className, label = "Choose file", multiple = false, accept, showSelected = true, ...props }, ref) => {
    const [files, setFiles] = React.useState<File[]>([])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = Array.from(e.target.files ?? [])
      setFiles(f)
      props.onChange?.(e)
    }

    return (
      <div className={cn("flex flex-col gap-2", className)}>
        <label
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          {label}
          <input
            ref={ref}
            type="file"
            multiple={multiple}
            accept={accept}
            onChange={handleChange}
            {...props}
            className="sr-only"
          />
        </label>

        {showSelected && files.length > 0 && (
          <ul className="space-y-0.5 text-sm text-muted-foreground">
            {files.map((file) => (
              <li key={file.name}>{file.name}</li>
            ))}
          </ul>
        )}
      </div>
    )
  },
)

FileInput.displayName = "FileInput"
