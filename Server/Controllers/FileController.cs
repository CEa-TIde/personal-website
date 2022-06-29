using Microsoft.AspNetCore.Mvc;
using Server.Services;

namespace Server.Controllers;

[Route("/")]
[Controller]
public class FileController : Controller {

    private readonly FileProcessService _pageProcessService;
    private readonly string _rootDir;

    public FileController(FileProcessService pageProcessService, string rootDir) {
        _pageProcessService = pageProcessService;
        _rootDir = rootDir;
    }

    [HttpGet("/{htmlFileName}/")]
    public IActionResult GetHtmlFile([FromRoute(Name = "htmlFileName")] string htmlFileName, [FromQuery(Name = "nolink")] bool? noLink) {
        Console.WriteLine(htmlFileName);
        if (htmlFileName.Contains('.'))
            return NotFound();
        return GetFile($"{htmlFileName}.html", "text/html");
    }

    [HttpGet("css/{cssFileName}.css")]
    public IActionResult GetCssFile([FromRoute(Name = "cssFileName")] string cssFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFile($"css/{cssFileName}.css", "text/css");
    }

    [HttpGet("js/{jsFileName}.js")]
    public IActionResult GetJsFile([FromRoute(Name = "jsFileName")] string jsFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFile($"js/{jsFileName}.js", "text/javascript");
    }

    internal IActionResult GetFile(string relFilePath, string mimeType) {
        Console.WriteLine(relFilePath);
        var filePath = new FileInfo(Path.Combine(_rootDir, relFilePath));
        return File(_pageProcessService.ReadBytesFromFile(filePath), mimeType);
    }
}
