import * as Imap from "imap-simple";
import { simpleParser } from "mailparser";
import { htmlToText } from "html-to-text";

interface EmailPart {
  which: string;
  body?: any;
}

interface FirstEmail {
  parts: EmailPart[];
}

function extractEnglishTextAndPunctuation(input: string): string {
  const regex = /[a-zA-Z.,!? ]+/g;

  const matches = input.match(regex);

  return matches ? matches.join(" ") : " ";
}

const inputString = "Hello, 世界! How's it going? こんにちは! This is a test.";
const result = extractEnglishTextAndPunctuation(inputString);
console.log(result);

function removeVowels(str) {
  const vowels = "aeiouAEIOU";
  let result = "";

  for (let char of str) {
    if (!vowels.includes(char)) {
      result += char;
    }
  }

  return result;
}

function removeUrls(str) {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return str.replace(urlPattern, "");
}

export class ImapHandler {
  private imapConfig: Imap.ImapSimpleOptions;

  constructor(imapConfig: Imap.ImapSimpleOptions) {
    this.imapConfig = imapConfig;
  }

  async connectAndFetchEmail(): Promise<string | undefined> {
    try {
      const connection = await Imap.connect(this.imapConfig);
      await connection.openBox("INBOX");

      const searchCriteria = ["ALL"];
      const fetchOptions = {
        bodies: ["HEADER.FIELDS (FROM TO SUBJECT DATE)", "TEXT"],
        struct: true,
      };

      const results = (await connection.search(
        searchCriteria,
        fetchOptions
      )) as FirstEmail[];
      `0`;
      const firstEmail = results[1];
      if (firstEmail) {
        const emailHeader = firstEmail.parts.find(
          (part: EmailPart) =>
            part.which === "HEADER.FIELDS (FROM TO SUBJECT DATE)"
        )?.subject;
        console.log(emailHeader);
        const emailBody = firstEmail.parts.find(
          (part: EmailPart) => part.which === "TEXT"
        )?.body;

        if (emailBody) {
          const parsedEmail = await simpleParser(emailBody);
          return extractEnglishTextAndPunctuation(
            removeUrls(htmlToText(parsedEmail.text as string))
          );
        } else {
          console.log("Could not parse the email body.");
        }
      } else {
        console.log("No messages found.");
      }

      connection.end();
    } catch (err) {
      console.error(err);
    }

    return undefined;
  }
}
