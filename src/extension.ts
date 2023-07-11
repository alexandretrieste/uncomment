import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('uncomment.execute', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const text = document.getText();

      const noComments = removeComments(text);

      editor.edit((editBuilder: vscode.TextEditorEdit) => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);

        const oldText = editor.document.getText(fullRange);
        const newText = oldText.replace(oldText, noComments);

        editBuilder.replace(fullRange, newText);
      });
    }
  });

  context.subscriptions.push(disposable);
}

function removeComments(text: string): string {
  const urlRegex = /(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([-.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?/g;
  const quotedRegex = /".*?"|'.*?'|`.*?`/g;

  let modifiedText = text;

  // Declare and initialize URLs and quoted strings with their specific types
  const urls: string[] = [];
  const quoted: string[] = [];

  // Replace URLs and quoted strings with placeholders
  modifiedText = modifiedText.replace(urlRegex, match => {
    urls.push(match);
    return `%%URL${urls.length - 1}%%`;
  });
  modifiedText = modifiedText.replace(quotedRegex, match => {
    quoted.push(match);
    return `%%QUOTED${quoted.length - 1}%%`;
  });

  // Remove comments
  const commentsRegex = /(\/\/.*|\/\*[\s\S]*?\*\/|=begin[\s\S]*?=end|<!--[\s\S]*?-->)/g;
  modifiedText = modifiedText.replace(commentsRegex, '');

  // Replace placeholders with their original content
  modifiedText = modifiedText.replace(/%%URL(\d+)%%/g, (_, index) => urls[Number(index)]);
  modifiedText = modifiedText.replace(/%%QUOTED(\d+)%%/g, (_, index) => quoted[Number(index)]);

  return modifiedText;
}
