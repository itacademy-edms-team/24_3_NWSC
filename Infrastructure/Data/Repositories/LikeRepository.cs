using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NewsPortal.Domain.Entities;

namespace NewsPortal.Infrastructure.Data.Repositories
{
    public class LikeRepository
    {
        private readonly ApplicationDbContext _context;

        public LikeRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        // Методы для работы с лайками статей
        public async Task<List<ArticleLike>> GetArticleLikesAsync(int articleId, int page = 1, int pageSize = 10)
        {
            return await _context.ArticleLikes
                .Include(al => al.User)
                .Where(al => al.ArticleId == articleId)
                .OrderByDescending(al => al.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetArticleLikesCountAsync(int articleId)
        {
            return await _context.ArticleLikes
                .Where(al => al.ArticleId == articleId)
                .CountAsync();
        }

        public async Task<bool> UserHasLikedArticleAsync(string userId, int articleId)
        {
            return await _context.ArticleLikes
                .AnyAsync(al => al.UserId == userId && al.ArticleId == articleId);
        }

        public async Task<ArticleLike> LikeArticleAsync(ArticleLike like)
        {
            // Проверяем, что пользователь еще не лайкал эту статью
            var existingLike = await _context.ArticleLikes
                .FirstOrDefaultAsync(al => al.UserId == like.UserId && al.ArticleId == like.ArticleId);

            if (existingLike != null)
            {
                return existingLike; // Пользователь уже лайкнул статью
            }

            like.CreatedAt = DateTime.UtcNow;
            await _context.ArticleLikes.AddAsync(like);
            await _context.SaveChangesAsync();
            return like;
        }

        public async Task UnlikeArticleAsync(string userId, int articleId)
        {
            var like = await _context.ArticleLikes
                .FirstOrDefaultAsync(al => al.UserId == userId && al.ArticleId == articleId);

            if (like != null)
            {
                _context.ArticleLikes.Remove(like);
                await _context.SaveChangesAsync();
            }
        }

        // Методы для работы с лайками комментариев
        public async Task<List<CommentLike>> GetCommentLikesAsync(int commentId, int page = 1, int pageSize = 10)
        {
            return await _context.CommentLikes
                .Include(cl => cl.User)
                .Where(cl => cl.CommentId == commentId)
                .OrderByDescending(cl => cl.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetCommentLikesCountAsync(int commentId)
        {
            return await _context.CommentLikes
                .Where(cl => cl.CommentId == commentId)
                .CountAsync();
        }

        public async Task<bool> UserHasLikedCommentAsync(string userId, int commentId)
        {
            return await _context.CommentLikes
                .AnyAsync(cl => cl.UserId == userId && cl.CommentId == commentId);
        }

        public async Task<CommentLike> LikeCommentAsync(CommentLike like)
        {
            // Проверяем, что пользователь еще не лайкал этот комментарий
            var existingLike = await _context.CommentLikes
                .FirstOrDefaultAsync(cl => cl.UserId == like.UserId && cl.CommentId == like.CommentId);

            if (existingLike != null)
            {
                return existingLike; // Пользователь уже лайкнул комментарий
            }

            like.CreatedAt = DateTime.UtcNow;
            await _context.CommentLikes.AddAsync(like);
            await _context.SaveChangesAsync();
            return like;
        }

        public async Task UnlikeCommentAsync(string userId, int commentId)
        {
            var like = await _context.CommentLikes
                .FirstOrDefaultAsync(cl => cl.UserId == userId && cl.CommentId == commentId);

            if (like != null)
            {
                _context.CommentLikes.Remove(like);
                await _context.SaveChangesAsync();
            }
        }
    }
} 