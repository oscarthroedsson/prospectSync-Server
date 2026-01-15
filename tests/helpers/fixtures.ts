// Test data fixtures

import { IJobPosting } from "../../src/models/job-posting.model";
import { ProcessStep, ActionDefinition } from "../../src/models/action.model";
import { TriggerDefinition } from "../../src/models/trigger.model";

export const sampleJobPosting: IJobPosting = {
  id: "test-job-id",
  title: "Senior Software Engineer",
  companyName: "Test Company",
  companyLogo: "https://example.com/logo.png",
  jobPostingUrl: "https://example.com/job/123",
  jobDescription: "We are looking for a senior software engineer",
  markdownText: "# Senior Software Engineer\n\nWe are looking...",
  language: [
    { language: "English", level: "Fluent" },
    { language: "Swedish", level: "Native" },
  ],
  jobRequirements: ["5+ years experience", "TypeScript", "Node.js"],
  merits: ["Remote work", "Flexible hours"],
  applicantQualities: ["Team player", "Problem solver"],
  status: "active",
  endsAt: "2024-12-31T23:59:59Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  location: {
    city: "Stockholm",
    country: "Sweden",
  },
  workArrengment: "remote",
  employmentType: "full-time",
  salary: {
    type: "monthly",
    amount: "50000",
    currency: "SEK",
    period: "month",
    benefits: ["Health insurance", "Gym membership"],
    notes: "Negotiable",
  },
  createdJobPosting: {
    createdByType: "system",
    createdById: "user-123",
    source: "url",
    importedAt: "2024-01-01T00:00:00Z",
  },
};

export const sampleStep: ProcessStep = {
  id: "test-step-id",
  processId: "test-process-id",
  name: "Interview Scheduled",
  order: 1,
  actions: [
    {
      id: "action-1",
      stepId: "test-step-id",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "PROCESS_OWNER",
        subject: "Interview Scheduled",
        content: "Your interview has been scheduled",
      },
    },
  ],
};

export const sampleAction: ActionDefinition = {
  id: "action-1",
  stepId: "test-step-id",
  name: "Send Email",
  isPublic: true,
  order: 1,
  config: {
    type: "SEND_EMAIL",
    to: "CUSTOM",
    email: "test@example.com",
    subject: "Test Email",
    content: "This is a test email",
  },
};

export const sampleTrigger: TriggerDefinition = {
  id: "trigger-1",
  order: 1,
  isPublic: false,
  createdBy: "user-123",
  triggerCode: "REMINDER",
  executeWhen: "REMINDER",
  executeAt: new Date().toISOString(),
  combinator: undefined,
  config: {
    type: "CALL_REMINDER",
    daysFromNow: 3,
    note: "Follow up call",
  },
  expiration: undefined,
  stepId: "test-step-id",
};

export const samplePDFBuffer = Buffer.from("PDF content here");

export const sampleHTML = `
<!DOCTYPE html>
<html>
<head>
  <title>Job Posting</title>
</head>
<body>
  <h1>Senior Software Engineer</h1>
  <p>We are looking for a senior software engineer...</p>
  <ul>
    <li>5+ years experience</li>
    <li>TypeScript</li>
    <li>Node.js</li>
  </ul>
</body>
</html>
`;

export const sampleResumeData = {
  id: "resume-1",
  name: "John Doe",
  title: "Senior Software Engineer",
  introduction: "Experienced software engineer...",
  contact: [
    { type: "email", value: "john@example.com" },
    { type: "phone", value: "+1234567890" },
  ],
  location: "Stockholm, Sweden",
  skills: ["TypeScript", "Node.js", "React"],
  languages: [
    { language: "English", level: "Fluent" },
    { language: "Swedish", level: "Native" },
  ],
  professionalExperience: [
    {
      company: "Tech Corp",
      title: "Senior Engineer",
      description: "Led development team...",
      start: "2020-01-01",
      end: "present",
      location: "Stockholm",
      confidence: 0.95,
      page: 1,
      raw: "Raw text from PDF",
    },
  ],
};
