export const DATA = {
  hero: {
    title: "Hi! I'm Ariel.", 
    subtitle: "Student and Researcher at Fudan University.",
    desc: "Specialized in Statistics, Generative Models, Reinforcement Learning.",
    bgImage: "/hero-bg.webp", 
  },
  profile: {
    name: "Ariel(Yanyan Fang)",
    role: "AI Researcher / Undergraduate Student",
    bio: "Hi everyone, I am Yanyan Fang, pursuing my undergraduate degree in Fudan Univerisity (FDU) majoring statistics, I am currently a researcher focusing on Generative Models and Reinforcement Learning under Prof Zuxuan Wu's guidance in Fudan Vision and Learning Laboratory (FVL). I have studied Operations Research, Introduction to Embodied Intelligence, Time Series Analysis, Probability Theory and Mathematical Statistics, Feature Engineering, Linear Algebra courses and get all of them A or A+, besides I also self-motivated to learn the Stanford CS231n and CS234, which laid a solid foundation for my further research. Outside of research, I enjoy badmiton, chinese classical dancing and boxing.",
    avatar: "/avatar.jpg", 
    social: {
      github: "https://github.com/LArielOzjH",
      email: "mailto:23301050260@m.fudan.edu.cn",
      scholar: "https://scholar.google.com/...",
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
      title: "DNA Storage",
      authors: "Zhuojun Han, Yanyan Fang",
      conference: "Memory Technology",
      image: "/paper3.png",
      links: { paper: "#", code: "#" }
    }
  ],
  projects: [
    {
      title: "ROS-Based Mobile Robot Obstacle Avoidance with YOLO-FastestV2",
      desc: "I assembled a small mobile robot from scratch and implemented an on-board obstacle-avoidance pipeline using YOLO-FastestV2 for real-time object detection. The system was developed and integrated on ROS (Robot Operating System), where I built the perception and control stack as modular nodes, handling sensor/image acquisition, inference, and motion commands. The robot leverages detection outputs to perform reactive navigation and collision avoidance, demonstrating an end-to-end embodied AI workflow from hardware integration to deployment-oriented robotics software.",
      year: "2025",
      tags: ["Robotics", "ROS", "YOLO"]
    },
    {
      title: "Kaggle CSIRO - Image2Biomass Prediction",
      desc: "Build models that predict pasture biomass from images, ground-truth measurements, and publicly available datasets. Farmers will use these models to determine when and how to graze their livestock. I ensemble the SigLIP and DinoV3 models and conduct elegant feature engineering and finally hit the browne medal.",
      year: "2026",
      tags: ["CV", "VLM"]
    },

    {
      title: "On The Difficulty Of Robotic Arm Manipulation Using Imitation Learning And Offline Reinforcement Learning",
      desc: "I designed a customized robotic manipulation task (PandaPickPlaceBread task using Franka Panda Emika robot) along with a controlled simulation environment based on Robosuite, a simulation framework powered by the MuJoCo physics engine for robot learning. Within this setup, I systematically collected a large set of expert demonstration trajectories including necessary values for policy learning by teleoperation using Keyboard. Using this dataset, I trained three representative policies for rollout evaluation: a behavior cloning (BC) policy implemented as a multi-layer perceptron (MLP), a sequence-based BC policy using a gated recurrent unit (GRU) to model temporal dependencies, and an offline reinforcement learning policy based on Batch-Constrained Q-learning (BCQ).",
      year: "2026",
      tags: ["IL", "RL"]
    }
  ],
  honors: [
    { title: "National Scholarship", year: "2023-2024" },
    { title: "First Prize, MCM/ICM", year: "2022-2023" },
    { title: "Browne Medal in Kaggle", year: "2025-2026" },
    { title: "Secondary Scholarship", year: "2024-2025" },
  ],
  courses: [
    { name: "Operations Research", grade: "A+" },
    { name: "Introduction to Embodied Intelligence", grade: "A" },
    { name: "Linear Algebra", grade: "A" },
    { name: "Time Series Analysis", grade: "A" },
    { name: "Probability Theory and Mathematical Statistics", grade: "A" },
    { name: "Feature Engineering", grade: "A" },
    { name: "MIS", grade: "A+" },
  ]
};
