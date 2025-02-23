export interface Question {
  value: number;
  targetFolder: string;
  question: string;
};

export const questions: Question[] = [
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
];