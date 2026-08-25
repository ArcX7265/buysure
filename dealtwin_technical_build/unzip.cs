using System;
using System.IO;
using System.IO.Compression;

public static class UnzipShim {
  public static int Main(string[] args) {
    if (args.Length < 2) return 2;
    using (var fs = File.OpenRead(args[1]))
    using (var zip = new ZipArchive(fs, ZipArchiveMode.Read)) {
      if (args[0] == "-Z1") {
        foreach (var e in zip.Entries) Console.Out.WriteLine(e.FullName);
        return 0;
      }
      if (args[0] == "-p" && args.Length >= 3) {
        var e = zip.GetEntry(args[2]);
        if (e == null) return 11;
        using (var input = e.Open()) input.CopyTo(Console.OpenStandardOutput());
        return 0;
      }
    }
    return 2;
  }
}
