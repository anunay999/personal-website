export interface Profile {
  handle: string;
  avatar: string;
  fullName: string;
  title: string;
  location: string;
  status: string;
  bio: string;
  email: string;
  site: string;
  github: string;
  linkedin: string;
  coffee: string;
}

export interface Project {
  name: string;
  desc: string;
  tech: string;
  url: string;
  kind?: string;
}

export interface LinkItem {
  label: string;
  url: string;
  handle: string;
}

export interface SiteData {
  profile: Profile;
  projects: Project[];
  now: string[];
  links: LinkItem[];
}

const avatar = new URL("../profile.jpeg", import.meta.url).href;

export const siteData: SiteData = {
  profile: {
    handle: "anunay",
    avatar,
    fullName: "Anunay Aatipamula",
    title: "AI platform · SMB sales intelligence",
    location: "building from anywhere",
    status: "open to collaborate",
    bio: "Leading AI and data systems on the core platform powering SMB sales intelligence for GTM teams.",
    email: "mail@anunay.dev",
    site: "anunay.dev",
    github: "github.com/anunay999",
    linkedin: "linkedin.com/in/anunay9",
    coffee: "buymeacoffee.com/anunay9",
  },
  projects: [
    {
      name: "read-smart",
      kind: "NEW",
      desc: "Chrome extension that personalizes articles by skipping known concepts and highlighting new content.",
      tech: "TS · Gemini · Mem0",
      url: "https://github.com/anunay999/read-smart",
    },
    {
      name: "neuro-trail",
      kind: "NEW",
      desc: "AI-powered learning system with memory-augmented AI — upload sources, generate quizzes, track progress.",
      tech: "Python · LLM",
      url: "https://github.com/anunay999/neuro-trail",
    },
    {
      name: "git-python-clone",
      desc: "A Python implementation of Git — cloning, commit history, basic version control from scratch.",
      tech: "Python",
      url: "https://github.com/anunay999/git-python-clone",
    },
    {
      name: "meal-planner",
      desc: "LLM-driven 7-day meal plan from age, weight, goals, restrictions, preferences.",
      tech: "Python · HF Spaces",
      url: "https://huggingface.co/spaces/Anunay9/mealplanner",
    },
    {
      name: "neural-caption-generator",
      desc: "Image caption generator using CNN+LSTM deep learning architecture.",
      tech: "Python · PyTorch",
      url: "https://github.com/anunay999/Neural-Caption-Generator",
    },
  ],
  now: [
    "Building — Read Smart, a personalized reading extension",
    "Exploring — memory-augmented AI for learning (NeuroTrail)",
    "Writing — part 2 of the streaming data pipelines series",
    "Open to — collaborations on AI tooling and developer experience",
  ],
  links: [
    { label: "website", url: "https://anunay.dev", handle: "anunay.dev" },
    { label: "github", url: "https://github.com/anunay999", handle: "@anunay999" },
    { label: "linkedin", url: "https://www.linkedin.com/in/anunay9", handle: "/in/anunay9" },
    { label: "email", url: "mailto:mail@anunay.dev", handle: "mail@anunay.dev" },
    { label: "coffee", url: "https://www.buymeacoffee.com/anunay9", handle: "buymeacoffee/anunay9" },
  ],
};
