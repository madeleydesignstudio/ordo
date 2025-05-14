import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import { X, Image, Smile } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

interface AddProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function AddProjectDialog({ isOpen, onOpenChange }: AddProjectDialogProps) {
  const queryClient = useQueryClient();
  
  // State for new project
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    icon: "📁", // Default icon
    bannerImage: "", // URL for the banner image
  });

  // State for managing UI
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  // Handle emoji selection
  const onEmojiClick = (emojiData: EmojiClickData) => {
    setNewProject({
      ...newProject,
      icon: emojiData.emoji,
    });
    setShowEmojiPicker(false);
  };

  // Handle file dropping for banner image
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        // For preview
        const previewUrl = URL.createObjectURL(acceptedFiles[0]);
        setBannerPreview(previewUrl);
        
        // In a real app, you'd upload this to a storage service and get back a URL
        // For now, we'll simulate this by storing the object URL
        // Note: In production, you would upload to S3/Cloudinary/etc and store the URL
        setNewProject({
          ...newProject,
          bannerImage: previewUrl
        });
      }
    }
  });

  const removeBanner = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview(null);
    setNewProject({
      ...newProject,
      bannerImage: ""
    });
  };

  // Create project mutation
  const createProject = async () => {
    try {
      // In a real app with file uploads, you would first upload the file, then save the URL
      // For example:
      // const bannerUrl = await uploadFileToStorage(bannerFile);
      
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProject),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onOpenChange(false);
      
      // Clean up any object URLs to prevent memory leaks
      if (bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }
      
      // Reset form
      setNewProject({ name: "", description: "", icon: "📁", bannerImage: "" });
      setBannerPreview(null);
      
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Banner Image Upload */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Banner</Label>
            <div className="col-span-3">
              {bannerPreview ? (
                <div className="relative h-32 w-full overflow-hidden rounded-md">
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="h-full w-full object-cover"
                  />
                  <button 
                    onClick={removeBanner}
                    className="absolute right-2 top-2 rounded-full bg-black/60 p-1 cursor-pointer"
                    type="button"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              ) : (
                <div 
                  {...getRootProps()} 
                  className={`cursor-pointer border-2 border-dashed rounded-md p-6 text-center hover:bg-neutral-100/5 transition-colors ${
                    isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-600'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Image className="mx-auto h-8 w-8 text-neutral-500" />
                  <p className="mt-2 text-sm text-neutral-400">
                    Drag & drop an image, or click to select
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Project Icon */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Icon</Label>
            <div className="col-span-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-600 text-xl">
                {newProject.icon}
              </div>
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="cursor-pointer flex gap-2"
                    size="sm"
                  >
                    <Smile className="h-4 w-4" />
                    Select emoji
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          {/* Project Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              className="col-span-3 cursor-text"
              required
            />
          </div>
          
          {/* Project Description */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              className="col-span-3 cursor-text"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button 
            onClick={createProject} 
            className="cursor-pointer"
            disabled={!newProject.name}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
