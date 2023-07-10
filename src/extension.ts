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
    let inCommentBlock = false;
    const cleanedLines: string[] = [];

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (inCommentBlock) {
            if (cleanedLine.endsWith('*/')) {
                inCommentBlock = false;
                cleanedLine = cleanedLine.slice(0, cleanedLine.length - 2).trim();
            } else {
                cleanedLine = '';
            }
        } else {
            if (cleanedLine.startsWith('/*')) {
                if (cleanedLine.endsWith('*/')) {
                    cleanedLine = cleanedLine.slice(2, cleanedLine.length - 2).trim();
                } else {
                    inCommentBlock = true;
                    cleanedLine = cleanedLine.slice(2).trim();
                }
            } else if (cleanedLine.startsWith('//')) {
                cleanedLine = '';
            }
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines.join('\n');
}
