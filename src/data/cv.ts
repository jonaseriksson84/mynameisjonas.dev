export interface Job {
  title: string;
  company: string;
  period: string;
  achievements: string[];
  consultancy?: string;
  buzzwords: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
  details: string[];
}

export interface TechCategory {
  title: string;
  items: string[];
}

export interface ContactInfo {
  email: string;
  phone: string;
  address: {
    name: string;
    street: string;
    city: string;
  };
  website: string;
}

export const contactInfo: ContactInfo = {
  email: "jonaseriksson84@gmail.com",
  phone: "0704200175",
  address: {
    name: "Jonas Eriksson",
    street: "Ljusstöparbacken 22",
    city: "117 65 Stockholm",
  },
  website: "mynameisjonas.dev",
};

export const aboutText: string[] = [
  "Fullstack web developer with 13+ years of professional experience, specializing in frontend development and JavaScript/TypeScript. Extensive experience with backend and API development in Go, Python, Java, and Node.js.",
  "Strong team player with proven leadership experience, equally comfortable driving projects independently. Quick to adapt to new technologies and environments while maintaining focus on delivering high-quality results.",
];

export const jobs: Job[] = [
  {
    title: "FULLSTACK ENGINEER & TECH LEAD",
    company: "Embark Studios",
    period: "June 2022 — present",
    achievements: [
      "Leading web platform development and a team of 8 fullstack developers",
      "Building core infrastructure and developer tools using TypeScript, React, Go, and Python",
    ],
    buzzwords: [
      "TypeScript",
      "React",
      "Next.js",
      "Go",
      "Python",
      "GCP",
      "Kubernetes",
      "Leadership",
    ],
  },
  {
    title: "FULLSTACK DEVELOPER",
    company: "Reason Studios",
    period: "October 2017 — June 2022",
    achievements: [
      "Technical lead for business-critical systems generating 75% of company revenue",
      "Built and maintained high-availability services serving 10,000+ daily users",
      "Architected authentication and license management systems",
    ],
    buzzwords: [
      "Python",
      "Django",
      "React",
      "MySQL",
      "PostgreSQL",
      "AWS",
      "Docker",
    ],
  },
  {
    title: "FULLSTACK DEVELOPER (consultant)",
    company: "Swedish Police Authority",
    consultancy: "HiQ",
    period: "June 2016 — October 2017",
    achievements: [
      "Led modernization of legacy systems to web-based applications",
      "Completed system migration 3 months ahead of projected timeline",
    ],
    buzzwords: ["AngularJS", "Java"],
  },
  {
    title: "FRONTEND DEVELOPER (consultant)",
    company: "Midroc",
    consultancy: "HiQ",
    period: "October 2014 — June 2016",
    achievements: [
      "Led development of company-wide intranet serving 1100+ employees",
      "Introduced modern frontend stack including AngularJS and Microsoft Graph",
    ],
    buzzwords: ["AngularJS", "Microsoft Graph", "SharePoint", "Azure AD"],
  },
  {
    title: "JAVA DEVELOPER (consultant)",
    company: "Euroclear",
    consultancy: "Capgemini",
    period: "February 2012 — August 2014",
    achievements: [
      "Advanced to lead developer within first year",
      "Core team member responsible for service reliability and team growth",
    ],
    buzzwords: ["Java", "JavaScript"],
  },
];

export const education: Education[] = [
  {
    degree:
      "M.Sc. Industrial Engineering and Management (International, Japanese)",
    institution: "The Institute of Technology at Linköping University",
    period: "2005 — 2011",
    details: [
      "Focus on Computer Science and Industrial Marketing including Japanese language studies",
    ],
  },
  {
    degree: "Exchange Studies",
    institution: "\u660E\u6CBB\u5927\u5B66 / Meiji University, Tokyo",
    period: "2008 — 2009",
    details: [
      "Business and Management courses conducted in Japanese",
    ],
  },
];

export const techStack: TechCategory[] = [
  {
    title: "Languages",
    items: [
      "JavaScript/TypeScript",
      "Python",
      "Go",
      "Java",
      "HTML5",
      "CSS3",
    ],
  },
  {
    title: "Frontend & Frameworks",
    items: ["React", "Next.js", "Angular", "Node.js", "Django"],
  },
  {
    title: "Cloud & Infrastructure",
    items: ["AWS", "GCP", "Docker", "Kubernetes", "Terraform", "Linux"],
  },
  {
    title: "Data & APIs",
    items: ["PostgreSQL", "MySQL", "BigQuery", "GraphQL", "REST"],
  },
  {
    title: "Development Tools",
    items: ["Git", "Jest/Vitest", "Bazel", "JIRA", "Confluence", "Notion"],
  },
];

export function getGroupedJobs(): Job[][] {
  return jobs.reduce((acc, job) => {
    if (!job.consultancy) {
      acc.push([job]);
    } else {
      const existingGroup = acc.find(
        (group) => group[0].consultancy === job.consultancy
      );
      if (existingGroup) {
        existingGroup.push(job);
      } else {
        acc.push([job]);
      }
    }
    return acc;
  }, [] as Job[][]);
}
