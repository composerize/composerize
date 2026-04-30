/* eslint-disable */

const fs = require('fs');
const tty = require('tty');

const Composeverter = require('composeverter');
const { Select } = require('enquirer');
const combos = require('enquirer/lib/combos');

function isPlainObject(value) {
	return value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeForCompare(value) {
	if (Array.isArray(value)) return value.map(normalizeForCompare);
	if (!isPlainObject(value)) return value;

	return Object.keys(value).sort().reduce((result, key) => {
		result[key] = normalizeForCompare(value[key]);
		return result;
	}, {});
}

function valuesAreEqual(left, right) {
	return JSON.stringify(normalizeForCompare(left)) === JSON.stringify(normalizeForCompare(right));
}

function dedupeExactArrayValues(value) {
	if (Array.isArray(value)) {
		const seen = new Set();
		const result = [];

		value.forEach((entry) => {
			const normalizedEntry = JSON.stringify(normalizeForCompare(entry));
			if (seen.has(normalizedEntry)) return;

			seen.add(normalizedEntry);
			result.push(dedupeExactArrayValues(entry));
		});

		return result;
	}

	if (isPlainObject(value)) {
		return Object.keys(value).reduce((result, key) => {
			result[key] = dedupeExactArrayValues(value[key]);
			return result;
		}, {});
	}

	return value;
}

function formatPath(path) {
	return path.length ? path.join('.') : '<root>';
}

function formatValue(value) {
	if (value === undefined) return '<missing>';
	if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null) {
		return String(value);
	}

	return Composeverter.yamlStringify(value, { indent: 2 }).trim();
}

function formatOneLineValue(value) {
	return formatValue(value)
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean)
		.join(' ; ');
}

function joinConflictLine(conflict, status) {
	const oldValue = formatOneLineValue(conflict.oldValue);
	const newValue = formatOneLineValue(conflict.newValue);
	const prefix = status ? `${status} ` : '';
	return `${prefix}${formatPath(conflict.path)} | old: ${oldValue} | new: ${newValue}`;
}

function canKeepBoth(conflict) {
	return Array.isArray(conflict.oldValue) && Array.isArray(conflict.newValue);
}

function collectConflicts(oldValue, newValue, path, conflicts) {
	if (oldValue === undefined || newValue === undefined || valuesAreEqual(oldValue, newValue)) return;

	if (isPlainObject(oldValue) && isPlainObject(newValue)) {
		Object.keys(newValue).forEach((key) => {
			if (Object.prototype.hasOwnProperty.call(oldValue, key)) {
				collectConflicts(oldValue[key], newValue[key], path.concat(key), conflicts);
			}
		});
		return;
	}

	conflicts.push({
		path,
		oldValue,
		newValue,
	});
}

function mergeWithChoices(oldValue, newValue, path, choices) {
	if (oldValue === undefined) return newValue;
	if (newValue === undefined || valuesAreEqual(oldValue, newValue)) return oldValue;

	if (isPlainObject(oldValue) && isPlainObject(newValue)) {
		const result = { ...oldValue };
		Object.keys(newValue).forEach((key) => {
			result[key] = mergeWithChoices(oldValue[key], newValue[key], path.concat(key), choices);
		});
		return result;
	}

	const choice = choices[formatPath(path)];
	if (choice === 'new') return newValue;
	if (choice === 'both') {
		if (Array.isArray(oldValue) && Array.isArray(newValue)) return oldValue.concat(newValue);
		return oldValue;
	}

	return oldValue;
}

function splitLeadingComments(yaml) {
	const lines = yaml.split('\n');
	const commentLines = [];

	while (lines.length > 0 && (lines[0].trim() === '' || lines[0].trim().startsWith('#'))) {
		commentLines.push(lines.shift());
	}

	return {
		comments: commentLines.join('\n').trim(),
		yaml: lines.join('\n'),
	};
}

function openPromptContext() {
	if (process.stdin.isTTY) {
		return {
			stdin: process.stdin,
			stdout: process.stderr,
			close: () => {},
		};
	}

	const ttyPath = process.platform === 'win32' ? '\\\\.\\CONIN$' : '/dev/tty';
	const inputFd = fs.openSync(ttyPath, 'r');
	const outputFd = fs.openSync(ttyPath, 'w');
	const input = new tty.ReadStream(inputFd);
	const output = new tty.WriteStream(outputFd);

	return {
		stdin: input,
		stdout: output,
		close: () => {
			input.destroy();
			output.end();
		},
	};
}

async function promptForChoices(conflicts) {
	let promptHandle;

	try {
		promptHandle = openPromptContext();
	} catch (error) {
		throw new Error('merge conflicts require an interactive terminal to choose old or new values');
	}

	const choices = {};

	try {
		promptHandle.stdout.write(`\nMerge conflicts found: ${conflicts.length}\n`);

		while (true) {
			const conflict = conflicts.find((c) => !choices[formatPath(c.path)]);
			if (!conflict) return choices;

			const path = formatPath(conflict.path);
			const conflictIndex = conflicts.indexOf(conflict) + 1;

			const promptChoices = [
				{ name: 'old', message: 'old - keep old value' },
				{ name: 'new', message: 'new - use new value' },
			];

			if (canKeepBoth(conflict)) {
				promptChoices.push({ name: 'both', message: 'both - keep both values' });
			}

			if (conflicts.length > 1) {
				promptChoices.push(
					{ name: 'all-old', message: 'Keep all old values' },
					{ name: 'all-new', message: 'Use all new values' },
				);

				if (conflicts.some((c) => !choices[formatPath(c.path)] && canKeepBoth(c))) {
					promptChoices.push({ name: 'all-both', message: 'Keep both for all list conflicts' });
				}
			}

			const answer = await new Select({
				name: 'answer',
				message: `${conflictIndex}/${conflicts.length} ${joinConflictLine(conflict)}`,
				choices: promptChoices,
				stdin: promptHandle.stdin,
				stdout: promptHandle.stdout,
				actions: {
					keys: {
						...combos.keys,
						o: 'chooseOld',
						n: 'chooseNew',
						b: 'chooseBoth',
					},
				},
				chooseOld() {
					this.index = this.findIndex('old');
					return this.submit();
				},
				chooseNew() {
					this.index = this.findIndex('new');
					return this.submit();
				},
				chooseBoth() {
					this.index = this.findIndex('both');
					return this.submit();
				},
			}).run();

			if (answer === 'all-old') {
				conflicts.forEach((c) => {
					choices[formatPath(c.path)] = 'old';
				});
				return choices;
			}
			if (answer === 'all-new') {
				conflicts.forEach((c) => {
					choices[formatPath(c.path)] = 'new';
				});
				return choices;
			}
			if (answer === 'all-both') {
				conflicts.forEach((c) => {
					if (canKeepBoth(c)) {
						choices[formatPath(c.path)] = 'both';
					}
				});
				continue;
			}

			choices[path] = answer;
		}
	} finally {
		promptHandle.close();
	}
}

function normalizeOutputFormat(yaml, composeVersion, indent) {
	if (composeVersion === 'v2x') return Composeverter.migrateFromV3xToV2x(yaml, { indent });
	if (composeVersion === 'latest') return Composeverter.migrateToCommonSpec(yaml, { indent });
	if (composeVersion !== 'v3x') throw new Error(`Unknown ComposeVersion '${composeVersion}'`);
	return yaml;
}

async function composerizeCli({
	command,
	composerize,
	composeVersion,
	existingDockerCompose,
	indent,
	resolveConflicts = promptForChoices,
}) {
	const generatedOutput = composerize(command, '', composeVersion, indent);
	const { comments, yaml: generatedYaml } = splitLeadingComments(generatedOutput);
	const generatedJson = Composeverter.yamlParse(generatedYaml) || {};

	if (!existingDockerCompose) {
		const yaml = normalizeOutputFormat(
			Composeverter.yamlStringify(dedupeExactArrayValues(generatedJson), { indent }),
			composeVersion,
			indent,
		).trim();
		return comments ? `${comments}\n${yaml}` : yaml;
	}

	const existingJson = Composeverter.yamlParse(existingDockerCompose) || {};
	const conflicts = [];

	collectConflicts(existingJson, generatedJson, [], conflicts);

	let choices = {};
	if (conflicts.length > 0) {
		choices = await resolveConflicts(conflicts);
	}

	const mergedJson = dedupeExactArrayValues(mergeWithChoices(existingJson, generatedJson, [], choices));
	const mergedYaml = normalizeOutputFormat(
		Composeverter.yamlStringify(mergedJson, { indent }),
		composeVersion,
		indent,
	).trim();

	return comments ? `${comments}\n${mergedYaml}` : mergedYaml;
}

module.exports = {
	composerizeCli,
};
