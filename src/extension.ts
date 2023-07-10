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
