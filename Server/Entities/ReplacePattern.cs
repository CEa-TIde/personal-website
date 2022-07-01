using System.Text.RegularExpressions;

namespace Server.Entities;

/// <summary>
/// A container class to hold all relevant information about a replace pattern.
/// </summary>
public class ReplacePattern {

    /// <summary>
    /// The regex pattern to match against.
    /// </summary>
    public readonly Regex Pattern;

    /// <summary>
    /// The string replacement. Mutually exclusive with <see cref="ReplacementFile"/>
    /// </summary>
    public readonly string? ReplacementStr;

    /// <summary>
    /// The file replacement. Mutually exclusive with <see cref="ReplacementStr"/>
    /// </summary>
    public readonly FileInfo? ReplacementFile;

    /// <summary>
    /// Max replacement count. All should be replaced if -1.
    /// </summary>
    public readonly int Count;

    /// <summary>
    /// Constructor for a replace pattern.
    /// </summary>
    /// <param name="regex">The regex pattern to match against</param>
    /// <param name="replacement">The replacement of the pattern</param>
    /// <param name="count">Max replacement count; -1 means all matches should be replaced</param>
    public ReplacePattern(Regex regex, string replacement, int count = -1) {
        Pattern = regex;
        ReplacementStr = replacement;
        Count = count;
    }

    /// <summary>
    /// Constructor for a replace pattern.
    /// </summary>
    /// <param name="regex">The regex pattern to match against</param>
    /// <param name="replacement">The file, the content of which is the replacement of the pattern</param>
    /// <param name="count">Max replacement count; -1 means all matches should be replaced</param>
    public ReplacePattern(Regex regex, FileInfo replacement, int count = -1) {
        Pattern = regex;
        ReplacementFile = replacement;
        Count = count;
    }

    /// <summary>
    /// Returns if the replacement is a file or not
    /// </summary>
    /// <returns>True if <see cref="ReplacementFile"/> is not null; false otherwise</returns>
    public bool IsFile() {
        return ReplacementFile is not null;
    }

    /// <summary>
    /// Returns if the replacement is a string or not
    /// </summary>
    /// <returns>True if <see cref="ReplacementStr"/> is not null; false otherwise</returns>
    public bool IsString() {
        return ReplacementStr is not null;
    }
}
