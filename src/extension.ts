function removeComments(text: string): string {
  const lines = text.split('\n');

  let insideBlockComment = false;
  let resultLines = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (insideBlockComment) {
      // Check if the block comment ends in this line
      if (trimmedLine.includes('*/')) {
        insideBlockComment = false;
      }
    } else {
      // Check if the line contains a block comment that starts and ends in the same line
      if (trimmedLine.includes('/*') && trimmedLine.includes('*/')) {
        // Remove the block comment from the line
        const modifiedLine = trimmedLine.replace(/\/\*.*\*\//, '');
        resultLines.push(modifiedLine);
      } else {
        // Remove block comments and inline comments
        const modifiedLine = trimmedLine.replace(/\/\*.*\*\//g, '').replace(/\/\/.*/, '');
        resultLines.push(modifiedLine);
      }

      // Check if the line starts a block comment
      if (trimmedLine.startsWith('/*') && !trimmedLine.endsWith('*/')) {
        insideBlockComment = true;
      }
    }
  }

  return resultLines.join('\n');
}
