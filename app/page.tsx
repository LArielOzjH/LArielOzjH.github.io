"use client";

import { DATA } from "./data";
import { motion } from "framer-motion"; // 引入动画库
import { Github, Mail, FileText, ChevronDown, ArrowUpRight } from "lucide-react";
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
      <span className="ml-1 inline-block w-[10px] h-[1.2em] align-bottom bg-white/90 animate-pulse" />
    </span>
  );
}
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
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0));
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      {
        root: null,
        rootMargin: "-35% 0px -55% 0px",
        threshold: [0.1, 0.2, 0.4, 0.6],
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
              className="max-w-3xl"
            >
              <h1 className="text-white font-semibold tracking-tight
                             text-5xl md:text-7xl lg:text-8xl">
                Welcom! I&apos;m Yanyan Fang.
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
            className="grid md:grid-cols-[360px_1fr] gap-10 items-start"
          >
            {/* 左侧头像 */}
            {/* 头像 + 堆叠底片 */}
            <div className="relative w-full">
              {/* 底下那块灰色“垫片” */}
              <div className="absolute -right-6 -bottom-6 h-full w-full bg-gray-200" />

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
                <div className="ml-16 flex gap-3">
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
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* === SELECTED PUBLICATIONS === */}
        <section id="publications" className="scroll-mt-20 bg-gray-200 font-raleway relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen">
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
                  className="flex gap-8"
                >
                  <div className="shrink-0">
                    <div className="relative w-[280px] aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-white">
                      <img src={pub.image} alt={pub.title} className="h-full w-full object-cover" />
                    </div>
                  </div>
              
                  <div className="min-w-0">
                    <h3 className="text-xl leading-snug text-slate-900">
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
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-slate-100">HONORS & AWARDS</h2>
              <ul className="space-y-4">
                {DATA.honors.map((item, i) => (
                    <li key={i} className="flex justify-between text-sm">
                        <span className="text-slate-700 font-medium">{item.title}</span>
                        <span className="text-slate-400 font-mono">{item.year}</span>
                    </li>
                ))}
              </ul>
           </div>

           {/* Coursework */}
           <div>
              <h2 className="text-xl font-bold mb-6 pb-2 border-b border-slate-100">SELECTED COURSEWORK</h2>
              <div className="flex flex-wrap gap-2">
                 {DATA.courses.map((c, i) => (
                     <div key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded text-xs flex gap-2">
                        <span className="text-slate-700">{c.name}</span>
                        <span className="text-slate-400 font-mono border-l pl-2">{c.grade}</span>
                     </div>
                 ))}
              </div>
           </div>
        </section>

        {/* === PROJECTS & EXPERIENCE === */}
        <section id="projects" className="scroll-mt-20">
           <h2 className="text-2xl font-bold mb-8 pb-2 border-b border-slate-100">PROJECTS & EXPERIENCE</h2>
           <div className="grid md:grid-cols-2 gap-6">
              {DATA.projects.map((proj, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="p-6 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all"
                  >
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-slate-900">{proj.title}</h3>
                        <span className="text-xs font-mono text-slate-400">{proj.year}</span>
                     </div>
                     <p className="text-sm text-slate-600 mb-4 h-12 line-clamp-2">{proj.desc}</p>
                     <div className="flex flex-wrap gap-2">
                        {proj.tags.map((tag, t) => (
                            <span key={t} className="text-[10px] px-2 py-1 bg-white border border-slate-200 rounded-full text-slate-500">
                                {tag}
                            </span>
                        ))}
                     </div>
                  </motion.div>
              ))}
           </div>
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
