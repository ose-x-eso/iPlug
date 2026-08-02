-- Enable Row Level Security on storage.objects if it's not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow public reads for the chat_attachments bucket
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'chat_attachments' );

-- Allow authenticated users to upload files to chat_attachments bucket
CREATE POLICY "Allow authenticated inserts" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK ( bucket_id = 'chat_attachments' );
