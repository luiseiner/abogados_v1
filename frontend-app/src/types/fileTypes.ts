export interface File {
  id: string;
  name: string;
  minio_path: string;
  is_directory: boolean;
  created_at: string;
  file_size: string;
  parent_id: string | null;
  mime_type: string;
  deleted_at: string | null;
  is_deleted: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  minio_path: string;
}

export interface FileItem {
  id: string;
  name: string;
  created_at: string;
  file_size: string;
}