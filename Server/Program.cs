using Server.Handlers;
using Server.Services;
using Microsoft.AspNetCore;
using WebHost = Microsoft.AspNetCore.WebHost;

//var builder = WebApplication.CreateBuilder(args);
//var builder = CreateWebAppBuilder(args);
var builder = WebApplication.CreateBuilder(new WebApplicationOptions {
    Args = args,
    // Look for static files at this path
    WebRootPath = "../Client/"
});
//builder.Host.ConfigureWebHost(webHostBuilder => {
//    webHostBuilder.UseWebRoot(@"../Client/");
//});

//var bbuilder = Host.CreateDefaultBuilder(args).ConfigureWebHostDefaults(webHostBuilder => {
//            webHostBuilder.UseWebRoot(@"../Client/");
//        });

//builder.

builder.Services.AddSingleton<FileProcessService>();
builder.Services.AddSingleton(x => "../Client");
builder.Services.AddControllers();

var app = builder.Build();

var handler = new RequestHandler(app);
handler.HandleRequest();
app.MapControllers();

app.Run();
/*
static IHostBuilder CreateHostBuilder(string[] args) =>
    Host.CreateDefaultBuilder(args)
        .ConfigureWebHostDefaults(webHostBuilder => {
            webHostBuilder.UseWebRoot("../Client/");
        });

static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
    WebHost.CreateDefaultBuilder(args).Configure(appBuilder => {
        appBuilder.UsePathBase(new PathString("../Client/"));
    });

static WebApplicationBuilder CreateWebAppBuilder(string[] args) {
    var builder = WebApplication.CreateBuilder(args);
    builder.WebHost.Configure(appBuilder => {
        appBuilder.UsePathBase(new PathString("../Client/"));
    });
    return builder;
}
*/
