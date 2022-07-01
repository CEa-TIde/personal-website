using System.Text;
using System.Text.RegularExpressions;
using Server.Entities;

namespace Server.Services;
public class FileProcessService {

    private readonly ReplacePattern[] _replacePatterns;

    public FileProcessService(ReplacePattern[] replacePatterns) {
        _replacePatterns = replacePatterns;
    }

    public FileProcessService() {
        _replacePatterns = Array.Empty<ReplacePattern>();
    }

    public string ReadStringFromFile(FileInfo file) {
        return File.ReadAllText(file.FullName);
    }

    public byte[] ReadBytesFromFile(FileInfo file) {
        return File.ReadAllBytes(file.FullName);
    }

    public byte[] ConvertToByteArray(string content) {
        return Encoding.UTF8.GetBytes(content);
    }

    public string ReplaceFileContents(string fileContents, ReplacePattern pattern) {
        string replacement;
        if (pattern.IsFile())
            replacement = ReadStringFromFile(pattern.ReplacementFile!);
        else
            replacement = pattern.ReplacementStr!;

        string res;
        if (pattern.Count == -1)
            res = pattern.Pattern.Replace(fileContents, replacement);
        else
            res = pattern.Pattern.Replace(fileContents, replacement, pattern.Count);

        return res;
    }

    public string ReplaceFileContents(string fileContents, ReplacePattern[] patterns) {
        foreach (var pattern in patterns)
            fileContents = ReplaceFileContents(fileContents, pattern);
        return fileContents;
    }

    public string ReplaceFileContents(string fileContents) {
        return ReplaceFileContents(fileContents, _replacePatterns);
    }

    public string InsertFileContents(string fileContents, ReplacePattern pattern) {
        string template;
        if (pattern.IsFile())
            template = ReadStringFromFile(pattern.ReplacementFile!);
        else
            template = pattern.ReplacementStr!;

        string res;
        if (pattern.Count == -1)
            res = pattern.Pattern.Replace(template, fileContents);
        else
            res = pattern.Pattern.Replace(template, fileContents, pattern.Count);

        return res;
    }

    public string InsertFileContents(string fileContents, ReplacePattern[] patterns) {
        foreach (var pattern in patterns)
            fileContents = InsertFileContents(fileContents, pattern);
        return fileContents;
    }

    public string InsertFileContents(string fileContents) {
        return InsertFileContents(fileContents, _replacePatterns);
    }

    public string ExtractFileExtension(string fileName) {
        return fileName.Split('.')[^1];
    }
}
