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

        if (inCommentBlock) {
            if (line.includes('*/')) {
                inCommentBlock = false;
                const remainingText = line.slice(line.indexOf('*/') + 2);
                cleanedLines.push(remainingText);
                continue;
            }
            continue;
        }

        if (inMarkupComment) {
            if (line.includes('-->')) {
                inMarkupComment = false;
                const remainingText = line.slice(line.indexOf('-->') + 3);
                cleanedLines.push(remainingText);
                continue;
            }
            continue;
        }

        let newLine = '';
        let currentIndex = 0;
        while (currentIndex < line.length) {
            if (inQuotedString) {
                const nextQuoteIndex = line.indexOf(quoteChar, currentIndex);
                if (nextQuoteIndex !== -1) {
                    newLine += line.slice(currentIndex, nextQuoteIndex + 1);
                    currentIndex = nextQuoteIndex + 1;
                    inQuotedString = false;
                } else {
                    newLine += line.slice(currentIndex);
                    break;
                }
            } else {
                const nextCommentIndex = line.indexOf('/*', currentIndex);
                const nextQuoteCharIndex = line.indexOf(`'`, currentIndex) < line.indexOf(`"`, currentIndex) ?
                    line.indexOf(`'`, currentIndex) :
                    line.indexOf(`"`, currentIndex);

                if (nextCommentIndex !== -1 && (!inQuotedString || nextCommentIndex < nextQuoteCharIndex)) {
                    if (line.includes('*/', nextCommentIndex)) {
                        newLine += line.slice(currentIndex, nextCommentIndex);
                        currentIndex = line.indexOf('*/', nextCommentIndex) + 2;
                    } else {
                        newLine += line.slice(currentIndex, nextCommentIndex);
                        inCommentBlock = true;
                    }
                } else if (nextQuoteCharIndex !== -1) {
                    newLine += line.slice(currentIndex, nextQuoteCharIndex + 1);
                    currentIndex = nextQuoteCharIndex + 1;
                    inQuotedString = true;
                    quoteChar = line[nextQuoteCharIndex];
                } else {
                    newLine += line.slice(currentIndex);
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
