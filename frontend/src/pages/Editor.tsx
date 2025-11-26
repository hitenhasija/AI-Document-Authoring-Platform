import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Navigation from "@/components/Navigation";
import { Sparkles, Download, Plus, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import ReactMarkdown from 'react-markdown';

interface Section {
  id: number;
  heading: string;
  content: string;
  order_index: number;
}

interface Project {
  id: number;
  title: string;
  doc_type: string;
  sections: Section[];
}

const Editor = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
  
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [newSectionTitle, setNewSectionTitle] = useState("");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      if (res.data.sections.length > 0 && !activeSectionId) {
        setActiveSectionId(res.data.sections[0].id);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !project) return;
    
    setIsGenerating(true);
    try {
      const maxOrder = project.sections.length > 0 
        ? Math.max(...project.sections.map(s => s.order_index)) 
        : 0;

      await api.post(`/projects/${id}/sections`, {
        heading: newSectionTitle,
        content: "",
        order_index: maxOrder + 1
      });

      setNewSectionTitle("");
      await loadProject();
    } catch (error) {
      alert("Failed to generate section.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refinementPrompt.trim() || !activeSectionId) return;
    
    setIsRefining(true);
    try {
      await api.put(`/sections/${activeSectionId}/refine?instruction=${encodeURIComponent(refinementPrompt)}`);
      setRefinementPrompt("");
      await loadProject();
    } catch (error) {
      alert("Refinement failed.");
    } finally {
      setIsRefining(false);
    }
  };

  const handleDownload = async () => {
    if (!project) return;
    try {
      const res = await api.get(`/projects/${id}/export`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${project.title}.${project.doc_type}`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      alert("Download failed.");
    }
  };

  const activeSection = project?.sections.find(s => s.id === activeSectionId);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading your document...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 border-r border-border bg-card flex flex-col shrink-0">
          <div className="p-4 border-b border-border bg-muted/10">
            <h2 className="font-bold text-lg truncate">{project?.title}</h2>
            <div className="flex items-center gap-2 mt-1">
                <FileText className="w-3 h-3 text-muted-foreground"/>
                <p className="text-xs text-muted-foreground uppercase">{project?.doc_type}</p>
            </div>
            
            {/* BACKUP DOWNLOAD BUTTON (In Sidebar) */}
            <Button 
                onClick={handleDownload} 
                variant="outline" 
                size="sm" 
                className="w-full mt-3 border-green-200 text-green-700 hover:bg-green-50"
            >
                <Download className="w-3 h-3 mr-2" />
                Download {project?.doc_type.toUpperCase()}
            </Button>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {project?.sections.sort((a,b) => a.order_index - b.order_index).map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSectionId(section.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200",
                    activeSectionId === section.id
                      ? "bg-primary text-primary-foreground font-medium shadow-sm"
                      : "hover:bg-muted text-foreground/80"
                  )}
                >
                  <span className="opacity-50 mr-2">{section.order_index}.</span>
                  {section.heading}
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t border-border bg-background">
            <form onSubmit={handleAddSection} className="flex flex-col gap-2">
              <label className="text-xs font-medium text-muted-foreground">Add New Section</label>
              <div className="flex gap-2">
                <Input
                    placeholder="e.g. Conclusion..."
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="h-9 text-sm"
                />
                <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isGenerating}>
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-background">
          {/* Header */}
          <header className="h-16 border-b border-border px-6 flex items-center justify-between w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
            <h1 className="text-lg font-semibold truncate max-w-xl text-foreground/90">
              {activeSection ? activeSection.heading : "Select a section to edit"}
            </h1>
            
            <Button 
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Export File
            </Button>
          </header>

          <ScrollArea className="flex-1 p-8">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card rounded-xl border border-border/50 shadow-sm min-h-[60vh] p-8 md:p-12">
                {activeSection ? (
                  <div className="prose prose-slate max-w-none text-gray-900">
                    <ReactMarkdown 
                      components={{
                        // Force bullet points to be visible and properly spaced
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 my-4 space-y-2 text-gray-900" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-6 my-4 space-y-2 text-gray-900" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        // Force paragraphs to be readable
                        p: ({node, ...props}) => <p className="mb-4 leading-7 text-gray-900" {...props} />,
                        // Force bold text to be dark
                        strong: ({node, ...props}) => <strong className="font-bold text-black" {...props} />,
                        // Headings
                        h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-black" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-black" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-black" {...props} />,
                      }}
                    >
                      {activeSection.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground min-h-[40vh]">
                    <Sparkles className="w-12 h-12 mb-4 opacity-20" />
                    <p>Select a section to view generated content</p>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <div className="border-t border-border bg-muted/10 px-6 py-4">
            <div className="max-w-3xl mx-auto flex gap-3">
              <div className="relative flex-1">
                <Sparkles className="absolute left-3 top-3 h-4 w-4 text-purple-500 animate-pulse" />
                <Input
                  placeholder="AI Instruction: 'Make it shorter', 'Add bullets', 'Professional tone'..."
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  disabled={!activeSection}
                  className="pl-9 bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleRefine();
                  }}
                />
              </div>
              <Button 
                onClick={handleRefine}
                disabled={!refinementPrompt.trim() || isRefining || !activeSection}
                className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]"
              >
                {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : "Refine"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;