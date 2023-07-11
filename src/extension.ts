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

    for (const line of lines) {
        const cleanedLine = removeLineComments(line);

        if (inCommentBlock) {
            if (line.includes('*/')) {
                inCommentBlock = false;
                continue;
            } else {
                continue;
            }
        }

        if (inMarkupComment) {
            if (line.includes('-->')) {
                inMarkupComment = false;
            }
            continue;
        }

        if (line.includes('/*')) {
            if (line.includes('*/')) {
                continue;
            } else {
                inCommentBlock = true;
                continue;
            }
        }

        if (line.includes('<!--')) {
            if (line.includes('-->')) {
                continue;
            } else {
                inMarkupComment = true;
                continue;
            }
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines.join('\n');
}

function removeLineComments(line: string): string {
    const lineComments = ['//', '#', ';', '--'];
    let cleanedLine = line.trim();

    for (const comment of lineComments) {
        const index = cleanedLine.indexOf(comment);
        if (index !== -1) {
            cleanedLine = cleanedLine.slice(0, index).trim();
            break;
        }
    }

    return cleanedLine;
}
