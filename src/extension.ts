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
  const cleanedLines: string[] = [];
  let inCommentBlock = false;
  let inMarkupComment = false;
  let inQuotedString = false;
  let quoteChar = '';

  for (const line of lines) {
    const cleanedLine = removeLineComments(line, inQuotedString);
    const cleanedLineWithoutMarkupComments = removeMarkupComments(cleanedLine, inMarkupComment);

    if (inCommentBlock) {
      if (line.includes('*/')) {
        inCommentBlock = false;
        const remainingText = line.slice(line.indexOf('*/') + 2);
        cleanedLines.push(remainingText);
        continue;
      }
      continue;
    }

    let newLine = '';
    let currentIndex = 0;
    while (currentIndex < cleanedLineWithoutMarkupComments.length) {
      if (inQuotedString) {
        const nextQuoteIndex = cleanedLineWithoutMarkupComments.indexOf(quoteChar, currentIndex);
        if (nextQuoteIndex !== -1) {
          newLine += cleanedLineWithoutMarkupComments.slice(currentIndex, nextQuoteIndex + 1);
          currentIndex = nextQuoteIndex + 1;
          inQuotedString = false;
        } else {
          newLine += cleanedLineWithoutMarkupComments.slice(currentIndex);
          break;
        }
      } else {
        const nextCommentIndex = cleanedLineWithoutMarkupComments.indexOf('/*', currentIndex);
        const nextQuoteCharIndex = cleanedLineWithoutMarkupComments.indexOf(`'`, currentIndex) < cleanedLineWithoutMarkupComments.indexOf(`"`, currentIndex) ?
          cleanedLineWithoutMarkupComments.indexOf(`'`, currentIndex) :
          cleanedLineWithoutMarkupComments.indexOf(`"`, currentIndex);

        if (nextCommentIndex !== -1 && (!inQuotedString || nextCommentIndex < nextQuoteCharIndex)) {
          if (cleanedLineWithoutMarkupComments.includes('*/', nextCommentIndex)) {
            newLine += cleanedLineWithoutMarkupComments.slice(currentIndex, nextCommentIndex);
            currentIndex = cleanedLineWithoutMarkupComments.indexOf('*/', nextCommentIndex) + 2;
          } else {
            newLine += cleanedLineWithoutMarkupComments.slice(currentIndex, nextCommentIndex);
            inCommentBlock = true;
          }
        } else if (nextQuoteCharIndex !== -1) {
          newLine += cleanedLineWithoutMarkupComments.slice(currentIndex, nextQuoteCharIndex + 1);
          currentIndex = nextQuoteCharIndex + 1;
          inQuotedString = true;
          quoteChar = cleanedLineWithoutMarkupComments[nextQuoteCharIndex];
        } else {
          newLine += cleanedLineWithoutMarkupComments.slice(currentIndex);
          break;
        }
      }
    }

    cleanedLines.push(newLine);
  }

  return cleanedLines.join('\n');
}

function removeLineComments(line: string, inQuotedString: boolean): string {
  const lineComments = ['//', '#', ';', '--'];
  let cleanedLine = line;

  if (!inQuotedString) {
    for (const comment of lineComments) {
      const index = cleanedLine.indexOf(comment);
      if (index !== -1) {
        cleanedLine = cleanedLine.slice(0, index).trimRight();
        break;
      }
    }
  }

  return cleanedLine;
}

function removeMarkupComments(line: string, inMarkupComment: boolean): string {
  if (inMarkupComment) {
    if (line.includes('-->')) {
      inMarkupComment = false;
      const remainingText = line.slice(line.indexOf('-->') + 3);
      return remainingText;
    } else {
      return '';
    }
  } else {
    let cleanedLine = line;

    while (cleanedLine.includes('<!--')) {
      if (cleanedLine.includes('-->')) {
        const startIndex = cleanedLine.indexOf('<!--');
        const endIndex = cleanedLine.indexOf('-->') + 3;
        cleanedLine = cleanedLine.slice(0, startIndex) + cleanedLine.slice(endIndex);
      } else {
        inMarkupComment = true;
        const startIndex = cleanedLine.indexOf('<!--');
        cleanedLine = cleanedLine.slice(0, startIndex);
      }
    }

    return cleanedLine;
  }
}
