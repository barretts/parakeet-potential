import dotenv from "dotenv";
dotenv.config();

import { client, getLatestEmails, moveEmailsToFolder } from "./imapService";
// import { loadObjectFromFileAsync, saveObjectToFileAsync } from "./exportImportEmailObject";
import { simpleParser } from "mailparser";
import { extractEnglishTextAndPunctuation, removeUrls, getKeyWithHighestValue } from "./util";
import LLMController from "./controllers/LlmController";
import { Question, questions } from "./questions";
import { Email } from "./types";

const llmController = new LLMController();

async function main() {
  await llmController.initialize();

  try {
    const emails = await getLatestEmails(client);

    for (let email in emails) {
      const eml = emails[email] as Email;
      const rawText = eml?.text;
      if (rawText) {
        const parsedEmail = await simpleParser(rawText) || '';
        const emailContent = extractEnglishTextAndPunctuation(removeUrls(parsedEmail.text || ''));

        if (emailContent) {
          await llmController.preloadPrompt(
            "we're going to discuss this email: " + emailContent
          );
          const score: any = {};
          for (let q in questions) {
            const { targetFolder, question, value } = questions[q] as Question;
            await llmController.resetContext();
            let answer =
              await llmController.prompt(
                emailContent + '\n\n"' + question + '" Do you agree? Answer with true or false:' || ''
              );

            if (answer?.length && answer[0]?.toLowerCase() === 't') {
              score[targetFolder] = score[targetFolder] ? score[targetFolder] + value : value;
            }
          }

          eml.score = score;
          eml.folder = getKeyWithHighestValue(score);
        }
      } else {
        console.log("no email content");
      }
    }

    await moveEmailsToFolder(client, emails);
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