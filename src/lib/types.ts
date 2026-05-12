export type Statement = {
  id: string;
  clerk_user_id: string;
  raw_text: string | null;
  refined_text: string;
  scenario: string;
  tone: string;
  created_at: string;
};

export type JournalEntry = {
  id: string;
  clerk_user_id: string;
  title: string | null;
  body: string;
  created_at: string;
};

export type FileRecord = {
  id: string;
  clerk_user_id: string;
  name: string;
  url: string;
  key: string;
  size: number | null;
  created_at: string;
};
