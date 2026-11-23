import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { removeComments } from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('removes JavaScript comments but preserves strings and URLs', () => {
		const source = `const url = "https://example.com/a//b"; // line
/* block */
const text = '// text';`;
		const result = removeComments(source, 'javascript');
		assert.ok(result.includes('"https://example.com/a//b"'));
		assert.ok(result.includes("'// text'"));
		assert.ok(!result.includes('// line'));
		assert.ok(!result.includes('/* block */'));
	});

	test('removes Python comments but preserves docstrings and strings', () => {
		const source = `# comment
name = "# value"
"""# docstring"""
print(name)`;
		const result = removeComments(source, 'python');
		assert.ok(!result.includes('# comment'));
		assert.ok(result.includes('name = "# value"'));
		assert.ok(result.includes('"""# docstring"""'));
	});

	test('removes HTML comments but preserves attributes', () => {
		const source = '<div title="<!-- text -->"><!-- comment --><span>ok</span></div>';
		const result = removeComments(source, 'html');
		assert.ok(result.includes('title="<!-- text -->"'));
		assert.ok(!result.includes('<!----'));
	});
});
