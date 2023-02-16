import type * as P from '@playwright/test/reporter';
import type * as neotest from 'neotest';
import { cleanAnsi } from 'neotest-playwright.util';
import { options } from './adapter-options';
import { emitError } from './helpers';

// ### Output ###

export const decodeOutput = (data: string): P.JSONReport => {
	const [ok, parsed] = pcall(vim.json.decode, data, {
		luanil: { object: true },
	});

	if (!ok) {
		emitError('Failed to parse test output json');
		throw new Error('Failed to parse test output json');
	}

	return parsed;
};

export const parseOutput = (report: P.JSONReport): neotest.Results => {
	if (report.errors.length > 1) {
		emitError('Global errors found in report');
	}

	const root = report.suites[0];

	if (!root) {
		emitError('No test suites found in report');
		return {};
	}

	const results = parseSuite(root, report);

	return results;
};

// ### Suite ###

export const parseSuite = (
	suite: P.JSONReportSuite,
	report: P.JSONReport,
): neotest.Results => {
	const results: neotest.Results = {};

	const specs = flattenSpecs(suite);

	// Parse specs
	for (const spec of specs) {
		let key: string;
		if (options.enable_dynamic_test_discovery) {
			key = spec.id;
		} else {
			key = constructSpecKey(report, spec, suite);
		}

		results[key] = parseSpec(spec);
	}

	return results;
};

export const flattenSpecs = (suite: P.JSONReportSuite) => {
	let specs = suite.specs.map((spec) => ({ ...spec, suiteTitle: suite.title }));

	for (const nestedSuite of suite.suites ?? []) {
		specs = specs.concat(flattenSpecs(nestedSuite));
	}

	return specs;
};

// ### Spec ###

export const parseSpec = (
	spec: P.JSONReportSpec,
): Omit<neotest.Result, 'output'> => {
	const status = getSpecStatus(spec);
	const errors = collectSpecErrors(spec).map((s) => toNeotestError(s));

	const data = {
		status,
		short: `${spec.title}: ${status}`,
		errors,
	};

	return data;
};

const getSpecStatus = (spec: P.JSONReportSpec): neotest.Result['status'] => {
	if (!spec.ok) {
		return 'failed';
	} else if (spec.tests[0]?.status === 'skipped') {
		return 'skipped';
	} else {
		return 'passed';
	}
};

// FIX: fix identification issue. `neotest.lib.treesitter.parse_positions`
// has `position_id` parameter we might be able to use.
const constructSpecKey = (
	report: P.JSONReport,
	spec: P.JSONReportSpec,
	suite: P.JSONReportSuite,
): neotest.ResultKey => {
	const dir = report.config.rootDir;
	const file = spec.file;
	const name = spec.title;
	const suiteName = suite.title;
	const isPartOfDescribe = suiteName !== file;

	let key: string;

	if (isPartOfDescribe) {
		key = `${dir}/${file}::${suiteName}::${name}`;
	} else {
		key = `${dir}/${file}::${name}`;
	}

	return key;
};

/** Collect all errors from a spec by traversing spec -> tests[] -> results[].
 * Return a single flat array containing any errors. */
const collectSpecErrors = (spec: P.JSONReportSpec): P.JSONReportError[] => {
	const errors: P.JSONReportError[] = [];

	for (const test of spec.tests) {
		for (const result of test.results) {
			errors.push(...result.errors);
		}
	}

	return errors;
};

/** Convert Playwright error to neotest error */
const toNeotestError = (error: P.JSONReportError): neotest.Error => {
	const line = error.location?.line;
	return {
		message: cleanAnsi(error.message),
		line: line ? line - 1 : 0,
	};
};
