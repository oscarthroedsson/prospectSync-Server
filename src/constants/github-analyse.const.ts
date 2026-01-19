export interface IAnalysisConfig {
  // Directories never traversed
  excludeDirs: string[];
  maxChunk: number;
  // File size policy (bytes)
  fileLang: Record<string, string>;
  fileSizePolicy: {
    directFetchMax: number; // ≤ this → fetch whole file
    streamMax: number; // ≤ this → stream
    absoluteMax: number; // > this → skip entirely
  };
}
const MB = 1_000_000;
export const DEFAULT_CONFIG: IAnalysisConfig = {
  excludeDirs: [
    // JavaScript/TypeScript
    "node_modules",
    "dist",
    "build",
    "out",
    ".next",
    "coverage",

    // Python
    "__pycache__",
    "venv",
    "env",
    ".pytest_cache",
    ".mypy_cache",

    // Go
    "vendor",

    // Rust
    "target",

    // Java/Kotlin
    "bin",
    "obj",
    ".gradle",

    // PHP
    "vendor",

    // Ruby
    "vendor/bundle",

    // General
    ".git",
    ".vscode",
    ".idea",
    ".vs",
  ],
  fileLang: {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    py: "python",
    go: "go",
    rs: "rust",
    java: "java",
    cpp: "cpp",
    c: "c",
    cs: "csharp",
    rb: "ruby",
    php: "php",
    md: "markdown",
    json: "json",
    yaml: "yaml",
    yml: "yaml",
  },
  maxChunk: 7_892, // give room for overlapping för the embeddings
  fileSizePolicy: {
    directFetchMax: 4 * MB, // ≤ 4 MB → direct fetch
    streamMax: 32 * MB, // >4 MB and ≤32 MB → stream
    absoluteMax: 32 * MB, // >32 MB → skip
  },
};
