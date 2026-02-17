export type RubricParam = "VIDEOS" | "TEXTS" | "BASICS" | "TRICKS";

export type PostSortOption =
  | "newest"
  | "oldest"
  | "shareCount"
  | "likeCount"
  | "commentCount";

export type PostPreference = {
  postsPerPage: number;
  sortBy: PostSortOption;
};

export type PaginatedPostsResult = {
  posts: PostDTO[];
  hasMore: boolean;
};

export type MediaDTO = {
  id: string;
  url: string;
  type: string;
  createdAt?: Date;
};

export type PostCountsDTO = {
  likes: number;
  comments: number;
};

export type AuthorDTO = {
  name: string | null;
  image: string | null;
  username: string | null;
};

export type PostDTO = {
  id: string;
  title: string;
  content: string | null;
  rubric: RubricParam;
  published: boolean;
  shareCount: number;
  media: MediaDTO[];
  author?: AuthorDTO;
  likes?: Array<{ id: string; userId: string; postId: string }>; // minimal for liked flag
  _count: PostCountsDTO;
};

export type CommentDTO = {
  id: string;
  content: string;
  postId: string;
  userId: string | null;
  nickname: string | null;
  createdAt: Date;
  user?: AuthorDTO;
  likes?: Array<{ id: string; userId: string; commentId: string }>;
  _count: { likes: number };
};
