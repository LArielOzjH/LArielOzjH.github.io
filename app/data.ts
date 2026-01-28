export const DATA = {
  hero: {
    title: "Hi! I'm Ariel.", 
    subtitle: "Student and Researcher at Fudan University.",
    desc: "Specialized in Statistics, Generative Models, Reinforcement Learning.",
    bgImage: "/hero-bg.webp", 
  },
  profile: {
    name: "Ariel (Yanyan Fang)",
    role: "AI Researcher / Undergraduate Student",
    bio: "Hi everyone, I am Yanyan Fang, pursuing my undergraduate degree in Fudan Univerisity (FDU) majoring statistics, I am currently a researcher focusing on Generative Models and Reinforcement Learning under Prof Zuxuan Wu's guidance in Fudan Vision and Learning Laboratory (FVL). I have studied Operations Research, Python for Data Analysis, Introduction to Embodied Intelligence, Time Series Analysis, Probability Theory and Mathematical Statistics, Feature Engineering, Linear Algebra courses and get all of them A or A+, besides I also self-motivated to learn the Stanford CS231n and CS234 and actively follow frontier AI research and industry developments to stay current with state-of-the-art methods, which laid a solid foundation for my further research. Outside of research, I enjoy badmiton, chinese classical dancing and boxing.",
    avatar: "/avatar.jpg", 
    social: {
      github: "https://github.com/LArielOzjH",
      email: "mailto:23301050260@m.fudan.edu.cn",
      scholar: "https://scholar.google.com/...",
      linkedin: "https://www.linkedin.com/in/%E5%A6%8D%E5%A6%8D-%E6%96%B9-59303b3a9/",
    },
    resume: "/resume.pdf" 
  },
  publications: [
    {
      title: "CIM-Pruner:A Dual-Mode Compute-In-Memory Macro for Efficient VLMs with Intra-Chunk Token Pruning and Merging",
      authors: "Zhuojun Han, Siqi He, Chixiao Chen, and Haozhe Zhu",
      conference: "ISCAS 2026 (IEEE International Symposium on Circuits and Systems)",
      image: "/paper1.png", 
      links: {
        website: "#",
        paper: "#",
        code: "#"
      }
    },

    {
      title: "On The Difficulty Of Robotic Arm Manipulation Using Imitation Learning And Offline Reinforcement Learning",
      authors: "Zhuojun Han, Yanyan Fang",
      conference: "ICLR 2025 (International Conference on Learning Representations)",
      image: "/paper2.png",
      links: { paper: "#", code: "#" }
    },

    {
      title: "DNA Storage - research landscape and future prospects",
      authors: "Zhuojun Han, Yanyan Fang",
      conference: "Memory Technology courses 2026",
      image: "/paper3.png",
      links: { paper: "#", code: "#" }
    }
  ],
  projects: [
    {
      title: "ROS-Based Mobile Robot Obstacle Avoidance with YOLO-FastestV2",
      desc: "Built an end-to-end obstacle-avoidance system on a self-assembled mobile robot, enabling real-time perception-to-control navigation. Implemented a YOLO-FastestV2-based detection pipeline within ROS, organized as modular nodes for sensor acquisition, on-board inference, and motion command generation. Demonstrated reliable reactive navigation by translating detection outputs into collision-aware control policies, highlighting a deployment-oriented embodied AI workflow from hardware integration to robotics software.",
      year: "2025",
      tags: ["Robotics", "ROS", "YOLO"],
      image: "/pj1.png",
      links: { demo: "...", code: "...", paper: "..." } 
    },
    {
      title: "Kaggle CSIRO - Image2Biomass Prediction",
      desc: "Developed a multimodal regression pipeline to predict pasture biomass from field images and tabular measurements for practical grazing decision support. Combined SigLIP and DINOv3 representations with carefully designed feature engineering and ensembling to improve generalization and robustness. Achieved strong leaderboard performance and earned a Bronze Medal, validating the effectiveness of foundation-model features for real-world agritech forecasting.",
      year: "2026",
      tags: ["CV", "VLM"],
      image: "/pj2.png",
      links: { demo: "...", code: "...", paper: "..." } 
    },

    {
      title: "On The Difficulty Of Robotic Arm Manipulation Using Imitation Learning And Offline Reinforcement Learning",
      desc: "Designed a controlled robotic manipulation benchmark (Franka Panda pick-and-place) and collected expert demonstrations via teleoperation for systematic policy evaluation. Built a Robosuite/MuJoCo simulation pipeline and trained representative learners—MLP behavior cloning, sequence-based GRU cloning, and BCQ-style offline reinforcement learning—to compare temporal modeling and offline RL under identical data constraints. Conducted rollout evaluations to characterize failure modes and performance gaps, providing practical insights into why manipulation remains challenging under imitation and offline learning settings.",
      year: "2026",
      tags: ["IL", "RL"],
      image: "/pj3.png",
      links: { demo: "...", code: "...", paper: "..." } 
    }
  ],
  honors: [
    { title: "National Scholarship", year: "2023-2024", desc: "Top 1% in cohort" },
    { title: "First Prize, MCM/ICM", year: "2022-2023", desc: "Top 5% in cohort" },
    { title: "Browne Medal in Kaggle", year: "2025-2026", desc: "Top 10% in leaderboard" },
    { title: "Secondary Scholarship", year: "2024-2025", desc: "Top 10% in cohort" },
  ],
  courses: [
    { name: "Operations Research", grade: "A+" },
    { name: "Introduction to Embodied Intelligence", grade: "A" },
    { name: "Python for Data Analysis", grade: "A" },
    { name: "Regression Analysis", grade: "A" },
    { name: "Time Series Analysis", grade: "A" },
    { name: "Probability Theory and Mathematical Statistics", grade: "A" },
    { name: "Feature Engineering", grade: "A" },
    { name: "Linear Algebra", grade: "A" },
    { name: "MIS", grade: "A+" },
    { name: "Accounting", grade: "A" },
  ]
};
