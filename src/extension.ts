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
    const lineComments = /\/\/.*/g;
    const blockComments = /\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm;
    const htmlComments = /<!--[\s\S]*?-->/gm;
    const cssComments = /\/\*[\s\S]*?\*\//gm;

    return text
        .replace(lineComments, '')
        .replace(blockComments, '')
        .replace(htmlComments, '')
        .replace(cssComments, '');
}
