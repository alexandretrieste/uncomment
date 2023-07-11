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
  const lines = text.split('\n');

  let insideBlockComment = false;
  let resultLines: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (insideBlockComment) {
      // Check if the block comment ends in this line
      if (trimmedLine.includes('*/')) {
        insideBlockComment = false;
        const remainingText = line.slice(line.indexOf('*/') + 2);
        resultLines.push(remainingText);
        continue;
      }
      continue;
    }

    let newLine = '';
    let currentIndex = 0;
    while (currentIndex < line.length) {
      if (line.startsWith('//', currentIndex)) {
        // Line comment found, skip the rest of the line
        break;
      } else if (line.startsWith('/*', currentIndex)) {
        // Block comment found, check if it ends in this line
        const endIndex = line.indexOf('*/', currentIndex + 2);
        if (endIndex !== -1) {
          currentIndex = endIndex + 2;
        } else {
          insideBlockComment = true;
          break;
        }
      } else {
        newLine += line[currentIndex];
        currentIndex++;
      }
    }

    resultLines.push(newLine);
  }

  return resultLines.join('\n');
}
