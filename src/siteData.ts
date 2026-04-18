export interface Profile {
  handle: string;
  avatar: string;
  fullName: string;
  title: string;
  location: string;
  status: string;
  /* Bio is split into prefix + the company link + suffix so the rendered
     copy can hyperlink the company name without baking HTML into the
     content. Keep `bioText` as a flat string for non-rich surfaces (the
     terminal `about` command, OG meta, etc.). */
  bioPrefix: string;
  bioSuffix: string;
  bioText: string;
  company: { name: string; url: string };
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

const avatar = new URL("./assets/profile.jpeg", import.meta.url).href;

export const siteData: SiteData = {
  profile: {
    handle: "anunay",
    avatar,
    fullName: "Anunay Aatipamula",
    title: "Building AI-native GTM engine & data platform",
    location: "building from anywhere",
    status: "open to collaborate",
    bioPrefix: "Building at ",
    bioSuffix: " — the AI-native GTM engine and the data platform powering it.",
    bioText:
      "Building at Orbital — the AI-native GTM engine and the data platform powering it.",
    company: { name: "Orbital", url: "https://withorbital.com" },
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
