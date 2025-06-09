export const permissionsConfig = [
	{
		"action": "plugin::content-manager.explorer.create",
		"subject": "api::benefit.benefit",
		"conditions": [],
		"properties": {}
	},
	{
		"action": "plugin::content-manager.explorer.read",
		"subject": "api::benefit.benefit",
		"conditions": ["admin::has-same-role-as-creator", "admin::is-creator"],
		"properties": {}
	},
	{
		"action": "plugin::content-manager.explorer.update",
		"subject": "api::benefit.benefit",
		"conditions": [],
		"properties": {}
	},
	{
		"action": "plugin::content-manager.explorer.publish",
		"subject": "api::benefit.benefit",
		"conditions": [],
		"properties": {
			"locales": ["en"]
		}
	}
]

