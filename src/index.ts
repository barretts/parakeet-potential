import dotenv from "dotenv";
dotenv.config();

import { LLMController } from "./llmController";
import { ImapHandler } from "./imapHandler";

import * as fs from 'fs/promises';

async function saveObjectToFileAsync(obj: any, filePath: string): Promise<void> {
  const jsonString = JSON.stringify(obj, null, 2);
  await fs.writeFile(filePath, jsonString);
}

async function loadObjectFromFileAsync(filePath: string): Promise<any> {
  const jsonString = await fs.readFile(filePath, 'utf8');
  return JSON.parse(jsonString);
}

const llmController = new LLMController();

async function main() {
  try {
    console.log("Initializing LLM...");

    await llmController.initialize();
    await llmController.createSession();

    console.log("Fetching first email...");
    // const emailContent = await imapHandler.connectAndFetchEmail();
    const emailContent = await loadObjectFromFileAsync('./firstEmail.json');
    if (emailContent) {
      // await saveObjectToFileAsync(emailContent, 'firstEmail.json');
      console.log("Email fetched of length:", emailContent?.length);
      await llmController.preloadPrompt(
        emailContent
      );

      console.log(
        await llmController.prompt(
          `The email above offers a way to unsubscribe. Anwser true or false:`
        )
      );

      for (let question in questions) {
        console.log(
          questions[question],
          await llmController.prompt(
            questions[question] + ' Anwser true or false:' || ''
          )
        );
      }
    } else {
      console.log("no email content");
    }

    console.log("Finished fetching first email.");
  } catch (error) {
    console.error("Error in main function:", error);
  }
}

main();

const questions = [
  "The email above offers a way to unsubscribe.",
  "The email above is unsolicited.",
  "The email above requires immedite attention.",
  "The email above is related to finding work.",
  "The email above is a newsletter.",
  "The email above is time sensitive.",
  "The email above is marketing.",
  "The email above contains attachments",
  "The email above in an internal communication.",
  "The email above appears to be hand typed.",
  "The email above contains personalized messaging.",
  "The email above contains sentiments that warrant attention.",
  "The email above can be deleted without reading.",
  "The email above expects a reply.",
  "The email above indicates a recurring bill or payment.",
  "The email above is automated.",
  // "this is a true statment",
  // "is this expression true for basic math? 1+1=2",
  // "does the sky appear blue?",
  // "does the ocean appear blue?",
  // "provide 10 tags each different from the others you would use to categorize this email. use only utf-8 charset",
  // "Is the email trying to sell me something?",
  // "Does the email require immediate attention?",
  // "Is this email time-sensitive or due by a specific date?",
  // "Would an adult who doesn't want to buy anything or sign up for services think the email require a follow-up?",
  // "Should I take any action on this email (e.g., reply, review)?",
  // "Are there tasks mentioned in the email that need to be completed?",
  // "Is the email relevant to my current projects or work?",
  // "Does it contain information that could be useful for future reference?",
  // "Is this an important communication from a key stakeholder or colleague?",
  // "Should I pay special attention to emails from this sender?",
  // "Is this sender someone whose messages are typically important or time-sensitive?",
  // "Is this a promotional email, newsletter, or marketing message?",
  // "Is it an internal company communication that could affect my work?",
  // "Does the email pertain to a specific department or team I should be aware of?",
  // "Are there keywords in the subject line that indicate urgency or importance?",
  // "Do the subject lines of similar emails suggest a recurring theme or pattern?",
  // "Does the email contain any attachments or documents that need review?",
  // "Is there any critical information or data shared in the email that should be saved for later use?",
  // "Does the email address the recipient by name, indicating a personal touch?",
  // "Are there any personalized messages or sentiments expressed in the email that warrant attention?",
  // "Should this email be archived for future reference?",
  // "Is there any information in the email that would benefit from being saved in a specific folder or category?",
];