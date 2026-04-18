import { useEffect, useState } from "react";
import { AboutApp } from "./apps/AboutApp";
import { BlogApp } from "./apps/BlogApp";
import { HomeApp } from "./apps/HomeApp";
import { LinksApp } from "./apps/LinksApp";
import { ProjectsApp } from "./apps/ProjectsApp";
import { TerminalApp } from "./apps/TerminalApp";
import { type BlogPost } from "./content/blog";
import { useIsMobile } from "./hooks/useMediaQuery";
import { MobileNav } from "./shell/MobileNav";
import { OSWindow } from "./shell/OSWindow";
import { Sidebar } from "./shell/Sidebar";
import { mainStyle, STORAGE_KEY, type AppId } from "./theme";

function AppScreen({
  app,
  selectedPost,
  setSelectedPost,
  openApp,
  isMobile,
}: {
  app: AppId;
  selectedPost: BlogPost | null;
  setSelectedPost: (post: BlogPost | null) => void;
  openApp: (app: AppId) => void;
  isMobile: boolean;
}) {
  const openPost = (post: BlogPost) => {
    setSelectedPost(post);
    openApp("blog");
  };

  switch (app) {
    case "home":
      return <HomeApp onOpen={openApp} onOpenPost={openPost} isMobile={isMobile} />;
    case "projects":
      return <ProjectsApp isMobile={isMobile} />;
    case "blog":
      return <BlogApp openPost={selectedPost} onOpenPost={setSelectedPost} isMobile={isMobile} />;
    case "about":
      return <AboutApp isMobile={isMobile} />;
    case "links":
      return <LinksApp isMobile={isMobile} />;
    case "terminal":
      return <TerminalApp isMobile={isMobile} />;
    default:
      return <HomeApp onOpen={openApp} onOpenPost={openPost} isMobile={isMobile} />;
  }
}

export default function App() {
  const [app, setApp] = useState<AppId>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (saved as AppId | null) ?? "home";
  });
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, app);
  }, [app]);

  const titleSegments = isMobile
    ? [app.charAt(0).toUpperCase() + app.slice(1)]
    : ["anunay.dev", app.charAt(0).toUpperCase() + app.slice(1)];

  const openApp = (nextApp: AppId) => {
    setSelectedPost(null);
    setApp(nextApp);
  };

  return (
    <OSWindow titleSegments={titleSegments} isMobile={isMobile}>
      {!isMobile && <Sidebar current={app} onPick={openApp} />}
      <main data-screen-label={`app-${app}`} style={mainStyle}>
        <AppScreen
          app={app}
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          openApp={openApp}
          isMobile={isMobile}
        />
      </main>
      {isMobile && <MobileNav current={app} onPick={openApp} />}
    </OSWindow>
  );
}
