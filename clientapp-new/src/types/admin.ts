export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  registerDate: string;
  isBlocked: boolean;
  emailConfirmed: boolean;
  roles: string[];
  articlesCount: number;
  commentsCount: number;
}

export interface UserList {
  users: User[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export interface BlockUserDto {
  userId: string;
  isBlocked: boolean;
  reason: string;
}

export interface UpdateUserRolesDto {
  userId: string;
  roles: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalArticles: number;
  totalComments: number;
  blockedUsers: number;
  newUsersToday: number;
  newArticlesToday: number;
  newCommentsToday: number;
  categoryStats: CategoryStats[];
}

export interface CategoryStats {
  id: number;
  name: string;
  articlesCount: number;
}

export interface AdminArticle {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  viewCount: number;
  commentsCount: number;
  likesCount: number;
  imagePaths: string[];
  categories: any[];
  tags: any[];
}

export interface AdminComment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt?: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  articleId: number;
  articleTitle: string;
  parentCommentId?: number;
  likesCount: number;
  isReported: boolean;
  repliesCount: number;
} 