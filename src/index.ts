import dotenv from "dotenv";
dotenv.config();

import { LLMController } from "./llmController";
import { ImapHandler } from "./imapHandler";
import { getLatestEmails, moveEmailsToFolder } from "./imapTest";
import { loadObjectFromFileAsync, saveObjectToFileAsync } from "./exportImportEmailObject";
import { htmlToText } from "html-to-text";
import { simpleParser } from "mailparser";
import { ImapFlow } from "imapflow";

const questions = [
  { value: 10, targetFolder: "Unsubscribe", question: "The email above mentions unsubscribe.", },
  { value: 2, targetFolder: "Delete", question: "The email above can be deleted without reading.", },
  { value: 3, targetFolder: "Ignore", question: "The email can be ignored by a person who doesn't want distractions, to buy anything or sign up for anything new and wants to ignore solicitors.", },
  { value: 3, targetFolder: "Ignore", question: "The email does not require a reply from a person who doesn't want distractions, to buy anything or sign up for anything new and wants to ignore solicitors.", },
  { value: 12, targetFolder: "Ignore", question: "The email uses the phrase \"special offer\".", },
  { value: 1, targetFolder: "Important", question: "The email above is time sensitive.", },
  { value: 1, targetFolder: "Important", question: "The email above requires immedite attention.", },
  { value: 5, targetFolder: "Job Important", question: "The email above is about an interview or job related meeting.", },
  { value: 5, targetFolder: "Job Important", question: "The email above is about an interview.", },
  { value: 4, targetFolder: "Job", question: "The email above is about new job listings.", },
  { value: 4, targetFolder: "Job", question: "The email above is related to job alerts.", },
  { value: 5, targetFolder: "Job", question: "The email above is about jobs.", },
  { value: 1, targetFolder: "Mass", question: "The email above is newsletter or marketing.", },
  { value: 1, targetFolder: "Mass", question: "The email above is automated.", },
  { value: 1, targetFolder: "Mass", question: "The email above is unsolicited.", },
  { value: 1, targetFolder: "Mass", question: "The email above was a mass email.", },
  { value: 1, targetFolder: "Mass", question: "The email above was sent out to more than just me.", },
  { value: 2, targetFolder: "Personal", question: "The email above contains personalized messaging.", },
  { value: 2, targetFolder: "Personal", question: "The email above is from an individual.", },
  { value: 12, targetFolder: "Recurring", question: "The email above does NOT solicit me, refers to a a service I already pay for, recurring payment using the word \"payment\".", },
  { value: 11, targetFolder: "Shopping", question: "The email above is about online shopping completed but not about sales or deals.", },
  { value: 9, targetFolder: "Solicitation", question: "The email's main purpose is to solicit me to sign up for something, register for something or buy something." }
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



const client = new ImapFlow({
  host: process.env.IMAP_HOST || "",
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER || "",
    pass: process.env.IMAP_PASSWORD || "",
  },
});

const llmController = new LLMController();

function stripCssFromHtml(html: string): string {
  const styleTagRegex = /<style[^>]*>[^<]*<\/style>/gi;
  let strippedHtml = html?.replace(styleTagRegex, '');

  const inlineStyleRegex = / style="[^"]*"/gi;
  strippedHtml = strippedHtml?.replace(inlineStyleRegex, '');

  return strippedHtml;
}

function extractEnglishTextAndPunctuation(input: string): string {
  const regex = /[a-zA-Z.,!? ]+/g;

  const matches = input?.match(regex);

  return matches ? matches?.join(" ") : " ";
}

function removeUrls(str) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return str?.replace(urlPattern, "");
}

function getKeyWithHighestValue(obj) {
  return Object.keys(obj).reduce((a, b) => (obj[a] > obj[b] ? a : b));
}

async function main() {
  try {
    console.log("Initializing LLM...");

    await llmController.initialize();
    await llmController.createSession();

    console.log("Fetching first email...");
    const emails = await getLatestEmails(client);
    // const emails = await loadObjectFromFileAsync('./emails.json');
    await saveObjectToFileAsync(emails, './emails.json');

    for (let email in emails) {
      console.log(Object.keys(emails[email]))
      const rawText = emails[email].text;
      const parsedEmail = await simpleParser(rawText);
      // const processedText = extractEnglishTextAndPunctuation(
      //   removeUrls(htmlToText(stripCssFromHtml(rawText as string)))
      // );
      // console.log(parsedEmail);
      const emailContent = extractEnglishTextAndPunctuation(removeUrls(parsedEmail.text));
      if (emailContent) {
        console.log("Email fetched of length:", emailContent?.length);

        await llmController.preloadPrompt(
          "we're going to discuss this email: " + emailContent
        );
        console.log('------------------------------------------------')
        console.log('start email')
        console.log('------------------------------------------------')
        console.log(emailContent)
        console.log('------------------------------------------------')
        const score = {};
        for (let q in questions) {
          const { targetFolder, question, value } = questions[q];
          await llmController.resetContext();
          let answer =
            await llmController.prompt(
              emailContent + '\n\n"' + question + '" Do you agree? Answer with true or false:' || ''
              // questions[question] || ''
            );
          // let answerTwo = await llmController.prompt(
          //   '"' + answer + '" Is this response in agreement or disagreement? Answer true or false:' || ''
          // );
          if (answer[0].toLowerCase() === 't') {
            score[targetFolder] = score[targetFolder] ? score[targetFolder] + value : value;
          }
          // if (answer[0].toLowerCase() === 'f') {
          //   score[targetFolder] = score[targetFolder] ? score[targetFolder] - 1 : -1;
          // }
          console.log(
            Object.keys(score).length ? getKeyWithHighestValue(score) : '_',
            question,
            // answerTwo,
            answer
          );

        }
        // let folder =
        //   await llmController.prompt(
        //     emailContent + '\n\n Write a list of 10 tags you would use to describe this email:' || ''
        //     // questions[question] || ''
        //   );
        // console.log('folder', folder)
        console.log('final folder:' + getKeyWithHighestValue(score));
        emails[email].score = score;
        emails[email].folder = getKeyWithHighestValue(score);
        console.log('------------------------------------------------')
        console.log('end email')
        console.log('------------------------------------------------')
      } else {
        console.log("no email content");
      }
    }

    console.log("Finished fetching first email.");
    await moveEmailsToFolder(client, emails);
    console.log("Finished moving first email.");
  } catch (error) {
    console.error("Error in main function:", error);
  } finally {
    await main();
  }
}


await client.connect();
let lock = await client.getMailboxLock("INBOX");
await main();
lock.release();
await client.logout();