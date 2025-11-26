import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { FileText, Plus, Presentation } from "lucide-react";

// Dummy data for existing projects
const dummyProjects = [
  {
    id: 1,
    title: "Q4 Marketing Strategy",
    type: "word",
    description: "Comprehensive marketing plan for the fourth quarter including digital campaigns, social media strategy, and budget allocation...",
    createdAt: "2 days ago"
  },
  {
    id: 2,
    title: "Product Launch Presentation",
    type: "powerpoint",
    description: "Slide deck for the upcoming product launch event, featuring market analysis, product features, and go-to-market strategy...",
    createdAt: "5 days ago"
  },
  {
    id: 3,
    title: "Annual Report 2024",
    type: "word",
    description: "Complete annual report covering financial performance, key achievements, and strategic initiatives for stakeholders...",
    createdAt: "1 week ago"
  },
  {
    id: 4,
    title: "Team Training Slides",
    type: "powerpoint",
    description: "Interactive presentation for onboarding new team members with company culture, processes, and best practices...",
    createdAt: "2 weeks ago"
  },
  {
    id: 5,
    title: "Research Findings Document",
    type: "word",
    description: "Detailed analysis of user research including survey results, interviews, and actionable insights for product development...",
    createdAt: "3 weeks ago"
  }
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectTopic, setProjectTopic] = useState("");
  const [documentType, setDocumentType] = useState("");

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder logic - would create project here
    console.log({ projectTitle, projectTopic, documentType });
    setIsModalOpen(false);
    navigate("/editor");
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      
      <div className="flex-1 p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
            <p className="text-muted-foreground">
              AI-powered document authoring made simple
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Create New Project Card */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Card className="border-dashed border-2 hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <Plus className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">Create New Project</h3>
                    <p className="text-sm text-muted-foreground text-center">
                      Start a new document with AI
                    </p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                  <DialogDescription>
                    Let's get started with your new AI-powered document
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateProject} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-title">Project Title</Label>
                    <Input
                      id="project-title"
                      placeholder="Enter project title"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="project-topic">Topic / Prompt</Label>
                    <Textarea
                      id="project-topic"
                      placeholder="Describe what you want to create..."
                      value={projectTopic}
                      onChange={(e) => setProjectTopic(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="document-type">Document Type</Label>
                    <Select value={documentType} onValueChange={setDocumentType} required>
                      <SelectTrigger id="document-type" className="bg-background">
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover z-50">
                        <SelectItem value="word">Word Document</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Project
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Existing Projects */}
            {dummyProjects.map((project) => (
              <Card 
                key={project.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate("/editor")}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    {project.type === "word" ? (
                      <FileText className="w-5 h-5 text-primary" />
                    ) : (
                      <Presentation className="w-5 h-5 text-accent" />
                    )}
                    <span className="text-xs text-muted-foreground">{project.createdAt}</span>
                  </div>
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge 
                      variant={project.type === "word" ? "default" : "secondary"}
                      className={project.type === "word" ? "bg-primary" : "bg-accent"}
                    >
                      {project.type === "word" ? "Word" : "PowerPoint"}
                    </Badge>
                  </div>
                  <CardDescription className="mt-3 line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
