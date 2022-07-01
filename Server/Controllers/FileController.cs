using Microsoft.AspNetCore.Mvc;
using Server.Services;

namespace Server.Controllers;

[Route("/")]
[Controller]
public class FileController : Controller {

    private readonly FileProcessService _fileProcessService;
    private readonly string _rootDir;

    public FileController(FileProcessService pageProcessService, string rootDir) {
        _fileProcessService = pageProcessService;
        _rootDir = rootDir;
    }

    [HttpGet("/{htmlFileName}/")]
    public IActionResult GetHtmlFile([FromRoute(Name = "htmlFileName")] string htmlFileName, [FromQuery(Name = "nolink")] bool? noLink) {
        if (htmlFileName.Contains('.'))
            return NotFound();
        return GetFileResponseFromTemplate($"{htmlFileName}.html", "text/html");
    }

    [HttpGet("css/{cssFileName}.css")]
    public IActionResult GetCssFile([FromRoute(Name = "cssFileName")] string cssFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFileResponse($"css/{cssFileName}.css", "text/css");
    }

    [HttpGet("js/{jsFileName}.js")]
    public IActionResult GetJsFile([FromRoute(Name = "jsFileName")] string jsFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFileResponse($"js/{jsFileName}.js", "text/javascript");
    }

    [HttpGet("media/{mediaFileName}")]
    public IActionResult GetMediaFile([FromRoute(Name = "mediaFileName")] string mediaFileName, [FromQuery(Name = "v")] bool? version) {
        var fileExtension = _fileProcessService.ExtractFileExtension(mediaFileName);
        return GetFileResponse($"media/{mediaFileName}", $"image/{fileExtension}");
    }

    internal FileInfo GetFileFromPath(string relFilePath) {
        return new FileInfo(Path.Combine(_rootDir, relFilePath));
    }

    internal IActionResult GetFileResponseFromTemplate(string relFilePath, string mimeType) {
        Console.WriteLine($"Fetching '{relFilePath}' of type {mimeType}...");
        var fileInfo = GetFileFromPath(relFilePath);
        var fileContents = _fileProcessService.ReadStringFromFile(fileInfo);
        var inserted = _fileProcessService.InsertFileContents(fileContents);
        return File(_fileProcessService.ConvertToByteArray(inserted), mimeType);
    }

    internal IActionResult GetFileResponse(string relFilePath, string mimeType) {
        Console.WriteLine($"Fetching '{relFilePath}' of type {mimeType}...");
        var filePath = GetFileFromPath(relFilePath);
        return File(_fileProcessService.ReadBytesFromFile(filePath), mimeType);
    }
}
