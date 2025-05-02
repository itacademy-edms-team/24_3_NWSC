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
            try
            {
                var count = await _context.ArticleLikes
                    .Where(al => al.ArticleId == articleId)
                    .CountAsync();
                
                Console.WriteLine($"Количество лайков для статьи {articleId}: {count}");
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при подсчете лайков статьи {articleId}: {ex.Message}");
                return 0;
            }
        }

        public async Task<bool> UserHasLikedArticleAsync(string userId, int articleId)
        {
            // Если userId содержит @ - это может быть email
            if (userId.Contains("@"))
            {
                // Ищем пользователя по email и проверяем, лайкнул ли он статью
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userId);
                if (user != null)
                {
                    Console.WriteLine($"Найден пользователь по email: {userId}, его ID: {user.Id}");
                    // Проверяем лайк по ID пользователя
                    return await _context.ArticleLikes
                        .AnyAsync(al => al.UserId == user.Id && al.ArticleId == articleId);
                }
            }

            // Стандартная проверка по UserId
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
            
            Console.WriteLine($"Добавлен новый лайк: UserId={like.UserId}, ArticleId={like.ArticleId}");
            return like;
        }

        public async Task UnlikeArticleAsync(string userId, int articleId)
        {
            var like = await _context.ArticleLikes
                .FirstOrDefaultAsync(al => al.UserId == userId && al.ArticleId == articleId);

            // Если не нашли лайк напрямую и userId содержит @ - возможно это email
            if (like == null && userId.Contains("@"))
            {
                // Ищем пользователя по email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userId);
                if (user != null)
                {
                    Console.WriteLine($"Найден пользователь по email: {userId}, его ID: {user.Id}");
                    // Проверяем лайк по ID пользователя
                    like = await _context.ArticleLikes
                        .FirstOrDefaultAsync(al => al.UserId == user.Id && al.ArticleId == articleId);
                }
            }

            if (like != null)
            {
                _context.ArticleLikes.Remove(like);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Удален лайк: UserId={userId}, ArticleId={articleId}");
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
            try
            {
                var count = await _context.CommentLikes
                    .Where(cl => cl.CommentId == commentId)
                    .CountAsync();
                
                Console.WriteLine($"Количество лайков для комментария {commentId}: {count}");
                return count;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ошибка при подсчете лайков комментария {commentId}: {ex.Message}");
                return 0;
            }
        }

        public async Task<bool> UserHasLikedCommentAsync(string userId, int commentId)
        {
            // Если userId содержит @ - это может быть email
            if (userId.Contains("@"))
            {
                // Ищем пользователя по email и проверяем, лайкнул ли он комментарий
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userId);
                if (user != null)
                {
                    Console.WriteLine($"Найден пользователь по email: {userId}, его ID: {user.Id}");
                    // Проверяем лайк по ID пользователя
                    return await _context.CommentLikes
                        .AnyAsync(cl => cl.UserId == user.Id && cl.CommentId == commentId);
                }
            }

            // Стандартная проверка по UserId
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
            
            Console.WriteLine($"Добавлен новый лайк: UserId={like.UserId}, CommentId={like.CommentId}");
            return like;
        }

        public async Task UnlikeCommentAsync(string userId, int commentId)
        {
            var like = await _context.CommentLikes
                .FirstOrDefaultAsync(cl => cl.UserId == userId && cl.CommentId == commentId);

            // Если не нашли лайк напрямую и userId содержит @ - возможно это email
            if (like == null && userId.Contains("@"))
            {
                // Ищем пользователя по email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == userId);
                if (user != null)
                {
                    Console.WriteLine($"Найден пользователь по email: {userId}, его ID: {user.Id}");
                    // Проверяем лайк по ID пользователя
                    like = await _context.CommentLikes
                        .FirstOrDefaultAsync(cl => cl.UserId == user.Id && cl.CommentId == commentId);
                }
            }

            if (like != null)
            {
                _context.CommentLikes.Remove(like);
                await _context.SaveChangesAsync();
                Console.WriteLine($"Удален лайк: UserId={userId}, CommentId={commentId}");
            }
        }
    }
} 