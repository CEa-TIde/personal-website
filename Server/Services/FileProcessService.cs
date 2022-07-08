using System.Text;
using System.Text.RegularExpressions;
using Server.Entities;

namespace Server.Services;
public class FileProcessService {

    private readonly Dictionary<string, ReplacePattern[]> _patternDictionary;

    public FileProcessService(Dictionary<string, ReplacePattern[]> patternDictionary) {
        _patternDictionary = patternDictionary;
    }

    public FileProcessService() {
        _patternDictionary = new Dictionary<string, ReplacePattern[]>();
    }

    /// <inheritdoc cref="File.ReadAllText(string)"/>
    public string ReadStringFromFile(FileInfo file) {
        return File.ReadAllText(file.FullName);
    }

    /// <inheritdoc cref="File.ReadAllBytes(string)"/>
    public byte[] ReadBytesFromFile(FileInfo file) {
        return File.ReadAllBytes(file.FullName);
    }

    public byte[] ConvertToByteArray(string content) {
        return Encoding.UTF8.GetBytes(content);
    }

    internal string GetReplacementWithSpecialCases(string replacement, FileInfo file) {
        // return requested file
        if (replacement == "[File]")
            return ReadStringFromFile(file);
        // return file name
        if (replacement == "[FileName]")
            return file.Name;
        // return file name without the extension
        if (replacement == "[FileNameNoExt]") {
            return RemoveFileExtension(file.Name);
        }
        // return file name without extension and spaced on dashes
        if (replacement == "[FileNameSpaced]") {
            return new Regex("-").Replace(RemoveFileExtension(file.Name), " ");
        }
        return replacement;
    }

    internal string RemoveFileExtension(string fileName) {
        var nameSplit = fileName.Split(".");
        var res = "";
        for (var i = 0; i < nameSplit.Length - 1; i++) {
            res += nameSplit[i];
        }
        return res;
    }

    public string InsertFileContents(string template, FileInfo file, ReplacePattern pattern) {
        var replacement = GetReplacementWithSpecialCases(pattern.Replacement.GetReplacement(), file);
        if (pattern.ShouldReplaceAll())
            return pattern.Regex.Replace(template, replacement);
        else
            return pattern.Regex.Replace(template, replacement, pattern.Count);
    }

    public string InsertFileContents(string template, FileInfo file, ReplacePattern[] patterns) {
        foreach (var pattern in patterns) {
            template = InsertFileContents(template, file, pattern);
        }
        return template;
    }

    public string InsertFileContents(FileInfo template, FileInfo file, ReplacePattern[] patterns) {
        var templateStr = ReadStringFromFile(template);
        return InsertFileContents(templateStr, file, patterns);
    }

    public string InsertFileContents(string template, FileInfo file) {
        if (_patternDictionary.TryGetValue(RemoveFileExtension(file.Name), out var patterns)) {
            return InsertFileContents(template, file, patterns);
        }
        else if (_patternDictionary.TryGetValue("default", out var defaultPatterns)) {
            Console.WriteLine("No match found; using default patterns");
            return InsertFileContents(template, file, defaultPatterns);
        }
        return template;
    }

    public string InsertFileContents(FileInfo template, FileInfo file) {
        var templateStr = ReadStringFromFile(template);
        return InsertFileContents(templateStr, file);
    }

    public string ExtractFileExtension(string fileName) {
        return fileName.Split('.')[^1];
    }

    public string ExtractMimeType(string fileName) {
        return MimeTypes.GetMimeType(fileName);
    }
}
