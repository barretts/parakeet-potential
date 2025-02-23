import dotenv from "dotenv";
dotenv.config();
import { ImapFlow } from "imapflow";
import { saveObjectToFileAsync } from "./exportImportEmailObject";

type Email = {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  text?: string;
};

// const client = new ImapFlow({
//   host: process.env.IMAP_HOST || "",
//   port: 993,
//   secure: true,
//   auth: {
//     user: process.env.IMAP_USER || "",
//     pass: process.env.IMAP_PASSWORD || "",
//   },
// });

export async function getLatestEmails(client): Promise<Email[]> {
  // await client.connect();

  // await client.mailboxClose();
  // let mailbox = await client.mailboxOpen("INBOX");
  try {
    // let lock = await client.getMailboxLock('INBOX');
    let mailbox = await client.mailboxOpen("INBOX");
    try {
      let totalMessages = mailbox.exists || 0;

      let messages: Email[] = [];
      for await (let message of client.fetch(
        { seq: `${Math.max(1, totalMessages - 9)}:*` },
        { envelope: true, source: true }
      )) {
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
      // lock.release();
      await client.mailboxClose();
    }
  } catch (error) {
    console.error("Error fetching emails:", error);
    return [];
  } finally {
    // await client.logout();
  }
}

export async function addLabelToEmails(
  messages: Email[],
  label: string
): Promise<void> {
  try {
    // await client.connect();
    // let lock = await client.getMailboxLock('INBOX');
    try {
      for (const message of messages) {
        if (message.uid) {
          console.log("await client.messageFlagsAdd(seq, [`$${label}`])");
          const b = await client.messageFlagsAdd(`${message.uid}`, [
            `$${label}`,
          ]);
          console.log(b);
        }
        // let seq = await client.search({ subject: message.subject, from: message.from, since: message.date });
        // if (seq.length > 0) {
        //     // await client.messageFlagsAdd(seq, []);
        // }
      }
    } finally {
      // lock.release();
    }
  } catch (error) {
    console.error("Error adding label to emails:", error);
  } finally {
    // await client.logout();
  }
}

export async function moveEmailsToFolder(
  client,
  messages: Email[]
): Promise<void> {
  // let lock = await client.getMailboxLock('INBOX');
  await client.mailboxOpen("INBOX");
  try {
    let mailboxList = await client.list();
    try {
      for (const message of messages) {
        let folderExists = mailboxList.some(
          (mailbox) => mailbox.path.toLowerCase() === message.folder.toLowerCase()
        );
        if (!folderExists) {
          await client.mailboxCreate(message.folder);
        }
        console.log("`${message.uid}`", `${message.uid}`);
        await client.messageMove(`${message.uid}`, message.folder, { uid: true });
      }
    } finally {
    }
  } catch (error) {
    console.error("Error moving emails to folder:", error);
  } finally {
    // lock.release();
    await client.mailboxClose();
  }
}

// await client.connect();
// const emails = await getLatestEmails();
// let lock = await client.getMailboxLock("INBOX");

// await saveObjectToFileAsync(emails, 'emails.json');

// // emails.forEach((email, index) => {
// //   console.log(`Email ${email.uid} ${index}:`);
// //   // console.log(`Subject: ${email.subject}`);
// //   // console.log(`Body: ${email?.text}`);
// //   console.log("---");
// // });

// // if (emails[0]) {
// //   await moveEmailsToFolder([emails[0]], "rawhide");
// // }

// lock.release();
// await client.logout();
