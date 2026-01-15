import { ActionDefinition } from "../../models/action.model";
import { getEmailService } from "../email/email.service";
import { getStepRepository } from "../../repositories/step.repository";

export async function executeSendEmail(action: ActionDefinition): Promise<void> {
  const config = action.config;
  const emailService = getEmailService();

  const to = config.to as string;
  const subject = config.subject as string;
  const customEmail = config.email as string;
  const content = config.content as string;
  const replyTo = config.replyTo as string;

  if (!subject) {
    throw new Error("SEND_EMAIL - Subject is required");
  }

  if (!content) {
    throw new Error("SEND_EMAIL - Content is required");
  }

  // Resolve recipient email
  let recipientEmail = "";
  if (!to) {
    if (customEmail) {
      recipientEmail = customEmail;
    } else {
      throw new Error("no recipient specified (to is empty and email is empty)");
    }
  } else {
    const toUpper = to.toUpperCase();
    switch (toUpper) {
      case "CUSTOM":
        if (!customEmail) {
          throw new Error("CUSTOM recipient type requires email field to be set");
        }
        recipientEmail = customEmail;
        break;
      case "PROCESS_OWNER":
        if (!action.stepId) {
          throw new Error("PROCESS_OWNER recipient type requires stepID");
        }
        const stepRepo = getStepRepository();
        const userEmail = await stepRepo.getUserEmailByStepID(action.stepId);
        if (!userEmail) {
          throw new Error(`no user email found for step ${action.stepId}`);
        }
        recipientEmail = userEmail;
        break;
      case "COUNTERPART":
        throw new Error("COUNTERPART recipient type not yet implemented");
      case "ALL_COUNTERPARTS":
        throw new Error("ALL_COUNTERPARTS recipient type not yet implemented");
      case "SYSTEM":
        throw new Error("SYSTEM recipient type not yet implemented");
      default:
        throw new Error(`unknown recipient type: ${to}`);
    }
  }

  console.log(
    `📧 [ActionExecutor] SEND_EMAIL - To: ${to}, Email: ${recipientEmail}, Subject: ${subject}`
  );

  await emailService.sendEmail("SEND_EMAIL", {
    to: recipientEmail,
    subject,
    html: content,
    text: content,
    replyTo: replyTo || undefined,
  });

  console.log(
    `✅ [ActionExecutor] SEND_EMAIL - Email sent successfully to ${recipientEmail}`
  );
}
