import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('uncomment.execute', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const text = document.getText();

      const noComments = removeComments(text);

      editor.edit(editBuilder => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

        editBuilder.replace(fullRange, noComments);
      });
    }
  });

  context.subscriptions.push(disposable);
}

function removeComments(text: string): string {
  // Regex pattern to match comments that are not inside quotes, templates, or HTML tags
  const commentPattern = /(<[^>]*>)|(['"`])(?:[^\\]|\\.)*?\2|\/\/.*|\/\*[\s\S]*?\*\//g;

  return text.replace(commentPattern, '').replace(/^\s*[\r\n]/gm, '\n');
}
