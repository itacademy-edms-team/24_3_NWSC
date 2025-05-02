using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NewsPortal.Domain.Entities;

namespace NewsPortal.Infrastructure.Data.Repositories
{
    public class ArticleRepository
    {
        private readonly ApplicationDbContext _context;

        public ArticleRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Article>> GetAllArticlesAsync(int page = 1, int pageSize = 10, string searchTerm = null)
        {
            var query = _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ArticleCategories)
                    .ThenInclude(ac => ac.Category)
                .Include(a => a.ArticleTags)
                    .ThenInclude(at => at.Tag)
                .OrderByDescending(a => a.CreatedAt)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(a => a.Title.Contains(searchTerm) || a.Content.Contains(searchTerm));
            }

            return await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<int> GetArticlesCountAsync(string searchTerm = null)
        {
            var query = _context.Articles.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(a => a.Title.Contains(searchTerm) || a.Content.Contains(searchTerm));
            }

            return await query.CountAsync();
        }

        public async Task<Article> GetArticleByIdAsync(int id)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ArticleCategories)
                    .ThenInclude(ac => ac.Category)
                .Include(a => a.ArticleTags)
                    .ThenInclude(at => at.Tag)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Article> CreateArticleAsync(Article article)
        {
            article.CreatedAt = DateTime.UtcNow;
            await _context.Articles.AddAsync(article);
            await _context.SaveChangesAsync();
            
            // Возвращаем статью с загруженными связанными сущностями
            return await GetArticleByIdAsync(article.Id);
        }

        public async Task<Article> UpdateArticleAsync(Article article)
        {
            article.UpdatedAt = DateTime.UtcNow;
            _context.Articles.Update(article);
            await _context.SaveChangesAsync();
            return article;
        }

        public async Task DeleteArticleAsync(int id)
        {
            var article = await _context.Articles.FindAsync(id);
            if (article != null)
            {
                _context.Articles.Remove(article);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Article>> GetArticlesByCategoryAsync(int categoryId, int page = 1, int pageSize = 10)
        {
            return await _context.ArticleCategories
                .Where(ac => ac.CategoryId == categoryId)
                .Include(ac => ac.Article)
                    .ThenInclude(a => a.Author)
                .Include(ac => ac.Article)
                    .ThenInclude(a => a.ArticleCategories)
                        .ThenInclude(ac => ac.Category)
                .Include(ac => ac.Article)
                    .ThenInclude(a => a.ArticleTags)
                        .ThenInclude(at => at.Tag)
                .Select(ac => ac.Article)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Article>> GetArticlesByTagAsync(int tagId, int page = 1, int pageSize = 10)
        {
            return await _context.ArticleTags
                .Where(at => at.TagId == tagId)
                .Include(at => at.Article)
                    .ThenInclude(a => a.Author)
                .Include(at => at.Article)
                    .ThenInclude(a => a.ArticleCategories)
                        .ThenInclude(ac => ac.Category)
                .Include(at => at.Article)
                    .ThenInclude(a => a.ArticleTags)
                        .ThenInclude(at => at.Tag)
                .Select(at => at.Article)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<List<Article>> GetPopularArticlesAsync(int page = 1, int pageSize = 10)
        {
            return await _context.Articles
                .Include(a => a.Author)
                .Include(a => a.ArticleCategories)
                    .ThenInclude(ac => ac.Category)
                .Include(a => a.ArticleTags)
                    .ThenInclude(at => at.Tag)
                .OrderByDescending(a => a.ViewCount)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }
    }
} 