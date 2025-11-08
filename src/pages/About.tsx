import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Download, Award, GraduationCap, Briefcase } from 'lucide-react';
import { userData as initialUserData, skills as initialSkills, experiences as initialExperiences, achievements as initialAchievements } from '@/lib/data';
import { loadUserData, loadSkills, loadExperiences, loadAchievements, trackPageView } from '@/lib/storage';
import { loadDataFromFile, DATA_FILES } from '@/lib/data-sync';
import { checkForUpdates } from '@/lib/realtime-sync';
import { getDataFromBackend } from '@/lib/backend-api';

const About = () => {
  const [userData, setUserData] = useState(initialUserData);
  const [skills, setSkills] = useState(initialSkills);
  const [experiences, setExperiences] = useState(initialExperiences);
  const [achievements, setAchievements] = useState(initialAchievements);

  const handleResumeDownload = async (e: any) => {
    if (!userData.resume) {
      console.warn('No resume file available');
      e.preventDefault();
      return;
    }
    
    // Handle data URL (base64 encoded PDF)
    if (typeof userData.resume === 'string' && userData.resume.startsWith('data:')) {
      e.preventDefault();
      try {
        console.log('Downloading resume from data URL...');
        const res = await fetch(userData.resume);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        console.log('✅ Resume downloaded successfully');
      } catch (err) {
        console.error('Failed to download resume:', err);
        alert('Failed to download resume. Please try again.');
      }
    }
    // Handle external URL or path
    else if (typeof userData.resume === 'string') {
      // Let the browser handle the download naturally
      console.log('Downloading resume from URL:', userData.resume);
    }
  };

  useEffect(() => {
    // Track page view
    trackPageView('about');

    // Load data ONLY from backend - no localStorage or JSON fallback!
    const loadData = async () => {
      console.log('📥 Loading about data from backend only (no cache)...');
      
      try {
        // ONLY load from backend API
        const [backendUserData, backendSkills, backendExperiences, backendAchievements] = await Promise.all([
          getDataFromBackend('user'),
          getDataFromBackend('skills'),
          getDataFromBackend('experiences'),
          getDataFromBackend('achievements')
        ]);
        
        // Use backend data or fallback to initial defaults (NOT localStorage)
        const userData = (backendUserData as typeof initialUserData) || initialUserData;
        const skills = (backendSkills as typeof initialSkills) || initialSkills;
        const experiences = (backendExperiences as typeof initialExperiences) || initialExperiences;
        const achievements = (backendAchievements as typeof initialAchievements) || initialAchievements;
        
        console.log('✅ Loaded fresh data from backend:', {
          user: userData.name,
          skills: skills.length,
          experiences: experiences.length,
          achievements: achievements.length,
          timestamp: new Date().toISOString()
        });
        
        setUserData(userData);
        setSkills(skills);
        setExperiences(experiences);
        setAchievements(achievements);
      } catch (error) {
        console.error('❌ Error loading data from backend:', error);
        // Use initial defaults if backend fails
        setUserData(initialUserData);
        setSkills(initialSkills);
        setExperiences(initialExperiences);
        setAchievements(initialAchievements);
      }
    };

    loadData();

    // Listen for WebSocket updates from admin panel
    const handleDataUpdate = async (event?: any) => {
      console.log('🔄 Data update event received on About page:', event?.detail);
      
      // If real-time sync update detected, use data from event or fetch from backend
      if (event?.detail?.source === 'realtime-sync') {
        console.log('📥 Real-time sync update detected');
        
        // If event contains the data directly, use it immediately
        const eventData = event?.detail?.data;
        if (eventData) {
          console.log('✅ Using data from WebSocket event:', Object.keys(eventData));
          
          if (eventData.user) {
            setUserData(eventData.user as typeof initialUserData);
            console.log('✅ Updated user');
          }
          if (eventData.skills) {
            setSkills(eventData.skills as typeof initialSkills);
            console.log('✅ Updated skills:', (eventData.skills as any[]).length);
          }
          if (eventData.experiences) {
            setExperiences(eventData.experiences as typeof initialExperiences);
            console.log('✅ Updated experiences:', (eventData.experiences as any[]).length);
          }
          if (eventData.achievements) {
            setAchievements(eventData.achievements as typeof initialAchievements);
            console.log('✅ Updated achievements:', (eventData.achievements as any[]).length);
          }
        }
        return;
      }
      
      // Otherwise reload data from backend
      console.log('📥 Reloading data from backend...');
      loadData();
    };
    window.addEventListener('portfolioDataUpdated', handleDataUpdate);
    
    return () => {
      window.removeEventListener('portfolioDataUpdated', handleDataUpdate);
    };
  }, []);

  const workExperience = experiences.filter(exp => exp.type === 'work');
  const education = experiences.filter(exp => exp.type === 'education');

  return (
    <div className="min-h-screen py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Hero Section */}
        <section className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent">
              About Me
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {userData.bio}
            </p>
          </div>
          
          <div className="flex justify-center">
            <a href={userData.resume} download={userData.resume?.startsWith('data:') ? 'resume.pdf' : undefined} onClick={handleResumeDownload}>
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                <Download className="mr-2 h-5 w-5" />
                Download Resume
              </Button>
            </a>
          </div>
        </section>

        {/* Skills Section */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Skills & Expertise
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Technologies and tools I work with to bring ideas to life
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {skills.map((skill, index) => (
              <Card key={index} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{skill.icon}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {skill.name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                      {skill.level}%
                    </Badge>
                  </div>
                  <Progress value={skill.level} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Experience Timeline */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Experience & Education
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              My professional journey and educational background
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Work Experience */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <Briefcase className="h-6 w-6 text-blue-600" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Work Experience
                </h3>
              </div>
              
              <div className="space-y-6">
                {workExperience.map((exp) => (
                  <Card key={exp.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {exp.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <p className="text-blue-600 dark:text-blue-400 font-semibold">
                          {exp.company}
                        </p>
                        <Badge variant="outline" className="w-fit">
                          {exp.period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {exp.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 mb-6">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Education
                </h3>
              </div>
              
              <div className="space-y-6">
                {education.map((edu) => (
                  <Card key={edu.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="text-xl text-slate-900 dark:text-white">
                        {edu.title}
                      </CardTitle>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <p className="text-indigo-600 dark:text-indigo-400 font-semibold">
                          {edu.company}
                        </p>
                        <Badge variant="outline" className="w-fit">
                          {edu.period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                        {edu.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Award className="h-8 w-8 text-yellow-600" />
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
                Achievements & Certifications
              </h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Recognition and certifications that validate my expertise
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border-white/20 dark:border-slate-700/20 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 hover:scale-105 text-center">
                <CardHeader>
                  <div className="text-4xl mb-4">{achievement.icon}</div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">
                    {achievement.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300 mb-4">
                    {achievement.description}
                  </p>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200">
                    {achievement.date}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;