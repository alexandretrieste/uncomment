'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const changelogPath = path.join(root, 'CHANGELOG.md');
const changelog = fs.readFileSync(changelogPath, 'utf8');
const unreleasedHeading = '## [Unreleased]';
const unreleasedIndex = changelog.indexOf(unreleasedHeading);

if (unreleasedIndex === -1) {
  throw new Error('CHANGELOG.md is missing the [Unreleased] section.');
}

const contentStart = unreleasedIndex + unreleasedHeading.length;
const nextSection = changelog.indexOf('\n## ', contentStart);
const end = nextSection === -1 ? changelog.length : nextSection;
const notes = changelog.slice(contentStart, end).trim();

if (!notes) {
  throw new Error('Add release notes to the [Unreleased] section before versioning.');
}

if (changelog.includes(`## [${packageJson.version}]`)) {
  throw new Error(`CHANGELOG.md already has a section for version ${packageJson.version}.`);
}

const date = new Date().toISOString().slice(0, 10);
const releasedNotes = `## [${packageJson.version}] - ${date}\n\n${notes}`;
const updated = `${changelog.slice(0, unreleasedIndex)}${unreleasedHeading}\n\n${releasedNotes}${changelog.slice(end)}`;

fs.writeFileSync(changelogPath, updated, 'utf8');
