import { executeSendEmail } from "../../../../src/services/action/send-email.action";
import { ActionDefinition } from "../../../../src/models/action.model";
import { getEmailService } from "../../../../src/services/email/email.service";
import { getStepRepository } from "../../../../src/repositories/step.repository";

jest.mock("../../../../src/services/email/email.service");
jest.mock("../../../../src/repositories/step.repository");

describe("SendEmail Action", () => {
  const mockEmailService = {
    sendEmail: jest.fn(),
  };

  const mockStepRepository = {
    getUserEmailByStepID: jest.fn(),
  };

  beforeEach(() => {
    (getEmailService as jest.Mock).mockReturnValue(mockEmailService);
    (getStepRepository as jest.Mock).mockReturnValue(mockStepRepository);
    jest.clearAllMocks();
  });

  it("should send email with CUSTOM recipient", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "CUSTOM",
        email: "test@example.com",
        subject: "Test Subject",
        content: "Test Content",
      },
    };

    mockEmailService.sendEmail.mockResolvedValue(undefined);

    await executeSendEmail(action);

    expect(mockEmailService.sendEmail).toHaveBeenCalledWith("SEND_EMAIL", {
      to: "test@example.com",
      subject: "Test Subject",
      html: "Test Content",
      text: "Test Content",
      replyTo: undefined,
    });
  });

  it("should send email with PROCESS_OWNER recipient", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "PROCESS_OWNER",
        subject: "Test Subject",
        content: "Test Content",
      },
    };

    mockStepRepository.getUserEmailByStepID.mockResolvedValue("owner@example.com");
    mockEmailService.sendEmail.mockResolvedValue(undefined);

    await executeSendEmail(action);

    expect(mockStepRepository.getUserEmailByStepID).toHaveBeenCalledWith("step-1");
    expect(mockEmailService.sendEmail).toHaveBeenCalledWith("SEND_EMAIL", {
      to: "owner@example.com",
      subject: "Test Subject",
      html: "Test Content",
      text: "Test Content",
      replyTo: undefined,
    });
  });

  it("should throw error when subject is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "CUSTOM",
        email: "test@example.com",
        content: "Test Content",
      },
    };

    await expect(executeSendEmail(action)).rejects.toThrow("Subject is required");
  });

  it("should throw error when content is missing", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "CUSTOM",
        email: "test@example.com",
        subject: "Test Subject",
      },
    };

    await expect(executeSendEmail(action)).rejects.toThrow("Content is required");
  });

  it("should throw error when CUSTOM recipient has no email", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "CUSTOM",
        subject: "Test Subject",
        content: "Test Content",
      },
    };

    await expect(executeSendEmail(action)).rejects.toThrow(
      "CUSTOM recipient type requires email field to be set"
    );
  });

  it("should throw error when PROCESS_OWNER has no stepId", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "PROCESS_OWNER",
        subject: "Test Subject",
        content: "Test Content",
      },
    };

    await expect(executeSendEmail(action)).rejects.toThrow("requires stepID");
  });

  it("should throw error when PROCESS_OWNER has no user email", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "PROCESS_OWNER",
        subject: "Test Subject",
        content: "Test Content",
      },
    };

    mockStepRepository.getUserEmailByStepID.mockResolvedValue(null);

    await expect(executeSendEmail(action)).rejects.toThrow("no user email found");
  });

  it("should include replyTo when provided", async () => {
    const action: ActionDefinition = {
      id: "action-1",
      stepId: "step-1",
      name: "Send Email",
      isPublic: true,
      order: 1,
      config: {
        type: "SEND_EMAIL",
        to: "CUSTOM",
        email: "test@example.com",
        subject: "Test Subject",
        content: "Test Content",
        replyTo: "reply@example.com",
      },
    };

    mockEmailService.sendEmail.mockResolvedValue(undefined);

    await executeSendEmail(action);

    expect(mockEmailService.sendEmail).toHaveBeenCalledWith("SEND_EMAIL", {
      to: "test@example.com",
      subject: "Test Subject",
      html: "Test Content",
      text: "Test Content",
      replyTo: "reply@example.com",
    });
  });
});
