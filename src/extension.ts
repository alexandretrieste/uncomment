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
  const cleanedText = text.replace(/((['"`]).*?\2)|(?<!https:)\/\/.*|\/\*[^]*?\*\/|(?<!:)<!--[^]*?-->/g,
    (match, group1) => group1 ? match : '');

  const normalizedText = cleanedText.replace(/\n{3,}/g, '\n\n');

  return normalizedText;
}
