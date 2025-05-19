// @ts-check
import eslint from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';
const importPlugin = require('eslint-plugin-import');
const pluginSecurity = require('eslint-plugin-security');
const decoratorPosition = require('eslint-plugin-decorator-position');

export default tseslint.config(
	{
		ignores: [
			'eslint.config.mjs',
			'node_modules',
			'**/node_modules/**',
			'**/*.js',
			'**/*.d.ts',
		],
	},
	...(importPlugin.flatConfigs?.recommended
		? [importPlugin.flatConfigs.recommended]
		: []),
	...decoratorPosition.configs.recommended,
	...tseslint.configs.recommendedTypeChecked,
	eslint.configs.recommended,
	eslintPluginPrettierRecommended,
	jsdoc.configs['flat/recommended'],
	pluginSecurity.configs.recommended,
	sonarjs.configs.recommended,
	{
		languageOptions: {
			globals: {
				...globals.node,
				...globals.jest,
			},
			ecmaVersion: 5,
			sourceType: 'module',
			parserOptions: {
				project: ['tsconfig.json', 'tsconfig.spec.json'],
				projectService: true,
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	{
		plugins: {},
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
			'@typescript-eslint/no-floating-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'warn',
			'decorator-position/decorator-position': ['error', { printWidth: 120 }],
			'eol-last': ['error', 'always'],
			'import/order': 'warn',
			indent: ['error', 'tab'],
			'jsdoc/require-jsdoc': 'off',
			'linebreak-style': ['error', 'unix'],
			'no-trailing-spaces': 'error',
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					endOfLine: 'lf',
					trailingComma: 'all',
				},
			],
			'security/detect-object-injection': 'warn',
			'sonarjs/no-duplicate-string': 'warn',
		},
	},
);
