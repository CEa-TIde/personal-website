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

    [HttpGet("/")]
    public IActionResult Index() {
        return Ok("Index");
    }

    [HttpGet("/{htmlFileName}")]
    public IActionResult GetHtmlFile([FromRoute(Name = "htmlFileName")] string htmlFileName, [FromQuery(Name = "nolink")] bool? noLink) {
        if (htmlFileName.Contains('.') || htmlFileName.Contains("template"))
            return NotFound("Html file not found");
        var template = GetFileInfoFromPath("template.html");
        return GetFileResponseUsingTemplate($"{htmlFileName}.html", template);
    }

    [HttpGet("css/{cssFileName}.css")]
    public IActionResult GetCssFile([FromRoute(Name = "cssFileName")] string cssFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFileResponse($"css/{cssFileName}.css");
    }

    [HttpGet("js/{jsFileName}.js")]
    public IActionResult GetJsFile([FromRoute(Name = "jsFileName")] string jsFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFileResponse($"js/{jsFileName}.js");
    }

    [HttpGet("media/{mediaFileName}")]
    public IActionResult GetMediaFile([FromRoute(Name = "mediaFileName")] string mediaFileName, [FromQuery(Name = "v")] bool? version) {
        return GetFileResponse($"media/{mediaFileName}");
    }

    internal FileInfo GetFileInfoFromPath(string relFilePath) {
        return new FileInfo(Path.Combine(_rootDir, relFilePath));
    }

    internal IActionResult GetFileResponseUsingTemplate(string relFilePath, FileInfo template) {
        try {
            var fileInfo = GetFileInfoFromPath(relFilePath);
            var inserted = _fileProcessService.InsertFileContents(template, fileInfo);

            var mimeType = _fileProcessService.ExtractMimeType(fileInfo.FullName);
            Console.WriteLine($"Fetching '{relFilePath}' of type {mimeType}...");
            return File(_fileProcessService.ConvertToByteArray(inserted), mimeType);
        }
        catch (Exception ex) when (ex is FileNotFoundException || ex is DirectoryNotFoundException) {
            return NotFound();
        }
        catch {
            return StatusCode(500);
        }
    }

    internal IActionResult GetFileResponse(string relFilePath) {
        try {
            var filePath = GetFileInfoFromPath(relFilePath);
            var mimeType = _fileProcessService.ExtractMimeType(filePath.FullName);
            Console.WriteLine($"Fetching '{relFilePath}' of type {mimeType}...");
            return File(_fileProcessService.ReadBytesFromFile(filePath), mimeType);
        }
        catch (Exception ex) when (ex is FileNotFoundException || ex is DirectoryNotFoundException) {
            return NotFound();
        }
        catch {
            return StatusCode(500);
        }
    }
}
