using Microsoft.AspNetCore.Http.Features;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using TodoApi;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi;
using Microsoft.OpenApi.Models;
using BCrypt.Net;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;


var builder = WebApplication.CreateBuilder(args);
//swagger
builder.Services.AddEndpointsApiExplorer(); // מאפשר ל-Swagger לחקור את ה-Routes
builder.Services.AddSwaggerGen(
    options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Name = "Authorization",
        Description = "Bearer Authentication with JWT Token",
        Type = SecuritySchemeType.Http
    });
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
        Reference = new OpenApiReference
                {
                    Id = "Bearer",
                    Type = ReferenceType.SecurityScheme
                }
            },
            new List<string>()
        }
    });
}
);           // מייצר את מסמכי ה-Swagger

// הוספת שירות ה-CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()   // מאפשר מכל כתובת (למשל localhost:3000)
              .AllowAnyMethod()   // מאפשר את כל הפעולות (GET, POST, PUT, DELETE)
              .AllowAnyHeader();  // מאפשר את כל סוגי הכותרות
    });
});

var connectionString = builder.Configuration.GetConnectionString("ToDoDB");
// builder.Services.AddDbContext<ToDoDbContext>(options =>
//     options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 36))));;
builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// הגדרת השירות של ה-JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });
builder.Services.AddAuthorization();
var app = builder.Build();



// if (app.Environment.IsDevelopment())
// {
    app.UseSwagger();   // מייצר את קובץ ה-JSON של התיעוד
    app.UseSwaggerUI(); // מייצר את הממשק הגרפי (האתר)
// }

app.UseCors("AllowAll");
app.UseAuthentication(); // חייב לבוא לפני Authorization
app.UseAuthorization();

//-------routes--------
//קבלת כל המשימות
app.MapGet("/", () => "ToDo API is Running!");
// items!=?tasks==משימות
app.MapGet("/items",async(ToDoDbContext db)=>
     await db.Items.ToListAsync())
     .RequireAuthorization();;


//הוספת פריט
app.MapPost("/items", async (ToDoDbContext db, Item item) =>
{
    if (string.IsNullOrWhiteSpace(item.Name)) 
        return Results.BadRequest("Task name cannot be empty");

    db.Items.Add(item);
    await db.SaveChangesAsync();
    
    return Results.Created($"/items/{item.Id}", item);
}).RequireAuthorization();


//מחיקת פריט
app.MapDelete("/items/{id}",async(ToDoDbContext db, int id)=>
{
     if (await db.Items.FindAsync(id) is Item item)
    {
        db.Items.Remove(item);
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
     return Results.NotFound(); // מחוץ לבלוק ה-if
}).RequireAuthorization();

//עדכון משימה
app.MapPut("/items/{id}",async(ToDoDbContext db, int id, Item newItem)=>
{
     if (await db.Items.FindAsync(id) is Item item)
    {
          item.Name=newItem.Name;
          item.IsComplete=newItem.IsComplete;
          await db.SaveChangesAsync();
          return Results.NoContent();
    }
     return Results.NotFound(); // מחוץ לבלוק ה-if
}).RequireAuthorization();


app.MapPost("/register", async (ToDoDbContext db, User user) =>
{
    if (await db.Users.AnyAsync(u => u.Email == user.Email))
        return Results.BadRequest("User already exists");

    // הצפנה מקצועית
    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
    
    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Registered successfully" });
});

// התחברות
app.MapPost("/login", async (ToDoDbContext db, IConfiguration config, LoginModel login) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => u.Email == login.Email);
    if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.Password))
        return Results.Unauthorized();

    var token = CreateToken(user, config);
    return Results.Ok(new { token, username = user.Username });
});


app.Run();

// --- פונקציית עזר ליצירת טוקן  ---
string CreateToken(User user, IConfiguration config)
{
    var claims = new List<Claim>
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Email, user.Email)
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddDays(1),
        signingCredentials: creds
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}



// המודל של הלוגין

public record LoginModel(string Email, string Password);