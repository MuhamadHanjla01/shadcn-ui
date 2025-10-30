import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';
import { loadUserData, loadSkills, loadExperiences, loadAchievements, loadProjects, loadBlogPosts, loadStats, loadSiteSettings, loadThemeSettings } from './storage';
import portfolioDataJson from './portfolio-data.json';

// Load default data from JSON file (deployed version - everyone sees this)
const defaultUserData: User = portfolioDataJson.userData as User;
const defaultSkills: Skill[] = portfolioDataJson.skills as Skill[];
const defaultExperiences: Experience[] = portfolioDataJson.experiences as Experience[];
const defaultAchievements: Achievement[] = portfolioDataJson.achievements as Achievement[];
const defaultProjects: Project[] = portfolioDataJson.projects as Project[];
const defaultBlogPosts: BlogPost[] = portfolioDataJson.blogPosts as BlogPost[];
const defaultStats: Stat[] = portfolioDataJson.stats as Stat[];

// Verify data loaded
console.log('📦 Portfolio data loaded from JSON file');
console.log('👤 User:', defaultUserData.name);
console.log('🚀 Projects:', defaultProjects.length);
console.log('📝 Blog posts:', defaultBlogPosts.length);

// Export data with localStorage fallback
export const userData: User = loadUserData(defaultUserData);
export const skills: Skill[] = loadSkills(defaultSkills);
export const experiences: Experience[] = loadExperiences(defaultExperiences);
export const achievements: Achievement[] = loadAchievements(defaultAchievements);
export const projects: Project[] = loadProjects(defaultProjects);
export const blogPosts: BlogPost[] = loadBlogPosts(defaultBlogPosts);
export const stats: Stat[] = loadStats(defaultStats);

// Export defaults for admin panel
export const defaultData = {
  userData: defaultUserData,
  skills: defaultSkills,
  experiences: defaultExperiences,
  achievements: defaultAchievements,
  projects: defaultProjects,
  blogPosts: defaultBlogPosts,
  stats: defaultStats
};