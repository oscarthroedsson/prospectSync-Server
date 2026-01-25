// Test data fixtures
import { IJobPostingDTO } from "../../src/Types/job-postingt.types";
import { TriggerDefinition } from "../../src/Types/trigger.types";
import { ActionDefinition, ProcessStep } from "../../src/Types/action.types";

export const sampleJobPosting: IJobPostingDTO = {
  id: "test-job-id",
  title: "Senior Software Engineer",
  companyName: "Test Company",
  companyLogo: "https://example.com/logo.png",
  jobPostingUrl: "https://example.com/job/123",
  jobDescription: "We are looking for a senior software engineer",
  markdownText: "# Senior Software Engineer\n\nWe are looking...",
  status: "active",
  endsAt: "2024-12-31T23:59:59Z",
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
  createdJobPosting: {
    id: "",
    jobPostingId: "",
    createdByType: "system",
    createdById: "user-123",
    source: "url",
    importedAt: new Date(),
  },

  preferenceSet: {
    id: "",
    jobPostingId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    requirements: [
      { id: "", requirement: "5+ years experience", preferenceSetId: "" },
      { id: "", requirement: "TypeScript", preferenceSetId: "" },
      { id: "", requirement: "Node.js", preferenceSetId: "" },
    ],
    merits: [
      {
        id: "",
        preferenceSetId: "",
        merit: "Remote work",
      },
      {
        id: "",
        preferenceSetId: "",
        merit: "Flexible hours",
      },
    ],
    applicantQualities: [
      {
        id: "",
        quality: "Team player",
        preferenceSetId: "",
      },
      {
        id: "",
        quality: "Problem solver",
        preferenceSetId: "",
      },
    ],

    locations: [
      {
        id: "",
        city: "Stockholm",
        region: null,
        country: "Sweden",
        isRemote: false,
        lat: null,
        lng: null,
        preferenceSetId: "",
      },
    ],
    workArrangements: [{ id: "", mode: "remote_full_time", preferenceSetId: "" }],
    employmentTypes: [{ id: "", type: "full_time", preferenceSetId: "" }],
    salaries: [
      {
        id: "",
        minAmount: 30_000,
        maxAmount: 45_000,
        currency: "SEK",
        period: "month",
        notes: "Negotiable",
        preferenceSetId: "",
      },
    ],
    languages: [
      { id: "", isNative: false, preferenceSetId: "", language: "English", level: "Fluent" },
      { id: "", isNative: true, preferenceSetId: "", language: "Swedish", level: "Native" },
    ],
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
