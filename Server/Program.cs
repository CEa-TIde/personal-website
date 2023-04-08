using Server.Entities;
using Server.Handlers;
using Server.Services;

var contentRoot = "../Client";

var builder = WebApplication.CreateBuilder(new WebApplicationOptions {
    Args = args,
    // Look for static files at this path
    WebRootPath = contentRoot
});

var replacementDictionary = new Dictionary<string, ReplacePattern[]> {
    { "default", new ReplacePattern[] {
        new(new("\\[content\\]"), new("[File]")),
        new(new("\\[title\\]"), new("[FileNameNoExt]")),
        new(new("\\[contentTitle\\]"), new("[FileNameSpaced]"))
    } },
    { "buildadvice", new ReplacePattern[] {
        new(new("\\[content\\]"), new("[File]")),
        new(new("\\[title\\]"), new("Build Advice")),
        new(new("\\[contentTitle\\]"), new("A slice of advice on building"))
    } },
    { "worldedit", new ReplacePattern[] {
        new(new("\\[content\\]"), new("[File]")),
        new(new("\\[title\\]"), new("World Edit")),
        new(new("\\[contentTitle\\]"), new("World Edit tutorial"))
    } }
};

builder.Services.AddSingleton(replacementDictionary);
builder.Services.AddSingleton<FileProcessService>();
builder.Services.AddSingleton(x => contentRoot);
builder.Services.AddControllers();

var app = builder.Build();

//var handler = new RequestHandler(app);
//handler.HandleRequest();
app.MapControllers();

app.Run();
