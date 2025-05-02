using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NewsPortal.Application.DTOs;
using NewsPortal.Application.Services;

namespace NewsPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticlesController : ControllerBase
    {
        private readonly ArticleService _articleService;

        public ArticlesController(ArticleService articleService)
        {
            _articleService = articleService;
        }

        // GET: api/Articles
        [HttpGet]
        public async Task<ActionResult<ArticleListDto>> GetArticles(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string search = null)
        {
            var articles = await _articleService.GetAllArticlesAsync(page, pageSize, search);
            return Ok(articles);
        }

        // GET: api/Articles/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ArticleDto>> GetArticle(int id)
        {
            var article = await _articleService.GetArticleByIdWithViewAsync(id);

            if (article == null)
            {
                return NotFound();
            }

            return Ok(article);
        }

        // POST: api/Articles
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<ArticleDto>> CreateArticle(CreateArticleDto createArticleDto)
        {
            try
            {
                // Получаем ID пользователя из Claims
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                var userEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
                
                // Предпочитаем использовать ID пользователя, если доступен, иначе email
                createArticleDto.AuthorId = userId ?? userEmail;
                
                if (string.IsNullOrEmpty(createArticleDto.AuthorId))
                {
                    return BadRequest("User identifier not found in token claims");
                }
                
                // Добавим логирование для отладки
                Console.WriteLine($"Creating article with AuthorId: {createArticleDto.AuthorId}");
                Console.WriteLine($"Categories: {string.Join(", ", createArticleDto.CategoryIds)}");
                Console.WriteLine($"Tags: {string.Join(", ", createArticleDto.TagIds)}");
                
                var article = await _articleService.CreateArticleAsync(createArticleDto);
                return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
            }
            catch (Exception ex)
            {
                // Получаем все вложенные исключения для более подробной информации
                string errorDetails = GetFullExceptionMessage(ex);
                
                // Добавляем полный стек вызовов для отладки
                errorDetails += "\n\nStack Trace:\n" + ex.StackTrace;
                
                return StatusCode(500, errorDetails);
            }
        }

        // Вспомогательный метод для получения полной информации о вложенных исключениях
        private string GetFullExceptionMessage(Exception ex)
        {
            var message = ex.Message;
            if (ex.InnerException != null)
            {
                message += " -> " + GetFullExceptionMessage(ex.InnerException);
            }
            return message;
        }

        // PUT: api/Articles/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateArticle(int id, UpdateArticleDto updateArticleDto)
        {
            // Получаем статью для проверки прав
            var existingArticle = await _articleService.GetArticleByIdAsync(id);
            if (existingArticle == null)
            {
                return NotFound();
            }
            
            // Получаем ID пользователя из Claims
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            // Проверяем, что пользователь является автором статьи или администратором
            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin && existingArticle.AuthorId != userId)
            {
                return Forbid();
            }
            
            var article = await _articleService.UpdateArticleAsync(id, updateArticleDto);
            return Ok(article);
        }

        // DELETE: api/Articles/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteArticle(int id)
        {
            var article = await _articleService.GetArticleByIdAsync(id);
            if (article == null)
            {
                return NotFound();
            }

            // Получаем ID пользователя из Claims
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            
            // Проверяем, что пользователь является автором статьи или администратором
            bool isAdmin = User.IsInRole("Admin");
            if (!isAdmin && article.AuthorId != userId)
            {
                return Forbid();
            }

            await _articleService.DeleteArticleAsync(id);
            return NoContent();
        }

        // GET: api/Articles/Categories/5
        [HttpGet("Categories/{categoryId}")]
        public async Task<ActionResult<ArticleListDto>> GetArticlesByCategory(
            int categoryId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var articles = await _articleService.GetArticlesByCategoryAsync(categoryId, page, pageSize);
            return Ok(articles);
        }

        // GET: api/Articles/Tags/5
        [HttpGet("Tags/{tagId}")]
        public async Task<ActionResult<ArticleListDto>> GetArticlesByTag(
            int tagId, 
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var articles = await _articleService.GetArticlesByTagAsync(tagId, page, pageSize);
            return Ok(articles);
        }

        // GET: api/Articles/Popular
        [HttpGet("Popular")]
        public async Task<ActionResult<ArticleListDto>> GetPopularArticles(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10)
        {
            var articles = await _articleService.GetPopularArticlesAsync(page, pageSize);
            return Ok(articles);
        }

        // GET: api/Articles/Stats
        [HttpGet("Stats")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetArticlesStats()
        {
            var totalArticles = await _articleService.GetArticlesCountAsync();
            var topArticles = await _articleService.GetPopularArticlesAsync(1, 5);
            
            return Ok(new { 
                TotalArticles = totalArticles,
                TopArticles = topArticles.Articles.Select(a => new { 
                    a.Id,
                    a.Title,
                    a.ViewCount,
                    a.AuthorName
                }).ToList()
            });
        }
    }
} 