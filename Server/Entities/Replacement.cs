namespace Server.Entities;

public class Replacement {

    private readonly FileInfo? _file;

    private readonly string? _contents;

    public Replacement(FileInfo file) {
        _file = file;
    }

    public Replacement(string fileContents) {
        _contents = fileContents;
    }

    public string GetReplacement() {
        if (_contents is not null)
            return _contents;
        return File.ReadAllText(_file!.FullName);
    }
}
