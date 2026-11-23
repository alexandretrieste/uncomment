# Uncomment

**Current version:** 1.4.1

Uncomment is a Visual Studio Code extension that removes comments from the active
editor while preserving comment-like text inside strings and URLs.

## Features

- Removes single-line and block comments using the syntax for the active language.
- Supports C-style comments (`//` and `/* ... */`), hash comments (`#`), SQL and
  Lua line comments, HTML/XML comments, and other common language-specific forms.
- Preserves line breaks and string contents when removing comments.
- Runs on the active editor through the **Uncomment** command.

The extension supports common language modes including C, C++, C#, CSS, Go,
Java, JavaScript, TypeScript, PHP, Python, Ruby, Shell, PowerShell, R, YAML,
Dockerfile, Makefile, Lua, Julia, SQL, HTML, XML, Markdown, Haskell, Elm, Ada,
Erlang, LaTeX, Clojure, Lisp, and Batch. The comment syntax removed depends on
the language mode selected by VS Code.

## Installation

Install **Uncomment** from the
[Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=Revolution50.uncomment),
or search for `Uncomment` in the Extensions view.

## Usage

1. Open a file in VS Code and make sure its language mode is set correctly.
2. Open the Command Palette with `Ctrl+Shift+P` (Windows/Linux) or
   `Cmd+Shift+P` (macOS).
3. Run **Uncomment**.

The extension processes the entire active document. It does not currently
define a keyboard shortcut.

## Run from VS Code

To run the extension from this repository:

1. Open the repository folder in VS Code.
2. Run `npm install` in the integrated terminal.
3. Press `F5` or select **Run > Start Debugging**. The **Run Extension**
   configuration compiles the extension and opens a new Extension Development
   Host window.
4. In the new window, open a source file and run **Uncomment** from the
   Command Palette.

To build the extension manually, run `npm run compile`. To create the
production bundle, run `npm run package`.

## Requirements

- Visual Studio Code 1.80.0 or later
- Node.js and npm to build or run the extension from source

## Known issues

- Comment parsing is syntax-based and does not fully parse every language
  grammar. Review the changes before saving files with complex embedded
  languages or unusual syntax.

## Contributing

Contributions and bug reports are welcome. Please open an issue or submit a
pull request on [GitHub](https://github.com/alexandretrieste/uncomment).

## Releasing

Add release notes under `Unreleased` in `CHANGELOG.md`, then run one of:

- `npm run version:patch` for a backward-compatible fix
- `npm run version:minor` for backward-compatible functionality
- `npm run version:major` for breaking changes

Each command updates the package version, changelog, and README, then creates a
version commit and a `v*` Git tag. Push the commit and tag with
`git push origin main --follow-tags`.

## License

This project is distributed under the [MIT License](LICENSE).
