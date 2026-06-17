import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

const ThreeBackground = lazy(() => import("./ThreeBackground.jsx"));
const BlackHoleEngine = lazy(() => import("./BlackHoleEngine.jsx"));

const siteUrl = "https://vinayadavbca.netlify.app";

const whatsappUrl =
  "https://api.whatsapp.com/send?text=Hi%20Vinay%2C%20I%20want%20to%20hire%20you%20for%20a%20web%20development%20project.";

gsap.registerPlugin(ScrollTrigger);

function usePerformanceMobile() {
  const getIsMobile = () =>
    typeof window !== "undefined" &&
    (window.matchMedia("(max-width: 700px)").matches || window.matchMedia("(pointer: coarse)").matches);

  const [isMobile, setIsMobile] = useState(getIsMobile);

  useEffect(() => {
    const widthQuery = window.matchMedia("(max-width: 700px)");
    const pointerQuery = window.matchMedia("(pointer: coarse)");
    const update = () => setIsMobile(getIsMobile());

    widthQuery.addEventListener("change", update);
    pointerQuery.addEventListener("change", update);

    return () => {
      widthQuery.removeEventListener("change", update);
      pointerQuery.removeEventListener("change", update);
    };
  }, []);

  return isMobile;
}

function SmoothScroll() {
  const isPerformanceMobile = usePerformanceMobile();

  useEffect(() => {
    if (isPerformanceMobile) {
      document.documentElement.classList.add("native-scroll");
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      return () => document.documentElement.classList.remove("native-scroll");
    }

    document.documentElement.classList.remove("native-scroll");

    const lenis = new Lenis({
      lerp: 0.08,
      smoothWheel: true,
      syncTouch: false,
      wheelMultiplier: 1.18,
      touchMultiplier: 1,
      gestureOrientation: "vertical",
      anchors: {
        offset: -20,
        duration: 0.75,
      },
      easing: (value) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
    });

    let rafId = 0;
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isPerformanceMobile]);

  return null;
}

function AmbientBackground() {
  const isPerformanceMobile = usePerformanceMobile();

  return (
    <div className="immersive-bg" aria-hidden="true">
      <div className="animated-grid" />
      <div className="neon-line line-a" />
      <div className="neon-line line-b" />
      {!isPerformanceMobile && (
        <Suspense fallback={null}>
          <ThreeBackground />
        </Suspense>
      )}
    </div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28 });

  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

function SEOManager({ pathname }) {
  useEffect(() => {
    const isProjectsPage = pathname === "/projects";
    const title = isProjectsPage
      ? "Projects | Vinay Yadav Full Stack Developer"
      : "Vinay Yadav | Full Stack Developer in Gurugram";
    const description = isProjectsPage
      ? "Explore projects by Vinay Yadav including healthcare platforms, social media apps, business websites and MERN stack web applications."
      : "Vinay Yadav is a Full Stack Developer in Gurugram building fast, scalable React, Node.js and MERN web applications for startups, businesses and healthcare platforms.";
    const url = `${siteUrl}${isProjectsPage ? "/projects" : "/"}`;

    document.title = title;

    const setMeta = (selector, attribute, value) => {
      const element = document.querySelector(selector);
      if (element) element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", url);
    setMeta('meta[name="twitter:title"]', "content", title);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('link[rel="canonical"]', "href", url);
  }, [pathname]);

  return null;
}

function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsVisible(false), 1050);
    return () => window.clearTimeout(timeout);
  }, []);

  return (
    <motion.div
      className="loading-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: isVisible ? 1 : 0, pointerEvents: isVisible ? "auto" : "none" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      aria-hidden={!isVisible}
    >
      <motion.div
        className="loading-mark"
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        VINAY
      </motion.div>
    </motion.div>
  );
}

function WindEnvironment() {
  const isPerformanceMobile = usePerformanceMobile();
  const [footballs, setFootballs] = useState([]);
  const lastSpawnRef = useRef(0);
  const footballIdRef = useRef(0);

  useEffect(() => {
    if (isPerformanceMobile) return undefined;

    let frameId = 0;
    let lastY = window.scrollY;
    let lastTime = performance.now();
    let velocity = 0;
    let wind = 0;
    let lastAppliedWind = 0;
    let lastCssUpdate = 0;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const tick = (time) => {
      const currentY = window.scrollY;
      const deltaY = currentY - lastY;
      const deltaTime = Math.max(time - lastTime, 16.67);
      const instantVelocity = deltaY / deltaTime;
      const velocityEase = 1 - Math.pow(0.82, deltaTime / 16.67);
      const windEase = 1 - Math.pow(0.9, deltaTime / 16.67);

      velocity += (instantVelocity - velocity) * velocityEase;

      const targetWind = Math.abs(velocity) < 0.035 ? 0 : clamp(velocity / 3.4, -1, 1);
      wind += (targetWind - wind) * windEase;

      const windAbs = Math.abs(wind);
      const shouldUpdateCss = time - lastCssUpdate > 28 || Math.abs(wind - lastAppliedWind) > 0.018;

      if (shouldUpdateCss) {
      const root = document.documentElement;
      root.style.setProperty("--wind", wind.toFixed(4));
      root.style.setProperty("--wind-abs", windAbs.toFixed(4));
      root.style.setProperty("--wind-dir", wind >= 0 ? "1" : "-1");
      root.style.setProperty("--wind-text-x", `${(wind * 4.5).toFixed(2)}px`);
      root.style.setProperty("--wind-button-x", `${(wind * 3.2).toFixed(2)}px`);
      root.style.setProperty("--wind-card-x", `${(wind * 7).toFixed(2)}px`);
      root.style.setProperty("--wind-card-y", `${(windAbs * -2).toFixed(2)}px`);
      root.style.setProperty("--wind-card-tilt", `${(wind * 1).toFixed(3)}deg`);
      root.style.setProperty("--wind-image-x", `${(wind * 6).toFixed(2)}px`);
      root.style.setProperty("--wind-image-tilt", `${(wind * 0.8).toFixed(3)}deg`);
      root.style.setProperty("--wind-project-x", `${(wind * 5).toFixed(2)}px`);
      root.style.setProperty("--wind-streak-x", `${(wind * -80).toFixed(2)}px`);
      root.style.setProperty("--wind-streak-skew", `${(wind * -3).toFixed(3)}deg`);
      root.style.setProperty("--wind-dust-x", `${(wind * 92).toFixed(2)}px`);
      root.style.setProperty("--wind-dust-y", `${(windAbs * 22).toFixed(2)}px`);
      root.style.setProperty("--wind-dust-sway", `${(wind * -22).toFixed(2)}px`);
      root.style.setProperty("--wind-canvas-x", `${(wind * -10).toFixed(2)}px`);
      root.style.setProperty("--wind-skew", `${(wind * -1.8).toFixed(3)}deg`);
      root.style.setProperty("--wind-text-skew", `${(wind * -0.55).toFixed(3)}deg`);
      root.style.setProperty("--wind-button-skew", `${(wind * -0.8).toFixed(3)}deg`);
      root.style.setProperty("--wind-streak-opacity", (Math.max(0, windAbs - 0.22) * 0.18).toFixed(3));
      root.style.setProperty("--wind-dust-opacity", (windAbs < 0.025 ? 0 : 0.14 + windAbs * 0.36).toFixed(3));
      root.style.setProperty("--wind-football-blur", `${(windAbs * 0.3).toFixed(3)}px`);
      root.style.setProperty("--wind-streak-duration", `${Math.max(0.72, 1.8 - windAbs * 0.8).toFixed(3)}s`);
      root.style.setProperty("--wind-streak-slow-duration", `${Math.max(1.25, 2.4 - windAbs * 0.8).toFixed(3)}s`);
      root.style.setProperty("--wind-energy-duration", `${Math.max(1.15, 4 - windAbs * 2.1).toFixed(3)}s`);
      root.style.setProperty("--wind-pipeline-duration", `${Math.max(0.9, 2.8 - windAbs * 1.55).toFixed(3)}s`);
      root.style.setProperty("--wind-dust-duration", `${Math.max(4.6, 9 - windAbs * 3.5).toFixed(3)}s`);
        lastCssUpdate = time;
        lastAppliedWind = wind;
      }

      if (windAbs > 0.48 && time - lastSpawnRef.current > 900 && Math.random() < windAbs * 0.08) {
        lastSpawnRef.current = time;
        const id = footballIdRef.current + 1;
        footballIdRef.current = id;

        setFootballs((items) => {
          if (items.length >= 3) return items;
          return [
            ...items,
            {
              id,
              top: 12 + Math.random() * 74,
              size: 34 + Math.random() * 24,
              direction: wind >= 0 ? 1 : -1,
              duration: Math.max(2.4, 5.2 - windAbs * 2.5),
              spin: 720 + windAbs * 1200,
              lift: wind * 46,
            },
          ];
        });

        window.setTimeout(() => {
          setFootballs((items) => items.filter((item) => item.id !== id));
        }, 6200);
      }

      lastY = currentY;
      lastTime = time;
      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPerformanceMobile]);

  if (isPerformanceMobile) return null;

  return (
    <div className="wind-layer" aria-hidden="true">
      <div className="wind-streaks" />
      <div className="wind-distortion" />
      <div className="dust-field">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            key={index}
            style={{
              "--dust-i": index,
              "--dust-top": `${(index * 23 + 11) % 100}%`,
              "--dust-left": `${(index * 37 + 7) % 100}%`,
              "--dust-size": `${1.6 + (index % 5) * 0.55}px`,
              "--dust-trail": `${32 + (index % 7) * 13}px`,
              "--dust-delay": `${(index * -0.38).toFixed(2)}s`,
            }}
          />
        ))}
      </div>
      {footballs.map((ball) => (
        <span
          className="football"
          key={ball.id}
          style={{
            "--ball-top": `${ball.top}%`,
            "--ball-size": `${ball.size}px`,
            "--ball-dir": ball.direction,
            "--ball-start": ball.direction > 0 ? "-10vw" : "110vw",
            "--ball-travel": ball.direction > 0 ? "128vw" : "-128vw",
            "--ball-entry": ball.direction > 0 ? "-14vw" : "14vw",
            "--ball-duration": `${ball.duration}s`,
              "--ball-spin-duration": `${Math.max(0.55, ball.duration / 2.2)}s`,
            "--ball-spin": `${ball.spin}deg`,
              "--ball-lift": `${ball.lift}px`,
          }}
        />
      ))}
    </div>
  );
}

function InteractionEffects() {
  const isPerformanceMobile = usePerformanceMobile();

  useEffect(() => {
    if (isPerformanceMobile) return undefined;

    const onMove = (event) => {
      const px = event.clientX / window.innerWidth - 0.5;
      const py = event.clientY / window.innerHeight - 0.5;

      document.documentElement.style.setProperty("--pointer-x", px.toFixed(4));
      document.documentElement.style.setProperty("--pointer-y", py.toFixed(4));
      document.documentElement.style.setProperty("--tilt-x", `${(-py * 7).toFixed(3)}deg`);
      document.documentElement.style.setProperty("--tilt-y", `${(px * 9).toFixed(3)}deg`);
      document.documentElement.style.setProperty("--depth-x", `${(px * 18).toFixed(2)}px`);
      document.documentElement.style.setProperty("--depth-y", `${(py * 14).toFixed(2)}px`);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [isPerformanceMobile]);

  useEffect(() => {
    if (isPerformanceMobile) return undefined;

    const magneticTargets = document.querySelectorAll(
      "button, .whatsapp-button, .ghost-button, .capability-card, .solution-card, .cert-card",
    );

    const cleanups = [];

    magneticTargets.forEach((target) => {
      const onMove = (event) => {
        const rect = target.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        target.style.setProperty("--magnet-x", `${x * 0.12}px`);
        target.style.setProperty("--magnet-y", `${y * 0.12}px`);
      };

      const onLeave = () => {
        target.style.setProperty("--magnet-x", "0px");
        target.style.setProperty("--magnet-y", "0px");
      };

      target.addEventListener("pointermove", onMove);
      target.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        target.removeEventListener("pointermove", onMove);
        target.removeEventListener("pointerleave", onLeave);
      });
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [isPerformanceMobile]);

  useEffect(() => {
    if (isPerformanceMobile) return undefined;

    const contexts = gsap.context(() => {
      gsap.utils.toArray(".split-section, .projects-showcase, .project-page, .capability-block, .offers-section, .cinematic, .cards-section, .quick-section, .upgrade").forEach((section) => {
        gsap.fromTo(
          section,
          { y: 54, opacity: 0.78 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: section,
              start: "top 82%",
              end: "top 46%",
              scrub: 0.7,
            },
          },
        );
      });

      gsap.to(".timeline-dot", {
        scale: 1.35,
        boxShadow: "0 0 34px rgba(255, 18, 79, 0.95)",
        stagger: 0.12,
        scrollTrigger: {
          trigger: ".experience-timeline",
          start: "top 75%",
          end: "bottom 50%",
          scrub: true,
        },
      });

      gsap.fromTo(
        ".neon-panel span",
        { scaleX: 0.25, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 1.1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".laptop",
            start: "top 72%",
          },
        },
      );
    });

    return () => contexts.revert();
  }, [isPerformanceMobile]);

  return null;
}

const featureCards = [
  {
    icon: "CX",
    title: "Concentrix",
    text: "Sr. Operations Executive - Compliance.",
  },
  {
    icon: "PC",
    title: "Pristyn Care",
    text: "Operations Associate - MD Data.",
  },
  {
    icon: "FD",
    title: "Freelance Software Developer",
    text: "Building websites, dashboards, APIs and MERN applications.",
  },
  {
    icon: "BCA",
    title: "Chandigarh University",
    text: "Bachelor of Computer Applications. CGPA: 7.2.",
  },
];

const quickFeatures = [
  {
    icon: "</>",
    title: "HTML, CSS & JavaScript for Web Developers",
  },
  {
    icon: "⚛",
    title: "React - The Complete Guide",
  },
  {
    icon: "JS",
    title: "Node.js, Express, MongoDB and More",
  },
  {
    icon: "◎",
    title: "Learning & Problem Solving Skills",
  },
  {
    icon: "◷",
    title: "Time & Stress Management",
  },
];

const techStackItems = [
  { name: "React.js", icon: "https://cdn.simpleicons.org/react/61DAFB" },
  { name: "JavaScript", icon: "https://cdn.simpleicons.org/javascript/F7DF1E" },
  { name: "Node.js", icon: "https://cdn.simpleicons.org/nodedotjs/5FA04E" },
  { name: "Express.js", icon: "https://cdn.simpleicons.org/express/FFFFFF" },
  { name: "MongoDB", icon: "https://cdn.simpleicons.org/mongodb/47A248" },
  { name: "MySQL", icon: "https://cdn.simpleicons.org/mysql/4479A1" },
  { name: "REST APIs", icon: "☁" },
  { name: "Tailwind CSS", icon: "https://cdn.simpleicons.org/tailwindcss/06B6D4" },
  { name: "Git & GitHub", icon: "https://cdn.simpleicons.org/github/FFFFFF" },
  { name: "SQL", icon: "▰" },
  { name: "Responsive Design", icon: "▯" },
  { name: "Cursor AI", icon: "◆" },
  { name: "ChatGPT", icon: "https://cdn.simpleicons.org/openai/74AA9C" },
  { name: "GitHub Copilot", icon: "https://cdn.simpleicons.org/githubcopilot/FFFFFF" },
  { name: "Kiro", icon: "K" },
];

const techStackRows = [
  techStackItems.slice(0, 5),
  techStackItems.slice(5, 10),
  techStackItems.slice(10),
];

const mobileSkillGroups = [
  { title: "Frontend", skills: ["React.js", "JavaScript", "Tailwind CSS", "Responsive Design"] },
  { title: "Backend", skills: ["Node.js", "Express.js", "REST APIs"] },
  { title: "Database", skills: ["MongoDB", "MySQL", "SQL"] },
  { title: "Tools", skills: ["Git & GitHub", "Cursor AI", "ChatGPT", "GitHub Copilot", "Kiro"] },
];

const buildItems = [
  {
    name: "Business Websites",
    icon: "◎",
    text: "High-performance websites that represent your brand and convert visitors.",
  },
  {
    name: "Healthcare Platforms",
    icon: "✚",
    text: "Secure healthcare solutions built for modern patient engagement.",
  },
  {
    name: "Admin Dashboards",
    icon: "▣",
    text: "Powerful dashboards with analytics, reporting and smart data insights.",
  },
  {
    name: "Social Media Platforms",
    icon: "✦",
    text: "Engaging community platforms with real-time features and polished UX.",
  },
  {
    name: "Database Systems",
    icon: "◉",
    text: "Robust, secure and scalable data architecture for web applications.",
  },
  {
    name: "Custom Applications",
    icon: "⬢",
    text: "Tailored MERN applications built around unique business workflows.",
  },
  {
    name: "API Integrations",
    icon: "∞",
    text: "Seamless API integrations that connect systems and automate workflows.",
  },
  {
    name: "SEO Optimized Websites",
    icon: "⌕",
    text: "Search-friendly websites structured to rank higher and drive traffic.",
  },
];

const orbitTechItems = [
  { label: "React", symbol: "⚛" },
  { label: "Node", symbol: "JS" },
  { label: "MongoDB", symbol: "DB" },
  { label: "GitHub", symbol: "GH" },
];

const projectItems = [
  {
    icon: "SN",
    title: "Snapsule",
    text: "Social media platform for students.",
  },
  {
    icon: "DR",
    title: "DoctorSite",
    text: "Web services platform for doctors and healthcare professionals.",
  },
  {
    icon: "GC",
    title: "The Gynecomastia Clinic",
    text: "Healthcare website focused on patient engagement and lead generation.",
  },
  {
    icon: "EM",
    title: "Employee Management System",
    text: "Database-driven employee management platform.",
  },
  {
    icon: "HS",
    title: "Hospital Appointment & Scheduling System",
    text: "Database solution for healthcare operations.",
  },
];

const projectStats = [
  { value: "5+", label: "Projects Completed", icon: "GO" },
  { value: "3+", label: "Business Domains", icon: "OK" },
  { value: "2+", label: "Years Experience", icon: "UP" },
  { value: "100%", label: "Client Satisfaction", icon: "STAR" },
];

const projectCaseStudies = [
  {
    number: "01",
    title: "DoctorSite",
    category: "Healthcare Platform",
    description:
      "A healthcare services platform for doctors and clinics to present services, capture patient inquiries and build trust online.",
    features: ["Patient-focused service pages", "Lead generation contact flow", "Responsive across all devices"],
    tech: ["React", "Node.js", "MongoDB", "Express"],
    mockTitle: "Your Health, Our Priority",
    mockSubtitle: "Doctor services and appointment inquiries",
    layout: "visual-left",
  },
  {
    number: "02",
    title: "Snapsule",
    category: "Social Media Platform",
    description:
      "A student-focused social media platform concept with clean UI, community features and scalable MERN architecture.",
    features: ["Student community experience", "Modern feed and profile UI", "Scalable backend structure"],
    tech: ["React", "Socket.io", "MongoDB", "Node.js"],
    mockTitle: "Connect. Share. Grow.",
    mockSubtitle: "Student social platform experience",
    layout: "visual-right",
  },
  {
    number: "03",
    title: "The Gynecomastia Clinic",
    category: "Healthcare Website",
    description:
      "A conversion-focused clinic website built around patient education, credibility, search visibility and lead generation.",
    features: ["SEO-friendly treatment pages", "Patient engagement content", "Fast and responsive experience"],
    tech: ["React", "Tailwind", "Forms", "SEO"],
    mockTitle: "Patient Care That Converts",
    mockSubtitle: "Healthcare website for engagement and leads",
    layout: "visual-left",
  },
];

const mobileProjectImpacts = {
  DoctorSite: "Patient inquiry flow for clinics",
  Snapsule: "Student-first social platform UX",
  "The Gynecomastia Clinic": "SEO-led clinic lead generation",
};

const offerHighlights = [
  { title: "Fast Delivery", text: "On-time, every time", icon: "FAST" },
  { title: "Modern Tech", text: "Latest & scalable", icon: "CODE" },
  { title: "Secure & Reliable", text: "Your data is safe", icon: "SAFE" },
  { title: "Support", text: "30 Days Support", icon: "HELP" },
];

const offerPlans = [
  {
    title: "Landing Page",
    subtitle: "Perfect for startups & promotions",
    price: "$80",
    accent: "red",
    icon: "WEB",
    features: [
      "1 Landing Page Design",
      "Fully Responsive",
      "Modern & Clean UI",
      "Contact Form Integration",
      "Basic SEO Setup",
      "5 Days Delivery",
      "30 Days Support",
    ],
  },
  {
    title: "Business Website",
    subtitle: "Ideal for small & growing businesses",
    price: "$100",
    accent: "green",
    icon: "PC",
    features: [
      "Up to 5 Pages",
      "Fully Responsive",
      "Modern & Clean UI",
      "Contact Form Integration",
      "Basic SEO Setup",
      "Speed Optimized",
      "10 Days Delivery",
      "30 Days Support",
    ],
  },
  {
    title: "Premium Website",
    subtitle: "Custom solution for your brand",
    price: "$120",
    accent: "red",
    icon: "GO",
    features: [
      "Up to 10 Pages",
      "Fully Responsive",
      "Custom Design",
      "Advanced Animations",
      "Contact Form Integration",
      "On-Page SEO",
      "Speed Optimized",
      "15 Days Delivery",
      "30 Days Support",
    ],
  },
];

const offerProcess = [
  { step: "01", title: "Discuss", text: "We discuss your requirements, goals & ideas.", icon: "CHAT" },
  { step: "02", title: "Design", text: "I create a modern & clean design for your website.", icon: "UI" },
  { step: "03", title: "Develop", text: "I develop your website with clean & optimized code.", icon: "DEV" },
  { step: "04", title: "Deliver", text: "Final testing & delivery with 30 days support.", icon: "SHIP" },
];

const offerTrustItems = [
  { title: "Money Back Guarantee", text: "100% refund if you're not satisfied with the work.", icon: "SAFE" },
  { title: "Unlimited Revisions", text: "I will work until you are 100% happy with the final result.", icon: "SYNC" },
  { title: "Secure & Confidential", text: "Your project & data are always safe with me.", icon: "LOCK" },
  { title: "30 Days Support", text: "I provide free support for 30 days after delivery.", icon: "HELP" },
];

const footerLinks = [
  {
    title: "Quick Links",
    links: ["Home", "About", "Projects", "Skills", "Experience", "Contact"],
  },
  {
    title: "Services",
    links: ["Web Development", "MERN Stack Development", "Database Design", "API Integration", "Responsive Design"],
  },
  {
    title: "Contact",
    links: ["vinaysalempur45@gmail.com", "Gurugram, India"],
  },
  {
    title: "Tech",
    links: ["React.js", "Node.js", "MongoDB", "MySQL"],
  },
];

function BrowserMockup({ compact = false }) {
  return (
    <div className={`browser-mockup ${compact ? "compact" : ""}`}>
      <div className="browser-topbar">
        <span />
        <span />
        <span />
        <div className="address-bar">vinay-yadav.dev/projects</div>
      </div>
      <div className="browser-body">
        <aside className="browser-sidebar">
          {["", "", "", "", ""].map((_, index) => (
            <i key={index} />
          ))}
        </aside>
        <main className="browser-stage">
          <div className="mini-hero">
            <span>Featured Work</span>
            <strong>Snapsule, DoctorSite and healthcare platforms</strong>
          </div>
          <div className="game-grid">
            {["SN", "DR", "HC"].map((label, index) => (
              <div className="game-tile" key={label}>
                <b>{label}</b>
                <small>{index === 0 ? "social" : "web app"}</small>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

function LaptopMockup() {
  return (
    <div className="laptop">
      <div className="laptop-screen">
        <img
          className="scene-image about-image"
          src="/about.png"
          alt="Developer workspace for Vinay Yadav portfolio"
        />
        <div className="neon-panel">
          <span />
          <span />
          <span />
        </div>
        <div className="pipeline-overlay" aria-hidden="true">
          {["IDEA", "DEVELOPMENT", "TESTING", "DEPLOYMENT", "LAUNCH"].map((step) => (
            <span key={step}>{step}</span>
          ))}
        </div>
      </div>
      <div className="laptop-base" />
    </div>
  );
}

function ControlMockup() {
  return (
    <div className="control-window">
      <div className="control-header">
        <span />
        <span />
        <span />
      </div>
      <div className="meter-row">
        <div>
          <small>React.js</small>
          <b>42%</b>
        </div>
        <div className="meter">
          <i style={{ width: "42%" }} />
        </div>
      </div>
      <div className="meter-row">
        <div>
          <small>Node.js</small>
          <b>58%</b>
        </div>
        <div className="meter">
          <i style={{ width: "58%" }} />
        </div>
      </div>
      <div className="monitor-grid">
        <span>MongoDB</span>
        <span>MySQL</span>
        <span>REST APIs</span>
        <span>SQL</span>
      </div>
    </div>
  );
}

function TechStackVisual() {
  return (
    <div className="tech-image-frame">
      <img
        className="scene-image tech-stack-image"
        src="/tech.png"
        alt="Tech stack interface preview with MERN tools and AI coding assistants"
      />
      <div className="command-center-overlay" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function HeroOrbit() {
  return (
    <div className="hero-orbit" aria-hidden="true">
      {orbitTechItems.map((item, index) => (
        <span className={`orbit-module orbit-${index + 1}`} key={item.label}>
          <b>{item.symbol}</b>
          <small>{item.label}</small>
        </span>
      ))}
    </div>
  );
}

function Section({ eyebrow, title, text, children, flipped = false }) {
  return (
    <motion.section
      className={`split-section motion-section ${flipped ? "flipped" : ""}`}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="copy-block">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{text}</p>
        <button className="ghost-button">Learn more</button>
      </div>
      <div className="visual-block">{children}</div>
    </motion.section>
  );
}

function CapabilityPanel() {
  return (
    <section className="capability-panel" id="skills">
      <div className="capability-block">
        <div className="ecosystem-lines" aria-hidden="true" />
        <p className="eyebrow">TECH STACK</p>
        <div className="tech-marquee" aria-label="Technology stack">
          {techStackRows.map((row, rowIndex) => (
            <div
              className={`tech-marquee-row tech-marquee-row-${rowIndex % 2 === 0 ? "ltr" : "rtl"}`}
              key={`tech-row-${rowIndex}`}
            >
              <div className="tech-marquee-track">
                {[0, 1].map((copyIndex) => (
                  <div className="tech-marquee-set" aria-hidden={copyIndex === 1} key={`tech-copy-${copyIndex}`}>
                    {row.map((item) => (
                      <article className="capability-card tech-marquee-card" key={`${copyIndex}-${item.name}`}>
                        {item.icon.startsWith("http") ? (
                          <img src={item.icon} alt="" aria-hidden="true" />
                        ) : (
                          <span>{item.icon}</span>
                        )}
                        <strong>{item.name}</strong>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="capability-block service-solution-block">
        <div className="solution-ambient" aria-hidden="true" />
        <div className="solution-header">
          <div>
            <p className="eyebrow">WHAT I DO</p>
            <h2>
              Solutions that <span>drive results</span>
            </h2>
          </div>
          <p>
            I build powerful, scalable and user-centric digital solutions tailored to help your business grow and stand out.
          </p>
        </div>

        <div className="services-showcase-grid">
          {buildItems.map((item, index) => (
            <article className={`service-showcase-card service-showcase-card-${index + 1}`} key={item.name}>
              <span>{item.icon}</span>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <a href="#offers">
                Learn more <span aria-hidden="true">-&gt;</span>
              </a>
            </article>
          ))}
        </div>

        <div className="solution-network">
          <div className="solution-orbit-stage">
            <Suspense fallback={<div className="black-hole-engine" />}>
              <BlackHoleEngine />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectVisual({ project }) {
  return (
    <div className="project-visual-card">
      <div className="project-browser-bar">
        <span />
        <span />
        <span />
        <strong>{project.title}.dev</strong>
      </div>
      <div className="project-mock-hero">
        <div>
          <p>{project.category}</p>
          <h3>{project.mockTitle}</h3>
          <small>{project.mockSubtitle}</small>
          <button type="button">Explore</button>
        </div>
      </div>
      <div className="project-mock-grid">
        <span />
        <span />
        <span />
      </div>
      <div className="project-phone-mock">
        <i />
        <strong>{project.title}</strong>
        <small>Mobile Ready</small>
      </div>
    </div>
  );
}

function ProjectPage({ openInquiry }) {
  return (
    <motion.section
      className="project-page motion-section"
      id="projects"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="project-page-header">
        <p className="eyebrow">FEATURED WORK</p>
        <h2>
          Real products for <span>real clients</span>
        </h2>
        <p>
          I design and develop modern web applications that solve real business problems, improve user experience and drive measurable growth.
        </p>
      </div>

      <div className="project-stats-row">
        {projectStats.map((stat) => (
          <article key={stat.label}>
            <span>{stat.icon}</span>
            <strong>{stat.value}</strong>
            <p>{stat.label}</p>
          </article>
        ))}
      </div>

      <div className="project-case-list">
        {projectCaseStudies.map((project) => (
          <article className={`project-case-card ${project.layout}`} key={project.title}>
            <div className="project-case-visual">
              <ProjectVisual project={project} />
            </div>
            <div className="project-case-copy">
              <span className="project-index">{project.number}</span>
              <h3>{project.title}</h3>
              <strong>{project.category}</strong>
              <p>{project.description}</p>
              <ul>
                {project.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <small>Tech stack</small>
              <div className="project-tech-list">
                {project.tech.map((tech) => (
                  <span key={tech}>{tech}</span>
                ))}
              </div>
              <div className="project-card-actions">
                <button type="button" onClick={openInquiry}>
                  Live Demo <span aria-hidden="true">-&gt;</span>
                </button>
                <a href="/#offers">
                  Case Study <span aria-hidden="true">-&gt;</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="project-page-cta">
        <span>GO</span>
        <div>
          <p className="eyebrow">HAVE A PROJECT IN MIND?</p>
          <h2>
            Let's build something <span>amazing together!</span>
          </h2>
        </div>
        <button type="button" onClick={openInquiry}>
          Discuss Your Project <span aria-hidden="true">-&gt;</span>
        </button>
        <a href="/projects">
          View All Projects <span aria-hidden="true">-&gt;</span>
        </a>
      </div>
    </motion.section>
  );
}

function ProjectsShowcase() {
  return (
    <motion.section
      className="projects-showcase motion-section"
      id="projects"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="projects-visual">
        <div className="laptop projects-laptop">
          <div className="laptop-screen">
            <img
              className="scene-image projects-image"
              src="/projects.png"
              alt="Featured projects interface preview for Vinay Yadav"
            />
            <div className="project-depth-layers" aria-hidden="true">
              <span>UI</span>
              <span>CODE</span>
              <span>DATABASE</span>
              <span>INFRA</span>
            </div>
            <div className="neon-panel">
              <span />
              <span />
              <span />
            </div>
          </div>
          <div className="laptop-base" />
        </div>
      </div>

      <div className="projects-copy">
        <p className="eyebrow">FEATURED PROJECTS</p>
        <h2>
          Real products for <span>real users</span>
        </h2>
        <p className="projects-description">
          A selection of web applications and business platforms built for students, healthcare professionals, clinic operations, employee management and appointment scheduling.
        </p>
        <a className="ghost-button" href="/projects">View all projects</a>
      </div>
    </motion.section>
  );
}

function OffersSection({ openInquiry }) {
  return (
    <motion.section
      className="offers-section motion-section"
      id="offers"
      initial={{ opacity: 0, y: 70 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12%" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="offers-header">
        <p className="eyebrow">MY OFFERS</p>
        <h2>
          Solutions designed to grow <span>your business</span>
        </h2>
        <p>
          I create modern, fast and scalable websites that help startups and businesses establish a strong online presence.
        </p>
      </div>

      <div className="offer-highlight-bar">
        {offerHighlights.map((item) => (
          <article key={item.title}>
            <span>{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="offer-pricing-grid">
        {offerPlans.map((plan) => (
          <article className={`offer-card offer-card-${plan.accent}`} key={plan.title}>
            <div className="offer-card-icon">{plan.icon}</div>
            <h3>{plan.title}</h3>
            <p>{plan.subtitle}</p>
            <strong className="offer-price">{plan.price}</strong>
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <button type="button" onClick={openInquiry}>
              Get Started <span aria-hidden="true">-&gt;</span>
            </button>
          </article>
        ))}
      </div>

      <div className="offer-process">
        <div className="offers-header compact">
          <p className="eyebrow">MY PROCESS</p>
          <h2>Simple process, great results</h2>
        </div>
        <div className="process-steps">
          {offerProcess.map((item) => (
            <article key={item.step}>
              <span>{item.icon}</span>
              <b>{item.step}</b>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="offer-trust-grid">
        {offerTrustItems.map((item) => (
          <article key={item.title}>
            <span>{item.icon}</span>
            <div>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="offer-cta">
        <div>
          <p className="eyebrow">HAVE A PROJECT IN MIND?</p>
          <h2>
            Let's build something <span>amazing together!</span>
          </h2>
        </div>
        <div className="offer-cta-actions">
          <button type="button" onClick={openInquiry}>
            Discuss Your Project <span aria-hidden="true">-&gt;</span>
          </button>
          <a href="/projects">
            View My Work <span aria-hidden="true">-&gt;</span>
          </a>
        </div>
      </div>
    </motion.section>
  );
}

const MOBILE_EASE = [0.22, 1, 0.36, 1];

const mobileStaggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: MOBILE_EASE } },
};

function MobileReveal({ className, id, children }) {
  return (
    <motion.section
      className={className}
      id={id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.55, ease: MOBILE_EASE }}
    >
      {children}
    </motion.section>
  );
}

function MobileCard({ className, children, delay = 0 }) {
  return (
    <motion.article
      className={className}
      initial={{ opacity: 0, y: 22, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.45, delay, ease: MOBILE_EASE }}
    >
      {children}
    </motion.article>
  );
}

function MobileHomeExperience({ openInquiry }) {
  return (
    <div className="mobile-home-experience">
      <motion.section
        className="mobile-hero-section"
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
      >
        <motion.p className="mobile-kicker" variants={mobileStaggerItem}>MERN Stack Developer</motion.p>
        <motion.h1 className="mobile-hero-name" variants={mobileStaggerItem}>Vinay Yadav</motion.h1>
        <motion.p className="mobile-hero-tagline" variants={mobileStaggerItem}>
          Building scalable web apps for fast-moving brands.
        </motion.p>
        <motion.div className="mobile-hero-actions" variants={mobileStaggerItem}>
          <button type="button" onClick={openInquiry}>Book Call</button>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
        </motion.div>
        <motion.div className="mobile-setup-card" variants={mobileStaggerItem}>
          <img src="/hero.png" alt="Dark cyberpunk coding setup" />
          <span>React. Node. MongoDB. Launch-ready.</span>
        </motion.div>
      </motion.section>

      <MobileReveal className="mobile-story-section">
        <p className="mobile-kicker">ABOUT</p>
        <h2>I turn rough ideas into polished digital products.</h2>
        <p>
          I help startups and businesses ship fast, responsive web apps with clean interfaces, reliable backend logic and scalable databases.
        </p>
        <div className="mobile-showcase-card">
          <img src="/about.png" alt="Code workspace showcase" />
          <div>
            <span>PRODUCT THINKING</span>
            <strong>Design, build and launch from one focused workflow.</strong>
          </div>
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-swipe-section" id="mobile-services">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">SERVICES</p>
          <h2>Choose the system your business needs next.</h2>
        </div>
        <div className="mobile-snap-row">
          {buildItems.map((item, index) => (
            <MobileCard className="mobile-service-card" delay={index * 0.05} key={item.name}>
              <span>{item.icon}</span>
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <button type="button" onClick={openInquiry}>Discuss Project</button>
            </MobileCard>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-tech-section">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">TECH STACK</p>
          <h2>Compact, modern and production-ready.</h2>
        </div>
        <div className="mobile-skill-accordion">
          {mobileSkillGroups.map((group, index) => (
            <details open={index === 0} key={group.title}>
              <summary>{group.title}<span>{group.skills.length} tools</span></summary>
              <div>
                {group.skills.map((skill) => (
                  <b key={skill}>{skill}</b>
                ))}
              </div>
            </details>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-black-hole-section" aria-label="Capability transition">
        <div className="mobile-black-hole-stage">
          <div className="mobile-singularity" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className="mobile-orbit-badge badge-one">API</span>
          <span className="mobile-orbit-badge badge-two">UI</span>
          <span className="mobile-orbit-badge badge-three">DB</span>
        </div>
        <p>From concept to launch, every layer connects into one focused product system.</p>
      </MobileReveal>

      <MobileReveal className="mobile-swipe-section" id="mobile-offers">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">OFFERS</p>
          <h2>Simple packages. Premium execution.</h2>
        </div>
        <div className="mobile-snap-row mobile-pricing-row">
          {offerPlans.map((plan, index) => (
            <MobileCard className={`mobile-price-card ${index === 1 ? "recommended" : ""}`} delay={index * 0.06} key={plan.title}>
              {index === 1 && <span className="mobile-plan-tag">Recommended</span>}
              <small>{plan.icon}</small>
              <h3>{plan.title}</h3>
              <p>{plan.subtitle}</p>
              <strong>{plan.price}</strong>
              <ul>
                {plan.features.slice(0, 4).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <button type="button" onClick={openInquiry}>Start Project</button>
            </MobileCard>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-process-section">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">PROCESS</p>
          <h2>Clear flow. No confusion.</h2>
        </div>
        <div className="mobile-neon-timeline">
          {["Discover", "Design", "Develop", "Deliver"].map((step, index) => (
            <MobileCard className="mobile-timeline-step" delay={index * 0.05} key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{step}</h3>
                <p>{offerProcess[index]?.text.replace("I ", "").replace("We ", "")}</p>
              </div>
            </MobileCard>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-swipe-section" id="mobile-projects">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">PROJECTS</p>
          <h2>Product showcases built around outcomes.</h2>
        </div>
        <div className="mobile-snap-row mobile-project-row">
          {projectCaseStudies.map((project, index) => (
            <MobileCard className="mobile-project-card" delay={index * 0.05} key={project.title}>
              <div className="mobile-project-image">
                <img src="/projects.png" alt={`${project.title} product showcase`} />
              </div>
              <span>{project.category}</span>
              <h3>{project.title}</h3>
              <p>{mobileProjectImpacts[project.title]}</p>
              <div>
                {project.tech.slice(0, 3).map((tech) => (
                  <b key={tech}>{tech}</b>
                ))}
              </div>
              <a href="/projects">View Project</a>
            </MobileCard>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-experience-section">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">EXPERIENCE</p>
          <h2>Execution across operations and software.</h2>
        </div>
        <div className="mobile-experience-stack">
          {featureCards.slice(0, 3).map((item, index) => (
            <MobileCard className="mobile-experience-item" delay={index * 0.05} key={item.title}>
              <span>{item.icon}</span>
              <div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </MobileCard>
          ))}
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-education-section">
        <div className="mobile-section-heading">
          <p className="mobile-kicker">EDUCATION</p>
          <h2>Foundations that support the build.</h2>
        </div>
        <div className="mobile-achievement-grid">
          <MobileCard className="mobile-achievement-item" delay={0}>
            <span>BCA</span>
            <strong>Chandigarh University</strong>
            <p>CGPA 7.2</p>
          </MobileCard>
          <MobileCard className="mobile-achievement-item" delay={0.06}>
            <span>5+</span>
            <strong>Certifications</strong>
            <p>React, Node and web development.</p>
          </MobileCard>
        </div>
      </MobileReveal>

      <MobileReveal className="mobile-final-cta">
        <p className="mobile-kicker">LET'S BUILD</p>
        <h2>Ready to Build Something Amazing?</h2>
        <p>Tell me what you want to launch. I will help shape it into a fast, premium web experience.</p>
        <div>
          <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
          <button type="button" onClick={openInquiry}>Book Call</button>
        </div>
      </MobileReveal>
    </div>
  );
}

function ExperienceTimeline() {
  return (
    <div className="experience-timeline">
      {featureCards.map((item, index) => {
        const isEven = index % 2 === 0;

        return (
          <article className={`timeline-row ${isEven ? "timeline-row-right" : "timeline-row-left"}`} key={item.title}>
            <div className="timeline-meta">
              <span>{item.icon}</span>
              <h3>{item.title}</h3>
            </div>
            <div className="timeline-dot" />
            <div className="timeline-note">
              <p>{item.text}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InquiryModal({ isOpen, onClose }) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("sending");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("https://formsubmit.co/ajax/vinaysalempur45@gmail.com", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Unable to send inquiry");

      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <button className="modal-backdrop" type="button" aria-label="Close inquiry form" onClick={onClose} />
      <motion.div
        className="inquiry-panel"
        initial={{ opacity: 0, y: 26, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="modal-close" type="button" aria-label="Close inquiry form" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">PROJECT INQUIRY</p>
        <h2 id="inquiry-title">Tell me about your project</h2>
        <p className="modal-intro">
          Share your details and requirements. The inquiry will be sent to Vinay at vinaysalempur45@gmail.com.
        </p>

        <form className="inquiry-form" onSubmit={handleSubmit}>
          <input type="hidden" name="_subject" value="New Portfolio Project Inquiry" />
          <input type="hidden" name="_template" value="table" />
          <input type="hidden" name="_captcha" value="false" />

          <label>
            Full Name
            <input name="name" type="text" placeholder="Your name" required />
          </label>

          <label>
            Email
            <input name="email" type="email" placeholder="you@example.com" required />
          </label>

          <label>
            Phone / WhatsApp
            <input name="phone" type="tel" placeholder="+91 ..." />
          </label>

          <label>
            Project Type
            <select name="projectType" defaultValue="Business Website" required>
              <option>Business Website</option>
              <option>MERN Web App</option>
              <option>Healthcare Website</option>
              <option>Dashboard / Admin Panel</option>
              <option>API Integration</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Budget
            <input name="budget" type="text" placeholder="Estimated budget" />
          </label>

          <label className="full-field">
            Project Details
            <textarea name="message" rows="5" placeholder="What do you want to build?" required />
          </label>

          <button className="submit-inquiry" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Sending..." : "Send Inquiry"}
          </button>

          {status === "sent" && <p className="form-status success">Inquiry sent successfully.</p>}
          {status === "error" && (
            <p className="form-status error">
              Could not send right now. Please email vinaysalempur45@gmail.com directly.
            </p>
          )}
        </form>
      </motion.div>
    </div>
  );
}

function App() {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const isPerformanceMobile = usePerformanceMobile();
  const openInquiry = () => setIsInquiryOpen(true);
  const closeInquiry = () => setIsInquiryOpen(false);
  const isProjectsRoute = pathname === "/projects";

  useEffect(() => {
    const updatePathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", updatePathname);
    return () => window.removeEventListener("popstate", updatePathname);
  }, []);

  return (
    <>
      <SEOManager pathname={pathname} />
      <SmoothScroll />
      <ScrollProgress />
      <LoadingScreen />
      <AmbientBackground />
      <WindEnvironment />
      <InteractionEffects />
      <InquiryModal isOpen={isInquiryOpen} onClose={closeInquiry} />
      <motion.div
        className="site-shell"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
      <div className="noise" />
      <header className="top-nav">
        <a className="brand" href="/" aria-label="Vinay Yadav portfolio home">
          <span className="brand-mark">V</span>
          <span>VINAY</span>
        </a>
        <nav>
          <a href="/#top">Home</a>
          <a href="/projects">Projects</a>
          <a href="/#features">Experience</a>
          <a href="/#mods">Certifications</a>
          <a href="/#download">Contact</a>
        </nav>
        <div className="nav-actions">
          <button className="download-small" type="button" onClick={openInquiry}>
            Hire me
          </button>
          <a className="whatsapp-button nav-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
            WhatsApp
          </a>
        </div>
      </header>

      <main id="top">
        {isProjectsRoute ? (
          <ProjectPage openInquiry={openInquiry} />
        ) : isPerformanceMobile ? (
          <MobileHomeExperience openInquiry={openInquiry} />
        ) : (
          <>
        <div className="desktop-home-flow">
        <section className="hero immersive-hero">
          <div className="hero-glow" />
          <div className="hero-copy">
            <h1>Vinay Yadav</h1>
            <p className="hero-role">Full Stack Developer helping startups launch fast and grow smarter.</p>
            <p className="hero-subtitle">
              I build modern web apps, business platforms and high-performance digital experiences.
            </p>
            <div className="hero-actions">
              <a className="hero-primary-link" href="/projects">View Projects</a>
              <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </div>
            <div className="hero-stats" aria-label="Browser highlights">
              <span>Gurugram, India</span>
              <span>React.js</span>
              <span>Node.js</span>
              <span>MongoDB</span>
            </div>
          </div>
          <motion.div
            className="hero-stage depth-card"
            whileHover={{ rotateX: 1.5, rotateY: -2, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 80, damping: 18 }}
          >
            <HeroOrbit />
            <img
              className="scene-image hero-image"
              src="/hero.png"
              alt="Custom developer workstation for Vinay Yadav"
            />
          </motion.div>
        </section>

        <Section
          eyebrow="ABOUT ME"
          title={
            <>
              Turning ideas into scalable <span>digital products</span>
            </>
          }
          text="Software Developer with experience in web application development, database management and responsive web solutions. Skilled in React.js, JavaScript, SQL, MySQL, REST APIs and modern development workflows."
        >
          <LaptopMockup />
        </Section>

        <ProjectsShowcase />

        <Section
          eyebrow="TECH STACK"
          title={
            <>
              Modern <span>MERN</span> development toolkit
            </>
          }
          text="React.js, JavaScript, Node.js, Express.js, MongoDB, MySQL, REST APIs, Tailwind CSS, Git & GitHub, SQL, Responsive Design, Cursor AI, ChatGPT, GitHub Copilot and Kiro."
        >
          <TechStackVisual />
        </Section>

        <CapabilityPanel />

        <OffersSection openInquiry={openInquiry} />

        <motion.section
          className="cinematic motion-section"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="eyebrow">SERVICES</p>
            <h2>
              Full stack solutions for <span>business growth</span>
            </h2>
            <p>
              Full Stack Development, Business Websites, Healthcare Websites, Dashboard Development, API Integration, Database Design, Responsive UI Development, Performance Optimization, SEO Friendly Websites and Custom Web Applications.
            </p>
          </div>
          <div className="image-frame side-shot">
            <img
              className="scene-image"
              src="/middle.png"
              alt="Developer workstation used for custom web application development"
            />
          </div>
        </motion.section>

        <motion.section
          className="cards-section motion-section"
          id="features"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">EXPERIENCE</p>
          <h2>
            Professional background and <span>education</span>
          </h2>
          <ExperienceTimeline />
        </motion.section>

        <motion.section
          className="quick-section motion-section"
          id="mods"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="eyebrow">CERTIFICATIONS</p>
            <h2>
              Learning that strengthens <span>the build</span>
            </h2>
            <p>
              Continuous learning, real world skills and in-depth knowledge to build better, faster and smarter.
            </p>
            <button className="ghost-button">Explore certifications</button>
          </div>
          <div className="quick-grid">
            {quickFeatures.map((feature) => (
              <motion.article
                className="cert-card"
                key={feature.title}
                whileHover={{ y: -8, rotateX: 4, rotateY: -3 }}
                transition={{ type: "spring", stiffness: 180, damping: 18 }}
              >
                <span>{feature.icon}</span>
                <strong>{feature.title}</strong>
                <i aria-hidden="true">↗</i>
              </motion.article>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="upgrade motion-section"
          id="download"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-12%" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow">LET'S BUILD SOMETHING AMAZING</p>
          <h2>
            Transform your idea into <span>reality</span>
          </h2>
          <p>Whether it's a business website, healthcare platform, admin dashboard, portfolio website or complete MERN application, let's transform your idea into reality.</p>
          <div className="cta-actions">
            <button type="button" onClick={openInquiry}>
              Hire Me
            </button>
            <a
              className="whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
        </motion.section>
        </div>
          </>
        )}
      </main>

      <footer>
        <div className="footer-brand">
          <span className="brand-mark">V</span>
          <strong>VINAY</strong>
          <p>Vinay Yadav is a MERN Stack Developer focused on building scalable web applications, modern user experiences and efficient backend systems.</p>
          <div className="footer-socials" aria-label="Social and contact links">
            <a href="https://github.com/Vinayadav1/vinay" target="_blank" rel="noreferrer">GitHub</a>
            <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
            <a href="mailto:vinaysalempur45@gmail.com">Email</a>
          </div>
        </div>
        <div className="footer-links">
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4>{group.title}</h4>
              {group.links.map((link) => (
                <a href="/#top" key={link}>{link}</a>
              ))}
            </div>
          ))}
        </div>
      </footer>
      </motion.div>
    </>
  );
}

export default App;
