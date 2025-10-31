import { User, Skill, Experience, Achievement, Project, BlogPost, Stat } from '@/types';
import { loadUserData, loadSkills, loadExperiences, loadAchievements, loadProjects, loadBlogPosts, loadStats } from './storage';
import { loadDataFromFile, DATA_FILES } from './data-sync';

// Default data
const defaultUserData: User = {
  name: "Alex Chen",
  title: "Full Stack Developer",
  tagline: "Crafting digital experiences with cutting-edge technology",
  bio: "Passionate full-stack developer with 5+ years of experience building scalable web applications. I specialize in React, Node.js, and cloud technologies, with a focus on creating intuitive user experiences and robust backend systems.",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  resume: "/resume.pdf",
  socialMedia: {
    github: "https://github.com/alexchen",
    linkedin: "https://linkedin.com/in/alexchen",
    twitter: "https://twitter.com/alexchen",
    email: "alex@example.com"
  }
};

const defaultSkills: Skill[] = [
  { name: "React", level: 95, icon: "⚛️" },
  { name: "TypeScript", level: 90, icon: "📘" },
  { name: "Node.js", level: 85, icon: "🟢" },
  { name: "Python", level: 80, icon: "🐍" },
  { name: "AWS", level: 75, icon: "☁️" },
  { name: "Docker", level: 70, icon: "🐳" },
  { name: "GraphQL", level: 85, icon: "🔗" },
  { name: "MongoDB", level: 80, icon: "🍃" }
];

const defaultExperiences: Experience[] = [
  {
    id: "1",
    title: "Senior Full Stack Developer",
    company: "TechCorp Inc.",
    period: "2022 - Present",
    description: "Lead development of microservices architecture serving 1M+ users. Built scalable React applications and Node.js APIs.",
    type: "work"
  },
  {
    id: "2",
    title: "Full Stack Developer",
    company: "StartupXYZ",
    period: "2020 - 2022",
    description: "Developed MVP from scratch using React, Node.js, and PostgreSQL. Implemented CI/CD pipelines and AWS deployment.",
    type: "work"
  },
  {
    id: "3",
    title: "Computer Science, B.S.",
    company: "University of Technology",
    period: "2016 - 2020",
    description: "Graduated Magna Cum Laude. Focused on software engineering, algorithms, and database systems.",
    type: "education"
  }
];

const defaultAchievements: Achievement[] = [
  {
    id: "1",
    title: "AWS Certified Solutions Architect",
    description: "Professional level certification for cloud architecture",
    date: "2023",
    icon: "🏆"
  },
  {
    id: "2",
    title: "React Advanced Certification",
    description: "Advanced React patterns and performance optimization",
    date: "2022",
    icon: "⚛️"
  },
  {
    id: "3",
    title: "Hackathon Winner",
    description: "First place in TechCorp Annual Hackathon",
    date: "2021",
    icon: "🥇"
  }
];

const defaultProjects: Project[] = [
  {
    id: "1",
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with real-time inventory management, payment processing, and admin dashboard.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    techStack: ["React", "Node.js", "PostgreSQL", "Stripe", "AWS"],
    githubUrl: "https://github.com/alexchen/ecommerce",
    liveUrl: "https://ecommerce-demo.com",
    featured: true,
    category: "Web Application"
  },
  {
    id: "2",
    title: "Task Management App",
    description: "Collaborative task management tool with real-time updates, team collaboration, and advanced filtering.",
    image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    techStack: ["React", "TypeScript", "Firebase", "Material-UI"],
    githubUrl: "https://github.com/alexchen/taskmanager",
    liveUrl: "https://taskmanager-demo.com",
    featured: true,
    category: "Productivity"
  },
  {
    id: "3",
    title: "Weather Dashboard",
    description: "Beautiful weather dashboard with location-based forecasts, interactive maps, and weather alerts.",
    image: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=600&h=400&fit=crop",
    techStack: ["Vue.js", "OpenWeather API", "Chart.js", "Tailwind"],
    githubUrl: "https://github.com/alexchen/weather",
    liveUrl: "https://weather-demo.com",
    featured: false,
    category: "Data Visualization"
  },
  {
    id: "4",
    title: "AI Chat Bot",
    description: "Intelligent chatbot with natural language processing, context awareness, and multi-language support.",
    image: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=600&h=400&fit=crop",
    techStack: ["Python", "OpenAI API", "FastAPI", "React", "WebSocket"],
    githubUrl: "https://github.com/alexchen/chatbot",
    featured: false,
    category: "AI/ML"
  }
];

const defaultBlogPosts: BlogPost[] = [
  {
    id: "1",
    title: "Building Scalable React Applications",
    content: "In this comprehensive guide, we'll explore best practices for building scalable React applications that can grow with your business needs...",
    excerpt: "Learn the essential patterns and practices for building React apps that scale.",
    date: "2024-01-15",
    tags: ["React", "JavaScript", "Architecture"],
    readTime: 8
  },
  {
    id: "2",
    title: "The Future of Web Development",
    content: "Web development is evolving rapidly with new technologies emerging every day. Let's explore what the future holds...",
    excerpt: "Exploring emerging trends and technologies shaping the future of web development.",
    date: "2024-01-10",
    tags: ["Web Development", "Technology", "Future"],
    readTime: 6
  },
  {
    id: "3",
    title: "Mastering TypeScript for Better Code",
    content: "TypeScript has become an essential tool for modern JavaScript development. Here's how to leverage its power...",
    excerpt: "Tips and tricks for writing better, more maintainable code with TypeScript.",
    date: "2024-01-05",
    tags: ["TypeScript", "JavaScript", "Best Practices"],
    readTime: 10
  }
];

const defaultStats: Stat[] = [
  { number: '5+', label: 'Years Experience' },
  { number: '50+', label: 'Projects Completed' },
  { number: '20+', label: 'Happy Clients' },
  { number: '100%', label: 'Success Rate' }
];

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