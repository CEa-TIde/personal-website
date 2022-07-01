using Server.Entities;
using Server.Handlers;
using Server.Services;

var contentRoot = "../Client";

var builder = WebApplication.CreateBuilder(new WebApplicationOptions {
    Args = args,
    // Look for static files at this path
    WebRootPath = contentRoot
});

var replacePatterns = new ReplacePattern[] {
    new(new("\\[test\\]"), new FileInfo($"{contentRoot}/template.html"))
};

builder.Services.AddSingleton(replacePatterns);
builder.Services.AddSingleton<FileProcessService>();
builder.Services.AddSingleton(x => contentRoot);
builder.Services.AddControllers();

var app = builder.Build();

var handler = new RequestHandler(app);
handler.HandleRequest();
app.MapControllers();

app.Run();
