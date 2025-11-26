import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { Trash2, Sparkles, Loader2, X } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    doc_type: 'docx'
  });

  // Outline State (Bonus Feature)
  const [outline, setOutline] = useState<string[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/');
      setProjects(response.data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- BONUS FEATURE: AI SUGGEST OUTLINE ---
  const handleSuggestOutline = async () => {
    if (!newProject.description) {
      alert("Please enter a Main Topic first.");
      return;
    }
    setIsSuggesting(true);
    try {
      const response = await api.post('/generate-outline', {
        topic: newProject.description,
        doc_type: newProject.doc_type
      });
      // API returns { outline: ["Header 1", "Header 2"] }
      const cleanList = response.data.outline.filter((item: string) => item.trim() !== "");
      setOutline(cleanList);
    } catch (error) {
      alert("Failed to generate outline.");
    } finally {
      setIsSuggesting(false);
    }
  };

  const removeOutlineItem = (index: number) => {
    setOutline(outline.filter((_, i) => i !== index));
  };

  // --- CREATE PROJECT & SECTIONS ---
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // 1. Create the Project container
      const projectRes = await api.post('/projects/', {
        title: newProject.title,
        description: newProject.description,
        doc_type: newProject.doc_type
      });
      
      const projectId = projectRes.data.id;

      // 2. (Bonus) If we have an outline, create those sections automatically
      if (outline.length > 0) {
        await Promise.all(outline.map((heading, index) => 
          api.post(`/projects/${projectId}/sections`, {
            heading: heading,
            content: "", // Content starts empty
            order_index: index + 1
          })
        ));
      }

      setShowModal(false);
      navigate(`/editor/${projectId}`);
    } catch (error) {
      alert("Failed to create project.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      alert("Failed to delete project.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <header className="mx-auto max-w-6xl flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
          <p className="text-gray-500">Manage and generate your AI content</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors">Sign Out</button>
      </header>

      <main className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <div onClick={() => { setShowModal(true); setOutline([]); setNewProject({title:'', description:'', doc_type:'docx'}); }}
            className="group flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all"
          >
            <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            </div>
            <span className="font-semibold text-gray-600 group-hover:text-blue-700">New Project</span>
          </div>

          {projects.map((project) => (
            <div key={project.id} onClick={() => navigate(`/editor/${project.id}`)} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-shadow flex flex-col justify-between h-64 group relative">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${project.doc_type === 'pptx' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{project.doc_type}</span>
                  <button onClick={(e) => handleDelete(e, project.id)} className="text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">{project.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-3">{project.description}</p>
              </div>
              <div className="text-blue-600 text-sm font-medium mt-4 group-hover:underline">Open Editor &rarr;</div>
            </div>
          ))}
        </div>
      </main>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Project</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input type="text" required className="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="e.g. AI in Healthcare" value={newProject.title} onChange={(e) => setNewProject({...newProject, title: e.target.value})} />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Main Topic / Prompt</label>
                <textarea required className="w-full px-3 py-2 border border-gray-300 rounded-md h-20 resize-none" placeholder="Describe topic..." value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})} />
              </div>

              {/* AI SUGGEST BUTTON */}
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={handleSuggestOutline} 
                  disabled={isSuggesting || !newProject.description}
                  className="text-purple-600 text-sm font-medium flex items-center gap-1 hover:bg-purple-50 px-3 py-1 rounded-md disabled:opacity-50"
                >
                  {isSuggesting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
                  {isSuggesting ? "Thinking..." : "AI Suggest Outline"}
                </button>
              </div>

              {/* OUTLINE PREVIEW */}
              {outline.length > 0 && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Suggested Structure</p>
                  <ul className="space-y-2">
                    {outline.map((item, i) => (
                      <li key={i} className="flex items-center justify-between bg-white p-2 rounded border border-gray-100 text-sm">
                        <span>{i+1}. {item}</span>
                        <button type="button" onClick={() => removeOutlineItem(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4"/></button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md" value={newProject.doc_type} onChange={(e) => setNewProject({...newProject, doc_type: e.target.value})}>
                  <option value="docx">Word Document (.docx)</option>
                  <option value="pptx">PowerPoint Presentation (.pptx)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" disabled={isCreating} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2">
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;