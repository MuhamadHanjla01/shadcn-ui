import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Plus,
  Trash2,
  CheckCircle,
  GripVertical
} from 'lucide-react';
import { userData as initialUserData, skills as initialSkills, experiences as initialExperiences, achievements as initialAchievements } from '@/lib/data';
import { saveUserData, saveSkills, saveExperiences, saveAchievements, isRecentlySaved, loadUserData, loadSkills, loadExperiences, loadAchievements } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { saveAllDataToBackend, getDataFromBackend } from '@/lib/backend-api';
import { Skill, Experience, Achievement } from '@/types';
import { toast } from 'sonner';

const AboutEditor = () => {
  const [bio, setBio] = useState(initialUserData.bio);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [experiences, setExperiences] = useState<Experience[]>(initialExperiences);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    // Load data - prioritize backend API, fallback to localStorage/JSON files
    const loadLatestData = async () => {
      try {
        console.log('📥 Loading about data from backend API...');
        
        // Try to load from backend API first
        const [backendUserData, backendSkills, backendExperiences, backendAchievements] = await Promise.all([
          getDataFromBackend('user'),
          getDataFromBackend('skills'),
          getDataFromBackend('experiences'),
          getDataFromBackend('achievements')
        ]);
        
        let freshUserData, freshSkills, freshExperiences, freshAchievements;
        
        // Use backend data if available
        if (backendUserData) {
          freshUserData = backendUserData;
          saveUserData(backendUserData);
        } else {
          const userKey = 'portfolio_user_data';
          if (isRecentlySaved(userKey, 5)) {
            freshUserData = loadUserData(initialUserData);
          } else {
            freshUserData = await loadDataFromFile(DATA_FILES.user, userKey, initialUserData, true);
          }
        }
        
        if (backendSkills) {
          freshSkills = backendSkills;
          saveSkills(backendSkills);
        } else {
          const skillsKey = 'portfolio_skills';
          if (isRecentlySaved(skillsKey, 5)) {
            freshSkills = loadSkills(initialSkills);
          } else {
            freshSkills = await loadDataFromFile(DATA_FILES.skills, skillsKey, initialSkills, true);
          }
        }
        
        if (backendExperiences) {
          freshExperiences = backendExperiences;
          saveExperiences(backendExperiences);
        } else {
          const experiencesKey = 'portfolio_experiences';
          if (isRecentlySaved(experiencesKey, 5)) {
            freshExperiences = loadExperiences(initialExperiences);
          } else {
            freshExperiences = await loadDataFromFile(DATA_FILES.experiences, experiencesKey, initialExperiences, true);
          }
        }
        
        if (backendAchievements) {
          freshAchievements = backendAchievements;
          saveAchievements(backendAchievements);
        } else {
          const achievementsKey = 'portfolio_achievements';
          if (isRecentlySaved(achievementsKey, 5)) {
            freshAchievements = loadAchievements(initialAchievements);
          } else {
            freshAchievements = await loadDataFromFile(DATA_FILES.achievements, achievementsKey, initialAchievements, true);
          }
        }

        if (freshUserData) setBio(freshUserData.bio || initialUserData.bio);
        if (freshSkills) setSkills(freshSkills);
        if (freshExperiences) setExperiences(freshExperiences);
        if (freshAchievements) setAchievements(freshAchievements);
      } catch (error) {
        console.error('Error loading latest data:', error);
        // Fallback to localStorage on error
        const storedUserData = localStorage.getItem('portfolio_user_data');
        const storedSkills = localStorage.getItem('portfolio_skills');
        const storedExperiences = localStorage.getItem('portfolio_experiences');
        const storedAchievements = localStorage.getItem('portfolio_achievements');

        if (storedUserData) {
          try {
            setBio(JSON.parse(storedUserData).bio || initialUserData.bio);
          } catch (e) {}
        }
        if (storedSkills) {
          try {
            setSkills(JSON.parse(storedSkills));
          } catch (e) {}
        }
        if (storedExperiences) {
          try {
            setExperiences(JSON.parse(storedExperiences));
          } catch (e) {}
        }
        if (storedAchievements) {
          try {
            setAchievements(JSON.parse(storedAchievements));
          } catch (e) {}
        }
      }
    };

    loadLatestData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const userData = JSON.parse(localStorage.getItem('portfolio_user_data') || '{}');
      const updatedUserData = { ...userData, bio };
      saveUserData(updatedUserData);
      saveSkills(skills);
      saveExperiences(experiences);
      saveAchievements(achievements);
      
      // Save to backend API
      const saveResult = await saveAllDataToBackend({
        'user': updatedUserData,
        'skills': skills,
        'experiences': experiences,
        'achievements': achievements
      });
      
      if (saveResult.success) {
        toast.success('Changes saved successfully!', {
          description: 'Users will see updates in real-time via WebSocket'
        });
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        toast.error('Failed to save to backend', {
          description: saveResult.message
        });
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const addSkill = () => {
    setSkills([...skills, { name: '', level: 50, icon: '⭐' }]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string | number) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
  };

  const deleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addExperience = (type: 'work' | 'education') => {
    setExperiences([...experiences, {
      id: Date.now().toString(),
      title: '',
      company: '',
      period: '',
      description: '',
      type
    }]);
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const deleteExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addAchievement = () => {
    setAchievements([...achievements, {
      id: Date.now().toString(),
      title: '',
      description: '',
      date: new Date().getFullYear().toString(),
      icon: '🏆'
    }]);
  };

  const updateAchievement = (index: number, field: keyof Achievement, value: string) => {
    const updated = [...achievements];
    updated[index] = { ...updated[index], [field]: value };
    setAchievements(updated);
  };

  const deleteAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About Section Editor</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your bio, skills, experience, and achievements
          </p>
        </div>
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
              Save All Changes
            </>
          )}
        </Button>
      </div>

      {saveStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            About section updated successfully! Refresh the About page to see changes.
          </AlertDescription>
        </Alert>
      )}

      {/* Bio */}
      <Card>
        <CardHeader>
          <CardTitle>Biography</CardTitle>
          <CardDescription>Your professional bio that appears on the About page</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write your bio..."
            className="min-h-32"
          />
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Skills</CardTitle>
              <CardDescription>Your technical skills and proficiency levels</CardDescription>
            </div>
            <Button onClick={addSkill} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {skills.map((skill, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <GripVertical className="h-5 w-5 text-slate-400" />
              <Input
                placeholder="Skill name"
                value={skill.name}
                onChange={(e) => updateSkill(index, 'name', e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Icon"
                value={skill.icon}
                onChange={(e) => updateSkill(index, 'icon', e.target.value)}
                className="w-20"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={skill.level}
                onChange={(e) => updateSkill(index, 'level', parseInt(e.target.value))}
                className="w-24"
              />
              <Badge variant="secondary">{skill.level}%</Badge>
              <Button variant="ghost" size="sm" onClick={() => deleteSkill(index)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Experience & Education</CardTitle>
              <CardDescription>Your work experience and educational background</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => addExperience('work')} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Work
              </Button>
              <Button onClick={() => addExperience('education')} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Education
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {experiences.map((exp, index) => (
            <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant={exp.type === 'work' ? 'default' : 'secondary'}>
                  {exp.type === 'work' ? 'Work' : 'Education'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => deleteExperience(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Title/Degree</Label>
                  <Input
                    value={exp.title}
                    onChange={(e) => updateExperience(index, 'title', e.target.value)}
                    placeholder="e.g., Senior Developer"
                  />
                </div>
                <div>
                  <Label>Company/Institution</Label>
                  <Input
                    value={exp.company}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="e.g., Tech Corp"
                  />
                </div>
              </div>
              <div>
                <Label>Period</Label>
                <Input
                  value={exp.period}
                  onChange={(e) => updateExperience(index, 'period', e.target.value)}
                  placeholder="e.g., 2020 - Present"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Describe your role and achievements..."
                  className="min-h-20"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Achievements & Certifications</CardTitle>
              <CardDescription>Your awards, certifications, and notable achievements</CardDescription>
            </div>
            <Button onClick={addAchievement} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {achievements.map((achievement, index) => (
            <div key={achievement.id} className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <Input
                  value={achievement.icon}
                  onChange={(e) => updateAchievement(index, 'icon', e.target.value)}
                  placeholder="Icon"
                  className="w-20"
                />
                <Button variant="ghost" size="sm" onClick={() => deleteAchievement(index)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={achievement.title}
                    onChange={(e) => updateAchievement(index, 'title', e.target.value)}
                    placeholder="Achievement title"
                  />
                </div>
                <div>
                  <Label>Date/Year</Label>
                  <Input
                    value={achievement.date}
                    onChange={(e) => updateAchievement(index, 'date', e.target.value)}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={achievement.description}
                  onChange={(e) => updateAchievement(index, 'description', e.target.value)}
                  placeholder="Describe the achievement..."
                  className="min-h-20"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AboutEditor;