import { describe, it, expect } from "vitest";
import {
  contactInfo,
  aboutText,
  jobs,
  education,
  techStack,
  getGroupedJobs,
} from "../src/data/cv.ts";

describe("contactInfo", () => {
  it("has all required fields", () => {
    expect(contactInfo.email).toBe("jonaseriksson84@gmail.com");
    expect(contactInfo.phone).toBe("0704200175");
    expect(contactInfo.website).toBe("mynameisjonas.dev");
    expect(contactInfo.address.name).toBe("Jonas Eriksson");
    expect(contactInfo.address.street).toBe("Ljusstöparbacken 22");
    expect(contactInfo.address.city).toBe("117 65 Stockholm");
  });
});

describe("aboutText", () => {
  it("has 2 paragraphs", () => {
    expect(aboutText).toHaveLength(2);
  });

  it("first paragraph mentions fullstack and 13+ years", () => {
    expect(aboutText[0]).toContain("Fullstack web developer");
    expect(aboutText[0]).toContain("13+ years");
  });

  it("second paragraph mentions team player and leadership", () => {
    expect(aboutText[1]).toContain("Strong team player");
    expect(aboutText[1]).toContain("leadership");
  });
});

describe("jobs", () => {
  it("has 5 jobs", () => {
    expect(jobs).toHaveLength(5);
  });

  it("each job has required fields", () => {
    for (const job of jobs) {
      expect(job.title).toBeTruthy();
      expect(job.company).toBeTruthy();
      expect(job.period).toBeTruthy();
      expect(job.achievements.length).toBeGreaterThan(0);
      expect(job.buzzwords.length).toBeGreaterThan(0);
    }
  });

  it("first job is Embark Studios", () => {
    expect(jobs[0].company).toBe("Embark Studios");
    expect(jobs[0].title).toContain("TECH LEAD");
  });

  it("consultant jobs have consultancy field", () => {
    const consultantJobs = jobs.filter((j) => j.consultancy);
    expect(consultantJobs).toHaveLength(3);
    expect(consultantJobs.filter((j) => j.consultancy === "HiQ")).toHaveLength(
      2
    );
    expect(
      consultantJobs.filter((j) => j.consultancy === "Capgemini")
    ).toHaveLength(1);
  });

  it("non-consultant jobs do not have consultancy field", () => {
    const directJobs = jobs.filter((j) => !j.consultancy);
    expect(directJobs).toHaveLength(2);
    expect(directJobs[0].company).toBe("Embark Studios");
    expect(directJobs[1].company).toBe("Reason Studios");
  });
});

describe("education", () => {
  it("has 2 entries", () => {
    expect(education).toHaveLength(2);
  });

  it("each entry has required fields", () => {
    for (const entry of education) {
      expect(entry.degree).toBeTruthy();
      expect(entry.institution).toBeTruthy();
      expect(entry.period).toBeTruthy();
      expect(entry.details.length).toBeGreaterThan(0);
    }
  });

  it("first entry is M.Sc. from Linköping", () => {
    expect(education[0].degree).toContain("M.Sc.");
    expect(education[0].institution).toContain("Linköping");
  });

  it("second entry is exchange at Meiji University", () => {
    expect(education[1].degree).toBe("Exchange Studies");
    expect(education[1].institution).toContain("Meiji University");
  });
});

describe("techStack", () => {
  it("has 5 categories", () => {
    expect(techStack).toHaveLength(5);
  });

  it("each category has title and non-empty items", () => {
    for (const cat of techStack) {
      expect(cat.title).toBeTruthy();
      expect(cat.items.length).toBeGreaterThan(0);
    }
  });

  it("has expected category titles", () => {
    const titles = techStack.map((c) => c.title);
    expect(titles).toContain("Languages");
    expect(titles).toContain("Frontend & Frameworks");
    expect(titles).toContain("Cloud & Infrastructure");
    expect(titles).toContain("Data & APIs");
    expect(titles).toContain("Development Tools");
  });

  it("Languages includes TypeScript and Go", () => {
    const languages = techStack.find((c) => c.title === "Languages");
    expect(languages!.items).toContain("JavaScript/TypeScript");
    expect(languages!.items).toContain("Go");
  });
});

describe("getGroupedJobs", () => {
  it("returns 4 groups", () => {
    const groups = getGroupedJobs();
    expect(groups).toHaveLength(4);
  });

  it("first group is Embark Studios (single job)", () => {
    const groups = getGroupedJobs();
    expect(groups[0]).toHaveLength(1);
    expect(groups[0][0].company).toBe("Embark Studios");
  });

  it("second group is Reason Studios (single job)", () => {
    const groups = getGroupedJobs();
    expect(groups[1]).toHaveLength(1);
    expect(groups[1][0].company).toBe("Reason Studios");
  });

  it("third group is HiQ consultancy with 2 jobs", () => {
    const groups = getGroupedJobs();
    expect(groups[2]).toHaveLength(2);
    expect(groups[2][0].consultancy).toBe("HiQ");
    expect(groups[2][1].consultancy).toBe("HiQ");
    expect(groups[2][0].company).toBe("Swedish Police Authority");
    expect(groups[2][1].company).toBe("Midroc");
  });

  it("fourth group is Capgemini consultancy with 1 job", () => {
    const groups = getGroupedJobs();
    expect(groups[3]).toHaveLength(1);
    expect(groups[3][0].consultancy).toBe("Capgemini");
    expect(groups[3][0].company).toBe("Euroclear");
  });

  it("preserves job order within groups", () => {
    const groups = getGroupedJobs();
    // HiQ group: Police Authority first, then Midroc (as in original array)
    expect(groups[2][0].period).toBe("June 2016 — October 2017");
    expect(groups[2][1].period).toBe("October 2014 — June 2016");
  });
});
