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

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* --- 1. Navigation (透明悬浮) --- */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-end p-6 text-white/90 font-medium text-sm tracking-wide mix-blend-difference">
        <div className="space-x-8">
          <a href="#about" className="hover:text-white transition-colors">ABOUT</a>
          <a href="#publications" className="hover:text-white transition-colors">RESEARCH</a>
          <a href="#projects" className="hover:text-white transition-colors">PROJECTS</a>
          <a href="#blog" className="hover:text-white transition-colors">BLOG</a>
        </div>
      </nav>

      {/* --- 2. Hero Section (全屏视觉) --- */}
      <header className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* 背景图 (模拟 Boyuan 的机器人背景) */}
        <div className="absolute inset-0 z-0">
           {/* 请在 public 放一张 hero-bg.jpg，或者用灰色背景代替测试 */}
           <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 z-10" />
           <img 
             src={DATA.hero.bgImage} 
             alt="Background" 
             className="h-full w-full object-cover"
           />
        </div>

        {/* 居中文字 */}
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
          className="relative z-20 text-center text-white max-w-4xl px-4"
        >
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
            {DATA.hero.title}
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
            {DATA.hero.subtitle} <br/>
            {DATA.hero.desc}
          </p>
        </motion.div>

        {/* 向下滚动的箭头 */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1, y: [0, 10, 0] }} 
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
          className="absolute bottom-10 z-20 text-white cursor-pointer"
        >
           <a href="#about"><ChevronDown size={32} /></a>
        </motion.div>
      </header>

      {/* --- 3. Main Content Container --- */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-24">
        
        {/* === ABOUT ME === */}
        <section id="about" className="scroll-mt-20">
          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={fadeInUp}
            className="grid md:grid-cols-[240px_1fr] gap-10 items-start"
          >
            {/* 左侧头像 */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 shadow-md">
              <img src={DATA.profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
            </div>
            
            {/* 右侧简介 */}
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">ABOUT ME</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {DATA.profile.bio}
              </p>
              
              {/* 按钮组 */}
              <div className="flex items-center gap-4 pt-4">
                <a 
                  href={DATA.profile.resume} 
                  className="px-5 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                  <FileText size={16} /> RESUME / CV
                </a>
                <div className="flex gap-3">
                   <a href={DATA.profile.social.github} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"><Github size={20}/></a>
                   <a href={DATA.profile.social.email} className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all"><Mail size={20}/></a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* === SELECTED PUBLICATIONS === */}
        <section id="publications" className="scroll-mt-20 rounded-2xl bg-slate-50 px-6 py-12 font-raleway">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-slate-900">
            SELECTED PUBLICATIONS
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
                {/* 左侧缩略图：更像第一张（小、干净、轻边框） */}
                <div className="shrink-0">
                  <div className="relative w-[280px] aspect-[4/3] overflow-hidden rounded-md border border-slate-200 bg-white">
                    <img
                      src={pub.image}
                      alt={pub.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
            
                {/* 右侧文字 */}
                <div className="min-w-0">
                  {/* 标题：蓝色链接风格（像第一张） */}
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
            
                  {/* 链接：竖线分隔，去掉 uppercase */}
                  <div className="mt-3 text-sm">
                    {Object.entries(pub.links).map(([key, url], idx, arr) => (
                      <span key={key}>
                        <a
                          href={url}
                          className="text-blue-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {key}
                        </a>
                        {idx !== arr.length - 1 && (
                          <span className="mx-2 text-slate-400">|</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </section>


        {/* === HONORS & AWARDS & COURSES (混合布局) === */}
        <section className="grid md:grid-cols-2 gap-12">
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
