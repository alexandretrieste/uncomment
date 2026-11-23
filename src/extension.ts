import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('uncomment.execute', () => {
    const editor = vscode.window.activeTextEditor;

    if (editor) {
      const document = editor.document;
      const text = document.getText();
      const noComments = removeComments(text, document.languageId);

      editor.edit((editBuilder: vscode.TextEditorEdit) => {
        const firstLine = document.lineAt(0);
        const lastLine = document.lineAt(document.lineCount - 1);
        const fullRange = new vscode.Range(firstLine.range.start, lastLine.range.end);
        const oldText = editor.document.getText(fullRange);
        const newText = oldText.replace(oldText, noComments);

        editBuilder.replace(fullRange, newText);
      });
    }
  });

  context.subscriptions.push(disposable);
}

export function removeComments(text: string, languageId = ''): string {
  const id = languageId.toLowerCase();
  const shellLanguages = new Set(['shellscript', 'powershell', 'ruby', 'perl', 'python', 'r', 'yaml', 'dockerfile', 'makefile', 'tcl']);
  const luaLanguages = new Set(['lua']);
  const sqlLanguages = new Set(['sql', 'plsql']);
  const markupLanguages = new Set(['html', 'xml', 'vue', 'svelte', 'markdown', 'md']);
  const haskellLanguages = new Set(['haskell', 'elm']);
  const batchLanguages = new Set(['bat', 'batch', 'dosbatch']);
  const adaLanguages = new Set(['ada']);
  const percentLanguages = new Set(['erlang', 'latex', 'tex']);
  const semicolonLanguages = new Set(['clojure', 'clojurescript', 'lisp', 'scheme', 'racket', 'elisp']);

  if (shellLanguages.has(id)) {
    return removeHashComments(text, id);
  }
  if (id === 'julia') {
    return removeJuliaComments(text);
  }
  if (id === 'php') {
    return removePhpComments(text);
  }
  if (luaLanguages.has(id)) {
    return removeLuaComments(text);
  }
  if (sqlLanguages.has(id)) {
    return removeDelimitedComments(text, ['--'], [['/*', '*/']]);
  }
  if (markupLanguages.has(id)) {
    return removeDelimitedComments(text, [], [['<!--', '-->']]);
  }
  if (haskellLanguages.has(id)) {
    return removeDelimitedComments(text, ['--'], [['{-', '-}']]);
  }
  if (batchLanguages.has(id)) {
    return removeBatchComments(text);
  }
  if (adaLanguages.has(id)) {
    return removeDelimitedComments(text, ['--'], []);
  }
  if (percentLanguages.has(id)) {
    return removeDelimitedComments(text, ['%'], []);
  }
  if (semicolonLanguages.has(id)) {
    return removeDelimitedComments(text, [';'], [['#|', '|#']]);
  }

  return removeCStyleComments(text);
}

function preserveNewlines(comment: string): string {
  return comment.replace(/[^\r\n]/g, ' ');
}

function removeCStyleComments(text: string): string {
  let output = '';
  let i = 0;
  let state: 'code' | 'line' | 'block' | 'string' | 'char' | 'template' = 'code';

  while (i < text.length) {
    if (state === 'code') {
      if (text.startsWith('//', i)) {
        let end = i;
        while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
        output += preserveNewlines(text.slice(i, end));
        i = end;
      } else if (text.startsWith('/*', i)) {
        const endMarker = text.indexOf('*/', i + 2);
        const end = endMarker === -1 ? text.length : endMarker + 2;
        output += preserveNewlines(text.slice(i, end));
        i = end;
      } else if (text[i] === '"') {
        state = 'string';
        output += text[i++];
      } else if (text[i] === '\'') {
        state = 'char';
        output += text[i++];
      } else if (text[i] === '`') {
        state = 'template';
        output += text[i++];
      } else {
        output += text[i++];
      }
    } else if (state === 'string' || state === 'char' || state === 'template') {
      const quote = state === 'string' ? '"' : state === 'char' ? '\'' : '`';
      output += text[i];
      if (text[i] === '\\' && i + 1 < text.length) {
        output += text[++i];
      } else if (text[i] === quote) {
        state = 'code';
      }
      i++;
    } else {
      i++;
    }
  }

  return output;
}

function removeHashComments(text: string, languageId: string): string {
  const tripleQuote = languageId === 'python' ? /("""|''')/ : null;
  let output = '';
  let i = 0;
  let quote: '"' | "'" | '`' | null = null;
  let triple: '"""' | "'''" | null = null;
  let escaped = false;

  while (i < text.length) {
    if (triple && tripleQuote) {
      if (text.startsWith(triple, i)) {
        output += triple;
        i += triple.length;
        triple = null;
      } else {
        output += text[i++];
      }
      continue;
    }

    if (quote) {
      output += text[i];
      if (escaped) {
        escaped = false;
      } else if (text[i] === '\\') {
        escaped = true;
      } else if (text[i] === quote) {
        quote = null;
      }
      i++;
      continue;
    }

    if (languageId === 'python' && text.startsWith('"""', i)) {
      triple = '"""';
      output += '"""';
      i += 3;
      continue;
    }
    if (languageId === 'python' && text.startsWith("'''", i)) {
      triple = "'''";
      output += "'''";
      i += 3;
      continue;
    }

    if (text[i] === '"' || text[i] === '\'' || text[i] === '`') {
      quote = text[i] as '"' | "'" | '`';
      output += text[i++];
    } else if (text[i] === '#') {
      if (languageId === 'perl' && i === 0) {
        let end = i;
        while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
        output += preserveNewlines(text.slice(i, end));
        i = end;
      } else {
        let end = i;
        while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
        output += preserveNewlines(text.slice(i, end));
        i = end;
      }
    } else if (languageId === 'ruby' && text.startsWith('=begin', i)) {
      const endMarker = text.indexOf('=end', i + 6);
      const end = endMarker === -1 ? text.length : endMarker + 4;
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else {
      output += text[i++];
    }
  }

  return output;
}

function removeLuaComments(text: string): string {
  let output = '';
  let i = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  while (i < text.length) {
    if (quote) {
      output += text[i];
      if (escaped) {
        escaped = false;
      } else if (text[i] === '\\') {
        escaped = true;
      } else if (text[i] === quote) {
        quote = null;
      }
      i++;
    } else if (text[i] === '"' || text[i] === '\'') {
      quote = text[i] as '"' | "'";
      output += text[i++];
    } else if (text.startsWith('--[[', i)) {
      const endMarker = text.indexOf(']]', i + 4);
      const end = endMarker === -1 ? text.length : endMarker + 2;
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else if (text.startsWith('--', i)) {
      let end = i;
      while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else {
      output += text[i++];
    }
  }
  return output;
}

function removeJuliaComments(text: string): string {
  let output = '';
  let i = 0;
  let quote: '"' | '\'' | null = null;
  let escaped = false;

  while (i < text.length) {
    if (quote) {
      output += text[i];
      if (escaped) {
        escaped = false;
      } else if (text[i] === '\\') {
        escaped = true;
      } else if (text[i] === quote) {
        quote = null;
      }
      i++;
    } else if (text[i] === '"' || text[i] === '\'') {
      quote = text[i] as '"' | '\'';
      output += text[i++];
    } else if (text.startsWith('#=', i)) {
      const endMarker = text.indexOf('=#', i + 2);
      const end = endMarker === -1 ? text.length : endMarker + 2;
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else if (text[i] === '#') {
      let end = i;
      while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else {
      output += text[i++];
    }
  }
  return output;
}

function removePhpComments(text: string): string {
  let output = '';
  let i = 0;
  let quote: '"' | '\'' | null = null;
  let escaped = false;

  while (i < text.length) {
    if (quote) {
      output += text[i];
      if (escaped) {
        escaped = false;
      } else if (text[i] === '\\') {
        escaped = true;
      } else if (text[i] === quote) {
        quote = null;
      }
      i++;
    } else if (text[i] === '"' || text[i] === '\'') {
      quote = text[i] as '"' | '\'';
      output += text[i++];
    } else if (text.startsWith('//', i) || text[i] === '#') {
      let end = i;
      while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else if (text.startsWith('/*', i)) {
      const endMarker = text.indexOf('*/', i + 2);
      const end = endMarker === -1 ? text.length : endMarker + 2;
      output += preserveNewlines(text.slice(i, end));
      i = end;
    } else {
      output += text[i++];
    }
  }
  return output;
}

function removeDelimitedComments(
  text: string,
  lineMarkers: string[],
  blockMarkers: string[][],
): string {
  let output = '';
  let i = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  while (i < text.length) {
    if (quote) {
      output += text[i];
      if (escaped) {
        escaped = false;
      } else if (text[i] === '\\') {
        escaped = true;
      } else if (text[i] === quote) {
        quote = null;
      }
      i++;
      continue;
    }

    if (text[i] === '"' || text[i] === '\'') {
      quote = text[i] as '"' | "'";
      output += text[i++];
      continue;
    }

    const block = blockMarkers.find(marker => text.startsWith(marker[0], i));
    if (block) {
      const endMarker = text.indexOf(block[1], i + block[0].length);
      const end = endMarker === -1 ? text.length : endMarker + block[1].length;
      output += preserveNewlines(text.slice(i, end));
      i = end;
      continue;
    }

    const line = lineMarkers.find(marker => text.startsWith(marker, i));
    if (line) {
      let end = i;
      while (end < text.length && text[end] !== '\r' && text[end] !== '\n') { end++; }
      output += preserveNewlines(text.slice(i, end));
      i = end;
      continue;
    }

    output += text[i++];
  }

  return output;
}

function removeBatchComments(text: string): string {
  const lines = text.split(/(\r?\n)/);
  for (let i = 0; i < lines.length; i++) {
    if (/^[ \t]*(?:REM(?:\b|$)|::)/i.test(lines[i])) {
      lines[i] = preserveNewlines(lines[i]);
    }
  }
  return lines.join('');
}
