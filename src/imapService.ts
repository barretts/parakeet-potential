import dotenv from "dotenv";
dotenv.config();

import { ImapFlow } from "imapflow";
import { Email } from "./types";

export const client = new ImapFlow({
  host: process.env.IMAP_HOST || "",
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER || "",
    pass: process.env.IMAP_PASSWORD || "",
  },
});

export async function getLatestEmails(client: ImapFlow): Promise<Email[]> {
  try {
    let mailbox = await client.mailboxOpen("INBOX");
    try {
      let totalMessages = mailbox.exists || 0;

      let messages: Email[] = [];

      const fetchedMessages = client.fetch(
        { seq: `${Math.max(1, totalMessages - 9)}:*` },
        { envelope: true, source: true }
      );

      // the examples for this all use `for await...of` which felt like
      // I wasn't understanding what was happening under the hood.
      // the other example used Promise.all() which made more sense but
      // this is the raw version for the joy of learning
      const messageArray = [];
      let result = await fetchedMessages.next();
      while (!result.done) {
        messageArray.push(result.value);
        result = await fetchedMessages.next();
      }

      for (const message of messageArray) {
        messages.push({
          uid: message.uid,
          subject: message.envelope.subject,
          from:
            message.envelope.from?.map((addr) => addr.address).join(", ") ||
            "Unknown",
          date: message.envelope.date,
          text: message.source.toString(),
        });
      }
      return messages;
    } finally {
      await client.mailboxClose();
    }
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  }
}

export async function moveEmailsToFolder(
  client: ImapFlow,
  messages: Email[]
): Promise<void> {
  await client.mailboxOpen("INBOX");

  try {
    let mailboxList = await client.list();
    for (const message of messages) {
      if (message.folder) {
        let folderExists = mailboxList.some(
          (mailbox) => mailbox.path.toLowerCase() === message.folder?.toLowerCase()
        );

        if (!folderExists && message.folder) {
          await client.mailboxCreate(message.folder);
        }

        await client.messageMove(`${message.uid}`, message.folder, { uid: true });
      }
    }
  } catch (error) {
    console.error("Error moving emails to folder:", error);
  } finally {
    await client.mailboxClose();
  }
}