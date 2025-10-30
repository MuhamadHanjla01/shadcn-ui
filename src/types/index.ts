export interface User {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  profileImage: string;
  resume: string;
  socialMedia: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

export interface Skill {
  name: string;
  level: number;
  icon?: string;
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  period: string;
  description: string;
  type: 'work' | 'education';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  icon?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
  category: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  tags: string[];
  readTime: number;
}

export interface ContactForm {
  name: string;
  email: string;
  message: string;
}

export interface ThemeConfig {
  mode: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
}

export interface Stat {
  number: string;
  label: string;
}