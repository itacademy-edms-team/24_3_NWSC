using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data;

namespace NewsPortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestDataController : ControllerBase
    {
        private readonly ApplicationDbContext _dbContext;

        public TestDataController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        // GET: api/TestData/Initialize
        [HttpGet("Initialize")]
        public async Task<IActionResult> InitializeTestData()
        {
            try
            {
                // Проверяем, есть ли уже категории
                if (!await _dbContext.Categories.AnyAsync())
                {
                    // Добавляем тестовые категории
                    var categories = new[]
                    {
                        new Category { Name = "Новости", Description = "Последние новости" },
                        new Category { Name = "Технологии", Description = "Новости технологий" },
                        new Category { Name = "Спорт", Description = "Спортивные события" }
                    };
                    
                    await _dbContext.Categories.AddRangeAsync(categories);
                    await _dbContext.SaveChangesAsync();
                }

                // Проверяем, есть ли уже теги
                if (!await _dbContext.Tags.AnyAsync())
                {
                    // Добавляем тестовые теги
                    var tags = new[]
                    {
                        new Tag { Name = "Важное" },
                        new Tag { Name = "Интересное" },
                        new Tag { Name = "Популярное" }
                    };
                    
                    await _dbContext.Tags.AddRangeAsync(tags);
                    await _dbContext.SaveChangesAsync();
                }

                // Получаем созданные данные для отображения в ответе
                var createdCategories = await _dbContext.Categories.ToListAsync();
                var createdTags = await _dbContext.Tags.ToListAsync();

                return Ok(new
                {
                    Message = "Тестовые данные успешно инициализированы",
                    Categories = createdCategories,
                    Tags = createdTags
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = ex.Message });
            }
        }
    }
} 