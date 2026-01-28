"use client";

import { DATA } from "./data";
import { motion } from "framer-motion"; // 引入动画库
import { Github, Mail, FileText, ChevronDown, ArrowUpRight, Linkedin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// 动画配置
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

import React from "react";

function Typewriter({
  words,
  className = "",
  typingSpeed = 70,   // 每个字符打字速度(ms)
  deletingSpeed = 35, // 删除速度
  holdMs = 900,       // 打完停留
  pauseMs = 250,      // 切换前停顿
}: {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  holdMs?: number;
  pauseMs?: number;
}) {
  const [idx, setIdx] = React.useState(0);
  const [sub, setSub] = React.useState(0); // 当前显示到第几个字符
  const [mode, setMode] = React.useState<"typing" | "holding" | "deleting" | "pausing">("typing");

  const current = words[idx] ?? "";

  React.useEffect(() => {
    if (!words.length) return;

    let t: number;

    if (mode === "typing") {
      if (sub < current.length) {
        t = window.setTimeout(() => setSub(sub + 1), typingSpeed);
      } else {
        t = window.setTimeout(() => setMode("holding"), holdMs);
      }
    }

    if (mode === "holding") {
      t = window.setTimeout(() => setMode("deleting"), pauseMs);
    }

    if (mode === "deleting") {
      if (sub > 0) {
        t = window.setTimeout(() => setSub(sub - 1), deletingSpeed);
      } else {
        // 下一个词
        const next = (idx + 1) % words.length;
        setIdx(next);
        setMode("pausing");
      }
    }

    if (mode === "pausing") {
      t = window.setTimeout(() => setMode("typing"), pauseMs);
    }

    return () => window.clearTimeout(t);
  }, [mode, sub, idx, current, words, typingSpeed, deletingSpeed, holdMs, pauseMs]);

  const shown = current.slice(0, sub);

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span>{shown}</span>
      {/* cursor */}
      <span className="ml-1 inline-block w-[2px] h-[1.05em] align-baseline bg-white/90 animate-pulse" />
    </span>
  );
}

const courseDot = (name: string) => {
  const n = name.toLowerCase();

  // Math / Stats
  if (n.includes("probability") || n.includes("statistics") || n.includes("regression"))
    return "bg-emerald-500/80";

  // Time series
  if (n.includes("time") || n.includes("series"))
    return "bg-amber-500/80";

  // Linear algebra / math foundations
  if (n.includes("linear") || n.includes("algebra"))
    return "bg-sky-500/80";

  // OR / Optimization
  if (n.includes("operations") || n.includes("research"))
    return "bg-indigo-500/80";

  // AI / Robotics
  if (n.includes("embodied") || n.includes("intelligence") || n === "ai")
    return "bg-violet-500/80";

  // Data / Engineering
  if (n.includes("python") || n.includes("feature"))
    return "bg-cyan-500/80";

  // Business / Management
  if (n.includes("mis") || n.includes("accounting"))
    return "bg-rose-500/70";

  return "bg-slate-400/80";
};


function TopNav() {
  const items = [
    { id: "home", label: "HOME" },
    { id: "about", label: "ABOUT" },
    { id: "publications", label: "RESEARCH" },
    { id: "honors", label: "HONORS" },
    { id: "projects", label: "PROJECTS" },
    { id: "blog", label: "BLOG" },
  ];

  const [active, setActive] = React.useState<string>("home");
  const [scrolled, setScrolled] = React.useState(false);

  // 1) 过了 hero 就切换样式
  React.useEffect(() => {
    const hero = document.getElementById("home");
    if (!hero) return;

    const onScroll = () => {
      // hero 高度大概 = 1屏；滚出 70% 后切换
      const trigger = hero.offsetHeight * 0.7;
      setScrolled(window.scrollY > trigger);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 2) Scroll spy：当前模块下划线
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .map((e) => ({
            id: (e.target as HTMLElement).id,
            top: (e.target as HTMLElement).getBoundingClientRect().top,
          }))
          // top 越接近 0（但为正或略负）越应该算 active
          .sort((a, b) => Math.abs(a.top) - Math.abs(b.top));
    
        if (visible[0]?.id) setActive(visible[0].id);
      },
      {
        root: null,
        rootMargin: "-25% 0px -65% 0px",
        threshold: [0, 0.1],
      }
    );
    

    items.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const baseText = scrolled ? "text-slate-900" : "text-white";
  const hoverText = scrolled ? "hover:text-slate-500" : "hover:text-white/60";
  const underline = scrolled ? "after:bg-slate-900/90" : "after:bg-white/90";

  return (
    <div
      className={[
        "transition-colors",
        scrolled
          ? "bg-white/95 backdrop-blur border-b border-slate-200"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-end">
        <div className="space-x-8 text-sm font-medium tracking-wide">
          {items.map((it) => {
            const isActive = active === it.id;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className={[
                  "relative pb-1 transition-colors",
                  baseText,
                  hoverText,
                  underline,
                  isActive ? "after:opacity-100" : "after:opacity-0",
                  "after:absolute after:left-0 after:right-0 after:-bottom-[2px] after:h-[2px] after:transition-opacity",
                ].join(" ")}
              >
                {it.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}



export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- 1. Navigation (透明悬浮) --- */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <TopNav />
      </nav>

      {/* --- 2. Hero Section (Boyuan-style) --- */}
      <header id="home" className="relative h-screen w-full overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0">
          <img
            src={DATA.hero.bgImage}
            alt="Background"
            className="h-full w-full object-cover"
          />
          {/* Dark overlay like Boyuan */}
          <div className="absolute inset-0 bg-black/45" />
          {/* subtle bottom vignette */}
          <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/55 to-transparent" />
        </div>

        {/* Content: left aligned */}
        <div className="relative z-10 h-full">
          <div className="max-w-6xl mx-auto px-6 h-full flex items-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-5xl"
            >
              <h1 className="text-white text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-bold leading-none tracking-tight">
                Hi! I&apos;m Yanyan Fang.
              </h1>

              <p className="mt-6 text-white/90 text-lg md:text-2xl leading-relaxed">
                Student and Researcher at Fudan University.
              </p>

              {/* typing line */}
              <p className="mt-2 text-white/90 text-lg md:text-2xl leading-relaxed">
                Specialized in{" "}
                <Typewriter
                  words={["Statistics", "Generative Models", "Reinforcement Learning"]}
                  className="text-white font-medium"
                />
                .
              </p>
            </motion.div>
          </div>

          {/* down arrow: left bottom like Boyuan */}
          <div className="absolute left-0 right-0 bottom-10 z-10">
            <div className="max-w-6xl mx-auto px-6">
              <a href="#about" className="inline-flex items-center text-white/90 hover:text-white transition-colors">
                <ChevronDown size={34} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* --- 3. Main Content Container --- */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        
        {/* === ABOUT ME === */}
        <section id="about" className="scroll-mt-20 font-raleway">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp}
            className="grid md:grid-cols-[410px_1fr] gap-16 items-start"
          >
            {/* 左侧头像 */}
            {/* 头像 + 堆叠底片 */}
            <div className="relative w-full">
              {/* 底下那块灰色“垫片” */}
              <div className="absolute -left-6 -bottom-6 h-full w-full bg-gray-100" />

              {/* 上面的头像图 */}
              <div className="relative aspect-square w-full overflow-hidden bg-slate-100 border border-slate-200">
                <img src={DATA.profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
              </div>
            </div>
            
            {/* 右侧简介 */}
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900">ABOUT ME</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {DATA.profile.bio}
              </p>
              
              {/* 按钮组 */}
              <div className="flex items-center gap-4 pt-4">
                <a 
                  href={DATA.profile.resume} 
                  className="px-5 py-2 bg-slate-900 text-white text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                  RESUME / CV
                </a>
                {/* 往右推：ml-6 / ml-8 自己调 */}
                <div className="ml-36 flex gap-3">
                  <a
                    href={DATA.profile.social.github}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                    aria-label="GitHub"
                  >
                    <Github size={20} />
                  </a>

                  <a
                    href={DATA.profile.social.email}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                    aria-label="Email"
                  >
                    <Mail size={20} />
                  </a>

                  <a
                    href={DATA.profile.social.linkedin}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                    aria-label="LinkedIn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Linkedin size={20} />
                  </a>

                  <a
                    href={DATA.profile.resume}
                    className="p-2 rounded-full bg-slate-900 text-white hover:bg-slate-700 transition-colors"
                    aria-label="CV"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileText size={20} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* === SELECTED PUBLICATIONS === */}
        <section id="publications" className="scroll-mt-20 bg-gray-100 font-raleway relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
              SELECTED WORKS
            </h2>

            <div className="mt-10 space-y-10">
              {DATA.publications.map((pub, i) => (
                <motion.article
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeInUp}
                  className="flex gap-14"
                >
                  <div className="shrink-0">
                    <div className="relative w-[280px] aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-white">
                      <img src={pub.image} alt={pub.title} className="h-full w-full object-cover" />
                    </div>
                  </div>
              
                  <div className="min-w-0">
                    <h3 className="text-xl font-medium leading-snug text-slate-900">
                      <a
                        href={pub.links?.paper || pub.links?.website || "#"}
                        className="text-slate-900 hover:text-slate-600 transition-colors"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {pub.title}
                      </a>
                    </h3>
              
                    <p className="mt-1 text-sm text-slate-600">{pub.authors}</p>
                    <p className="mt-1 text-sm text-slate-800">
                      <span className="font-semibold">{pub.conference}</span>
                    </p>
              
                    <div className="mt-3 text-sm">
                      {Object.entries(pub.links).map(([key, url], idx, arr) => (
                        <span key={key}>
                          <a href={url} className="text-blue-700 hover:underline" target="_blank" rel="noreferrer">
                            {key}
                          </a>
                          {idx !== arr.length - 1 && <span className="mx-2 text-slate-400">|</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>



        {/* === HONORS & AWARDS & COURSES (混合布局) === */}
        <section id="honors" className="grid md:grid-cols-2 gap-12 scroll-mt-20">
           {/* Awards */}
           <div>
              <h2 className="text-xl font-semibold tracking-tight mb-6 pb-2 border-b border-slate-200">HONORS & AWARDS</h2>
              <ul className="relative space-y-6">
                {/* 竖线 */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-slate-200" />
                {DATA.honors.map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: i * 0.03 }}
                    className="relative pl-10"
                  >
                    {/* 圆点 */}
                    <span className="absolute left-0 top-1.5 h-4 w-4 rounded-full bg-white border-2 border-slate-400" />
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-slate-900 font-medium">{item.title}</div>
                        {item.desc && <div className="text-sm text-slate-500 mt-1">{item.desc}</div>}
                      </div>
                      <div className="text-sm text-slate-500 font-mono whitespace-nowrap">{item.year}</div>
                    </div>
                  </motion.li>
                ))}
              </ul>
           </div>

           {/* Coursework */}
           <div>
              <h2 className="text-xl font-semibold tracking-tight mb-6 pb-2 border-b border-slate-200">SELECTED COURSEWORK</h2>
              <div className="flex flex-wrap gap-2">
                {DATA.courses.map((c, i) => (
                  <motion.span
                    key={i}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white
                               px-4 py-2 text-sm text-slate-800
                               hover:border-slate-300 hover:shadow-sm transition
                               hover:bg-slate-50"
                  >
                    <span className={["h-2 w-2 rounded-full", courseDot(c.name)].join(" ")} />
                    <span className="whitespace-nowrap">{c.name}</span>
                    <span className="text-slate-300">|</span>
                    <span className="font-mono text-slate-500">{c.grade}</span>
                  </motion.span>
                ))}
              </div>

           </div>
        </section>

        {/* === PROJECTS & EXPERIENCE === */}
        <section id="projects" className="scroll-mt-24">
          <div className="flex items-end justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">PROJECTS</h2>
              <p className="mt-2 text-slate-600">
                A few selected projects across embodied AI, CV, and applied ML.
              </p>
            </div>
          </div>

          {(() => {
            const featured = DATA.projects?.[0];
            const rest = DATA.projects?.slice(1) ?? [];
          
            return (
              <div className="space-y-10">
                {/* Featured project */}
                {featured && (
                  <motion.article
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45 }}
                    className="group overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-xl transition"
                  >
                    <div className="grid md:grid-cols-[1.2fr_1fr]">
                      {/* image */}
                      <div className="relative h-64 md:h-full bg-slate-100 overflow-hidden">
                        <img
                          src={featured.image || "/projects/placeholder.webp"}
                          alt={featured.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-80" />
                        <div className="absolute left-6 bottom-5 text-white">
                          <div className="text-xs tracking-widest uppercase text-white/80">Featured</div>
                          <div className="mt-1 text-sm font-mono text-white/80">{featured.year}</div>
                        </div>
                      </div>
                
                      {/* content */}
                      <div className="p-7 md:p-9">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl md:text-2xl font-semibold leading-snug text-slate-900">
                            {featured.title}
                          </h3>
                          <span className="shrink-0 text-xs font-mono text-slate-400">{featured.year}</span>
                        </div>
                
                        <p className="mt-4 text-slate-600 leading-relaxed line-clamp-5">
                          {featured.desc}
                        </p>
                
                        <div className="mt-5 flex flex-wrap gap-2">
                          {featured.tags?.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700
                                         group-hover:bg-white transition"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* links (optional) */}
                        {featured.links && (
                          <div className="mt-6 flex flex-wrap gap-4 text-sm">
                            {Object.entries(featured.links).map(([k, url]) => (
                              <a
                                key={k}
                                href={String(url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-500 transition-colors"
                              >
                                {k} <ArrowUpRight size={16} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.article>
                )}

                {/* Grid projects */}
                <div className="grid md:grid-cols-2 gap-6">
                  {rest.map((proj: any, i: number) => (
                    <motion.article
                      key={i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.35, delay: i * 0.04 }}
                      whileHover={{ y: -6 }}
                      className="group overflow-hidden border border-slate-200 bg-white hover:border-slate-300 hover:shadow-lg transition"
                    >
                      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                        <img
                          src={proj.image || "/projects/placeholder.webp"}
                          alt={proj.title}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent opacity-0 group-hover:opacity-100 transition" />
                      </div>
                  
                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-lg font-semibold leading-snug text-slate-900">
                            {proj.title}
                          </h3>
                          <span className="text-xs font-mono text-slate-400 shrink-0">{proj.year}</span>
                        </div>
                  
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed line-clamp-4">
                          {proj.desc}
                        </p>
                  
                        <div className="mt-4 flex flex-wrap gap-2">
                          {proj.tags?.map((tag: string) => (
                            <span
                              key={tag}
                              className="text-xs px-3 py-1 rounded-full border border-slate-200 bg-slate-50 text-slate-700
                                         group-hover:bg-white transition"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {proj.links && (
                          <div className="mt-5 flex flex-wrap gap-4 text-sm">
                            {Object.entries(proj.links).map(([k, url]) => (
                              <a
                                key={k}
                                href={String(url)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-slate-700 hover:text-slate-500 transition-colors"
                              >
                                {k} <ArrowUpRight size={16} />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>


        {/* === BLOG (Simple Link) === */}
        <section id="blog" className="py-10 text-center">
            <Link href="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors">
                Visit my Blog <ArrowUpRight size={16}/>
            </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-100">
        © {new Date().getFullYear()} {DATA.profile.name}. Built with Next.js & Tailwind.
      </footer>

    </div>
  );
}
