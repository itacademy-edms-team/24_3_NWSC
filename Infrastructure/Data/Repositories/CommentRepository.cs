using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NewsPortal.Domain.Entities;

namespace NewsPortal.Infrastructure.Data.Repositories
{
    public class CommentRepository
    {
        private readonly ApplicationDbContext _context;

        public CommentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Comment>> GetArticleCommentsAsync(int articleId, int page = 1, int pageSize = 10)
        {
            // Получаем только комментарии верхнего уровня (без родителя)
            var rootComments = await _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Likes)
                .Where(c => c.ArticleId == articleId && c.ParentCommentId == null)
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            // Для каждого корневого комментария загружаем его ответы
            foreach (var comment in rootComments)
            {
                await LoadCommentRepliesAsync(comment);
            }

            return rootComments;
        }

        private async Task LoadCommentRepliesAsync(Comment comment)
        {
            var replies = await _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Likes)
                .Where(c => c.ParentCommentId == comment.Id)
                .OrderBy(c => c.CreatedAt)
                .ToListAsync();

            comment.Replies = replies;

            // Рекурсивно загружаем ответы на ответы
            foreach (var reply in replies)
            {
                await LoadCommentRepliesAsync(reply);
            }
        }

        public async Task<int> GetArticleCommentsCountAsync(int articleId)
        {
            return await _context.Comments
                .Where(c => c.ArticleId == articleId && c.ParentCommentId == null)
                .CountAsync();
        }

        public async Task<Comment> GetCommentByIdAsync(int id)
        {
            var comment = await _context.Comments
                .Include(c => c.Author)
                .Include(c => c.Likes)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (comment != null)
            {
                await LoadCommentRepliesAsync(comment);
            }

            return comment;
        }

        public async Task<Comment> CreateCommentAsync(Comment comment)
        {
            comment.CreatedAt = DateTime.UtcNow;
            
            await _context.Comments.AddAsync(comment);
            await _context.SaveChangesAsync();
            
            // Загружаем автора после создания
            await _context.Entry(comment)
                .Reference(c => c.Author)
                .LoadAsync();
                
            return comment;
        }

        public async Task<Comment> UpdateCommentAsync(Comment comment)
        {
            comment.UpdatedAt = DateTime.UtcNow;
            
            _context.Comments.Update(comment);
            await _context.SaveChangesAsync();
            
            return comment;
        }

        public async Task DeleteCommentAsync(int id)
        {
            var comment = await _context.Comments.FindAsync(id);
            if (comment != null)
            {
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();
            }
        }
    }
} 