using System.Text.RegularExpressions;

namespace Server.Entities;

/// <summary>
/// A container class to hold all relevant information about a replace pattern.
/// </summary>
public class ReplacePattern {

    /// <summary>
    /// The regex pattern to match against.
    /// </summary>
    public readonly Regex Regex;

    public readonly Replacement Replacement;

    /// <summary>
    /// Max replacement count. All should be replaced if -1.
    /// </summary>
    public readonly int Count;

    public ReplacePattern(Regex regex, Replacement replacement, int count = -1) {
        Regex = regex;
        Replacement = replacement;
        Count = count;
    }

    public bool ShouldReplaceAll() {
        return Count == -1;
    }
}
