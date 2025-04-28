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
            var article = await _articleService.GetArticleByIdAsync(id);

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
            var article = await _articleService.CreateArticleAsync(createArticleDto);
            return CreatedAtAction(nameof(GetArticle), new { id = article.Id }, article);
        }

        // PUT: api/Articles/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateArticle(int id, UpdateArticleDto updateArticleDto)
        {
            var article = await _articleService.UpdateArticleAsync(id, updateArticleDto);

            if (article == null)
            {
                return NotFound();
            }

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
    }
} 