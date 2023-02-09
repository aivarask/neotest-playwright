import * as logger from 'neotest.logging';
import type * as P from '@playwright/test/reporter';

// TODO: replace vim.notify with logger.debug

/** Returns the playwright config */
const get_projects = () => {
	const testFilter = './does-not-exist';
	const cmd = `npx playwright test --list --reporter=json ${testFilter} `;

	const [handle, errmsg] = io.popen(cmd);

	if (typeof errmsg === 'string') {
		vim.notify(errmsg, vim.log.levels.ERROR, {});
	}

	if (!handle) {
		vim.notify(`Failed to execute command: ${cmd}`, vim.log.levels.ERROR, {});
		return;
	}

	const output = handle.read('*a');
	handle.close();

	// print(output);

	if (typeof output !== 'string') {
		vim.notify(
			`Failed to read output from command: ${cmd}`,
			vim.log.levels.ERROR,
			{},
		);
		return;
	}

	if (output === '') {
		vim.notify(`No output from command: ${cmd}`, vim.log.levels.ERROR, {});
		return;
	}

	const parsed = vim.fn.json_decode(output);

	return parsed;
};

/** Returns a list of project names */
const parseProjects = (output: P.JSONReport) => {
	const names = output.config.projects.map((p) => p.name);

	return names;
};

export const create_project_command = () => {
	vim.api.nvim_create_user_command(
		'NeotestPlaywrightProject',
		// @ts-expect-error until type is updated
		() => {
			const output = get_projects();
			const options = parseProjects(output);
			select_projects(options);
		},
		{
			nargs: 0,
		},
	);
};

export const select_projects = (options: string[]) => {
	const prompt = 'Select projects to include in the next test run:';

	let choice: unknown;

	vim.ui.select(options, { prompt }, (c) => {
		choice = c;
	});

	logger.debug('neotest-playwright project', choice);

	return choice;
};