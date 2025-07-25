using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NewsPortal.Domain.Entities;
using NewsPortal.Infrastructure.Data;
using NewsPortal.Infrastructure.Data.Repositories;
using NewsPortal.Application.Services;
using System.Text;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Logging;
using Swashbuckle.AspNetCore.SwaggerUI;

var builder = WebApplication.CreateBuilder(args);

// Добавьте CORS перед другими сервисами
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:3001", "http://localhost:5000") // URL вашего React-приложения
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials()
              .WithExposedHeaders("Content-Disposition");
    });
    
    // Дополнительная политика для отладки, которая разрешает все источники
    options.AddPolicy("Debug", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Добавляем DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Настраиваем Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireLowercase = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Настраиваем JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    var configuration = builder.Configuration;
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = configuration["Jwt:Issuer"],
        ValidAudience = configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key is not configured"))
        ),
        ClockSkew = TimeSpan.Zero
    };
    
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError("Authentication failed: {Error}", context.Exception.Message);
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Token validated successfully for user: {User}", context.Principal?.Identity?.Name);
            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogInformation("Authorization header: {Header}", context.Request.Headers["Authorization"].ToString());
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning("Authorization challenge. Reason: {Reason}", context.Error ?? "Unknown");
            return Task.CompletedTask;
        }
    };
});

// Регистрация репозиториев
builder.Services.AddScoped<ArticleRepository>();
builder.Services.AddScoped<CommentRepository>();
builder.Services.AddScoped<LikeRepository>();
builder.Services.AddScoped<CategoryRepository>();
builder.Services.AddScoped<TagRepository>();

// Регистрация сервисов
builder.Services.AddScoped<ArticleService>();
builder.Services.AddScoped<CommentService>();
builder.Services.AddScoped<LikeService>();
builder.Services.AddScoped<CategoryService>();
builder.Services.AddScoped<TagService>();
builder.Services.AddScoped<AdminService>();

// EmailSender DI
builder.Services.AddSingleton(sp => {
    var config = sp.GetRequiredService<IConfiguration>();
    return new NewsPortal.Infrastructure.EmailSender(
        config["Email:SmtpHost"],
        int.Parse(config["Email:SmtpPort"] ?? "587"),
        config["Email:SmtpUser"],
        config["Email:SmtpPass"],
        config["Email:From"]
    );
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "News Portal API", Version = "v1" });
    
    // Добавляем поддержку JWT токена в Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer eyJhbGciOiJIUzI1NiIsInR5...\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

builder.Services.AddScoped<RoleManager<IdentityRole>>();
builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Добавьте CORS middleware перед другими middleware
app.UseCors("ReactApp");

// Для отладки через API Debug Page используем более свободную политику
app.Map("/api/health", appBuilder =>
{
    appBuilder.UseCors("Debug");
});

// Добавьте этот код для инициализации ролей
using (var scope = app.Services.CreateScope())
{
    // Автоматическое применение миграций при запуске
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        await context.Database.MigrateAsync();
        Console.WriteLine("Миграции успешно применены.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Ошибка применения миграций: {ex.Message}");
    }
    
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
    var roles = new[] { "Admin", "User" };

    foreach (var role in roles)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    
    // Создаем администратора по умолчанию, если его нет
    var adminEmail = "admin@newsportal.com";
    var adminUser = await userManager.FindByEmailAsync(adminEmail);
    
    if (adminUser == null)
    {
        adminUser = new ApplicationUser
        {
            UserName = adminEmail,
            Email = adminEmail,
            FirstName = "Администратор",
            LastName = "Системы",
            EmailConfirmed = true,
            RegisterDate = DateTime.UtcNow,
            IsBlocked = false
        };
        
        var result = await userManager.CreateAsync(adminUser, "Admin123!");
        
        if (result.Succeeded)
        {
            await userManager.AddToRoleAsync(adminUser, "Admin");
            Console.WriteLine($"Создан пользователь-администратор: {adminEmail} с паролем: Admin123!");
        }
        else
        {
            Console.WriteLine("Ошибка создания администратора:");
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"- {error.Description}");
            }
        }
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "News Portal API v1");
        c.DocExpansion(DocExpansion.None);
    });
    app.UseDeveloperExceptionPage();
}

// Добавляем поддержку статических файлов для изображений
app.UseStaticFiles();

// Используем аутентификацию и авторизацию в правильном порядке
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthentication(); // Должно быть перед UseAuthorization
app.UseAuthorization();
app.MapControllers();

// Добавьте эту строку в самом конце, перед закрывающей фигурной скобкой
app.Run();
