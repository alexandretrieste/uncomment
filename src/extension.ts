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
  const resultLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    const isLineInsideBlockComment = isInsideBlockComment(line, trimmedLine);

    if (!isLineInsideBlockComment) {
      const modifiedLine = removeInlineComment(trimmedLine);
      resultLines.push(line.replace(trimmedLine, modifiedLine));
    } else {
      resultLines.push(line);
    }
  }

  return resultLines.join('\n');
}

function isInsideBlockComment(line: string, trimmedLine: string): boolean {
  let insideBlockComment = false;

  if (trimmedLine.startsWith('/*') && trimmedLine.endsWith('*/')) {
    // The entire line is a block comment
    insideBlockComment = true;
  } else if (trimmedLine.startsWith('/*')) {
    // The block comment starts in this line but ends in a later line
    insideBlockComment = true;
  } else if (trimmedLine.endsWith('*/')) {
    // The block comment ends in this line but starts in an earlier line
    const previousLine = line.substring(0, line.lastIndexOf(trimmedLine));
    if (!previousLine.includes('/*')) {
      insideBlockComment = true;
    }
  } else if (trimmedLine.includes('/*') && trimmedLine.includes('*/')) {
    // The block comment starts and ends in this line
    const modifiedLine = trimmedLine.replace(/\/\*.*\*\//, '');
    const indentation = line.substring(0, line.indexOf(trimmedLine));
    resultLines.push(`${indentation}${modifiedLine}`);
  }

  return insideBlockComment;
}

function removeInlineComment(line: string): string {
  const inlineCommentIndex = line.indexOf('//');
  if (inlineCommentIndex !== -1) {
    return line.substring(0, inlineCommentIndex);
  }
  return line;
}
