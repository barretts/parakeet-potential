import dotenv from "dotenv";
dotenv.config();
import { ImapFlow } from "imapflow";

type Email = {
  uid: number;
  subject: string;
  from: string;
  date: Date;
  text?: string;
};

const client = new ImapFlow({
  host: process.env.IMAP_HOST || "",
  port: 993,
  secure: true,
  auth: {
    user: process.env.IMAP_USER || "",
    pass: process.env.IMAP_PASSWORD || "",
  },
});

export async function getLatestEmails(): Promise<Email[]> {
  // await client.connect();

  // let lock = await client.getMailboxLock('INBOX');
  try {
    try {
      let mailbox = await client.mailboxOpen("INBOX");
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
  messages: Email[],
  folderName: string
): Promise<void> {
  try {
    let mailboxList = await client.list();
    let folderExists = mailboxList.some(
      (mailbox) => mailbox.path.toLowerCase() === folderName.toLowerCase()
    );
    if (!folderExists) {
      await client.mailboxCreate(folderName);
    }
    try {
      for (const message of messages) {
        console.log("`${message.uid}`", `${message.uid}`);
        await client.messageMove(`${message.uid}`, folderName, { uid: true });
      }
    } finally {
    }
  } catch (error) {
    console.error("Error moving emails to folder:", error);
  } finally {
    // await client.logout();
  }
}

await client.connect();
const emails = await getLatestEmails();
let lock = await client.getMailboxLock("INBOX");

emails.forEach((email, index) => {
  console.log(`Email ${email.uid} ${index}:`);
  // console.log(`Subject: ${email.subject}`);
  // console.log(`Body: ${email?.text}`);
  console.log("---");
});

if (emails[0]) {
  await moveEmailsToFolder([emails[0]], "rawhide");
}

lock.release();
await client.logout();
