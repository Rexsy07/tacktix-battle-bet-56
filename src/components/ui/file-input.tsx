
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileInputProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
}

export const FileInput = ({
  file,
  onFileChange,
  disabled = false,
  accept = "image/*",
  maxSize = 5, // 5MB default
  className,
}: FileInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      // Check file size (convert maxSize from MB to bytes)
      if (selectedFile.size > maxSize * 1024 * 1024) {
        setError(`File size exceeds ${maxSize}MB limit`);
        return;
      }
    }
    
    onFileChange(selectedFile);
  };

  const handleClearFile = () => {
    onFileChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="file-upload">Upload File</Label>
      
      {!file ? (
        // File selection UI
        <div className="relative">
          <Input
            ref={inputRef}
            id="file-upload"
            type="file"
            accept={accept}
            onChange={handleFileChange}
            disabled={disabled}
            className="absolute inset-0 opacity-0 cursor-pointer z-10 h-full"
            tabIndex={-1}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full flex items-center justify-center gap-2 h-20"
            disabled={disabled}
          >
            <Upload className="h-5 w-5" />
            <span>Select File</span>
          </Button>
        </div>
      ) : (
        // Selected file UI
        <div className="flex items-center gap-3 p-3 border border-border rounded-md bg-background">
          <div className="bg-muted rounded-md p-2">
            <File className="h-6 w-6 text-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {(file.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClearFile}
            disabled={disabled}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};
