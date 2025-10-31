import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Save, 
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Github,
  Star
} from 'lucide-react';
import { projects as initialProjects } from '@/lib/data';
import { saveProjects } from '@/lib/storage';
import { Project } from '@/types';
import { notificationService } from '@/lib/notification-service';

const ProjectsManager = () => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    const stored = localStorage.getItem('portfolio_projects');
    if (stored) setProjects(JSON.parse(stored));
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      saveProjects(projects);
      
      // Auto-commit to GitHub if enabled
      const { isGitHubSyncConfigured, exportAndCommitToGitHub } = await import('@/lib/github-sync');
      if (isGitHubSyncConfigured()) {
        try {
          const result = await exportAndCommitToGitHub(
            { 'projects': projects },
            'Update projects (automatic sync)'
          );
          
          if (result.success) {
            toast.success('Changes saved and published!', {
              description: 'Users will see updates in 1-2 minutes'
            });
          } else {
            toast.warning('Saved locally, but GitHub sync failed', {
              description: result.message
            });
          }
        } catch (error: any) {
          console.error('GitHub sync error:', error);
          toast.error('Failed to publish to GitHub', {
            description: error.message || 'Unknown error'
          });
        }
      } else {
        toast.success('Saved locally!', {
          description: 'Enable GitHub Auto-Sync to publish changes'
        });
      }
      
      setSaveStatus('success');
      
      // Add success notification
      notificationService.addNotification(
        'success',
        'Projects Saved',
        `Successfully updated ${projects.length} project${projects.length !== 1 ? 's' : ''}`,
        '/admin/projects'
      );
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving projects:', error);
      setSaveStatus('error');
      
      // Add error notification
      notificationService.addNotification(
        'warning',
        'Save Failed',
        'Failed to save projects. Please try again.',
        '/admin/projects'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop',
      techStack: [],
      githubUrl: '',
      liveUrl: '',
      featured: false,
      category: 'Web Application'
    };
    setProjects([newProject, ...projects]);
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
  };

  const deleteProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const updateTechStack = (index: number, techString: string) => {
    const techStack = techString.split(',').map(t => t.trim()).filter(t => t);
    updateProject(index, 'techStack', techStack);
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Projects Manager</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Add, edit, and manage your portfolio projects
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={addProject} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Project
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All
              </>
            )}
          </Button>
        </div>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Projects updated successfully! Refresh the Projects page to see changes.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-6">
        {projects.map((project, index) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader className="bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Project #{index + 1}</CardTitle>
                  {project.featured && (
                    <Badge className="bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteProject(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Project Title</Label>
                  <Input
                    value={project.title}
                    onChange={(e) => updateProject(index, 'title', e.target.value)}
                    placeholder="Project name"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input
                    value={project.category}
                    onChange={(e) => updateProject(index, 'category', e.target.value)}
                    placeholder="e.g., Web Application"
                  />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Describe your project..."
                  className="min-h-24"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Image URL</Label>
                  <Input
                    value={project.image}
                    onChange={(e) => updateProject(index, 'image', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label>Tech Stack (comma-separated)</Label>
                  <Input
                    value={project.techStack.join(', ')}
                    onChange={(e) => updateTechStack(index, e.target.value)}
                    placeholder="React, Node.js, MongoDB"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub URL
                  </Label>
                  <Input
                    value={project.githubUrl || ''}
                    onChange={(e) => updateProject(index, 'githubUrl', e.target.value)}
                    placeholder="https://github.com/..."
                  />
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Live Demo URL
                  </Label>
                  <Input
                    value={project.liveUrl || ''}
                    onChange={(e) => updateProject(index, 'liveUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={project.featured}
                  onCheckedChange={(checked) => updateProject(index, 'featured', checked)}
                />
                <Label>Featured Project</Label>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {project.techStack.map((tech, techIndex) => (
                  <Badge key={techIndex} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProjectsManager;