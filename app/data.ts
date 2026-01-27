export const DATA = {
  hero: {
    title: "Hi! I'm Ariel.", // 你的名字
    subtitle: "Researcher at [Your Lab] and [Your Uni].",
    desc: "Specialized in reinforcement learning and embodied AI.",
    bgImage: "/hero-bg.webp", // 记得在 public 放入这张大图
  },
  profile: {
    name: "LArielOzjH (Your Full Name)",
    role: "AI Researcher / Student",
    bio: "I am a researcher focusing on LLMs and Robotics. I earned my degree from [University]...",
    avatar: "/avatar.jpg", // 你的头像
    social: {
      github: "https://github.com/LArielOzjH",
      email: "mailto:your.email@example.com",
      scholar: "https://scholar.google.com/...",
    },
    resume: "/resume.pdf" // 你的简历
  },
  publications: [
    {
      title: "Diffusion Forcing: Next-token Prediction Meets Full-Sequence Diffusion",
      authors: "Your Name, Co-author One, Co-author Two",
      conference: "NeurIPS 2024",
      image: "/paper1.png", // 论文缩略图
      links: {
        website: "#",
        paper: "#",
        code: "#"
      }
    },
    {
      title: "Another Great Paper on Computer Vision",
      authors: "Your Name, Big Guy",
      conference: "CVPR 2024 (Oral)",
      image: "/paper2.png",
      links: { paper: "#", code: "#" }
    }
  ],
  projects: [
    {
      title: "Autonomous Racing Robot",
      desc: "Built a 1/10 scale autonomous car using ROS2 and PPO.",
      year: "2023",
      tags: ["Robotics", "RL", "Python"]
    },
    {
      title: "Kaggle Grandmaster Solution",
      desc: "Ranked top 1% in the Image Classification challenge.",
      year: "2022",
      tags: ["CV", "PyTorch"]
    }
  ],
  honors: [
    { title: "National Scholarship", year: "2023" },
    { title: "First Prize, MCM/ICM", year: "2022" },
  ],
  courses: [
    { name: "Deep Learning", grade: "98/100" },
    { name: "Convex Optimization", grade: "A+" },
    { name: "Linear Algebra", grade: "A" },
    { name: "Data Structures", grade: "A" },
  ]
};
