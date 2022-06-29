using System.Text;

namespace Server.Services;
public class FileProcessService {

    public string ReadStringFromFile(FileInfo file) {
        return File.ReadAllText(file.FullName);
    }

    public byte[] ReadBytesFromFile(FileInfo file) {
        return File.ReadAllBytes(file.FullName);
    }

    public string ReplaceFileContents(string original, (string Match, string Replace)[] replacePatterns) {
        var replaced = original;
        foreach (var (match, replace) in replacePatterns) {
            replaced = replaced.Replace($"[{match}]", replace);
        }
        return replaced;
    }

    public byte[] ConvertToByteArray(string content) {
        return Encoding.UTF8.GetBytes(content);
    }
}
