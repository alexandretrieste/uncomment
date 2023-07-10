import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('uncomment.execute', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const text = document.getText();

            const noComments = removeComments(text, document.languageId);

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

function removeComments(text: string, languageId: string): string {
    const lines = text.split('\n');
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    switch (languageId) {
        case 'javascript':
            cleanedLines = removeCommentsFromJavaScript(lines);
            break;

        case 'typescript':
            cleanedLines = removeCommentsFromTypeScript(lines);
            break;

        case 'java':
            cleanedLines = removeCommentsFromJava(lines);
            break;

        case 'python':
            cleanedLines = removeCommentsFromPython(lines);
            break;

        case 'csharp':
            cleanedLines = removeCommentsFromCSharp(lines);
            break;

        case 'php':
            cleanedLines = removeCommentsFromHTML(lines);
            break;

        case 'ruby':
            cleanedLines = removeCommentsFromXML(lines);
            break;

        case 'go':
            cleanedLines = removeCommentsFromXML(lines);
            break;

        case 'swift':
            cleanedLines = removeCommentsFromCSS(lines);
            break;

        case 'kotlin':
            cleanedLines = removeCommentsFromHTML(lines);
            break;

        case 'html':
            cleanedLines = removeCommentsFromHTML(lines);
            break;

        case 'xml':
            cleanedLines = removeCommentsFromXML(lines);
            break;

        case 'css':
            cleanedLines = removeCommentsFromCSS(lines);
            break;

        default:
            cleanedLines = lines;
            break;
    }

    return cleanedLines.join('\n');
}

function removeCommentsFromJavaScript(lines: string[]): string[] {
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith('//')) {
            cleanedLine = '';
        } else if (cleanedLine.startsWith('/*')) {
            if (cleanedLine.endsWith('*/')) {
                cleanedLine = '';
            } else {
                inCommentBlock = true;
                cleanedLine = '';
            }
        } else if (cleanedLine.endsWith('*/')) {
            inCommentBlock = false;
            cleanedLine = '';
        } else if (inCommentBlock) {
            cleanedLine = '';
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromTypeScript(lines: string[]): string[] {
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith('//')) {
            cleanedLine = '';
        } else if (cleanedLine.startsWith('/*')) {
            if (cleanedLine.endsWith('*/')) {
                cleanedLine = '';
            } else {
                inCommentBlock = true;
                cleanedLine = '';
            }
        } else if (cleanedLine.endsWith('*/')) {
            inCommentBlock = false;
            cleanedLine = '';
        } else if (inCommentBlock) {
            cleanedLine = '';
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromJava(lines: string[]): string[] {
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith('//')) {
            cleanedLine = '';
        } else if (cleanedLine.startsWith('/*')) {
            if (cleanedLine.endsWith('*/')) {
                cleanedLine = '';
            } else {
                inCommentBlock = true;
                cleanedLine = '';
            }
        } else if (cleanedLine.endsWith('*/')) {
            inCommentBlock = false;
            cleanedLine = '';
        } else if (inCommentBlock) {
            cleanedLine = '';
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromPython(lines: string[]): string[] {
    let cleanedLines: string[] = [];

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith('#')) {
            cleanedLine = '';
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromCSharp(lines: string[]): string[] {
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith("//")) {
            cleanedLine = "";
        } else if (cleanedLine.startsWith("/*")) {
            if (cleanedLine.endsWith("*/")) {
                cleanedLine = "";
            } else {
                inCommentBlock = true;
                cleanedLine = "";
            }
        } else if (cleanedLine.endsWith("*/")) {
            inCommentBlock = false;
            cleanedLine = "";
        } else if (inCommentBlock) {
            cleanedLine = "";
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromHTML(lines: string[]): string[] {
    let cleanedLines: string[] = [];

    for (const line of lines) {
        let cleanedLine = line;

        if (cleanedLine.includes("<!--")) {
            cleanedLine = "";
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromXML(lines: string[]): string[] {
    let cleanedLines: string[] = [];

    for (const line of lines) {
        let cleanedLine = line;

        if (cleanedLine.includes("<!--")) {
            cleanedLine = "";
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}

function removeCommentsFromCSS(lines: string[]): string[] {
    let cleanedLines: string[] = [];
    let inCommentBlock = false;

    for (const line of lines) {
        let cleanedLine = line.trim();

        if (cleanedLine.startsWith("/*")) {
            if (cleanedLine.endsWith("*/")) {
                cleanedLine = "";
            } else {
                inCommentBlock = true;
                cleanedLine = "";
            }
        } else if (cleanedLine.endsWith("*/")) {
            inCommentBlock = false;
            cleanedLine = "";
        } else if (inCommentBlock) {
            cleanedLine = "";
        }

        cleanedLines.push(cleanedLine);
    }

    return cleanedLines;
}
