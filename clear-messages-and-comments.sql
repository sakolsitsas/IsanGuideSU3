-- WARNING: This permanently deletes all messages, their comments, and their likes.
-- Review the target Supabase project before running this in the SQL Editor.
begin;

delete from public.messages;

-- message_comments and message_likes are removed by their
-- ON DELETE CASCADE foreign keys when their parent messages are deleted.

commit;
