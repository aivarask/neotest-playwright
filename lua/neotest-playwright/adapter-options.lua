--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
local ____exports = {}
local ____finders = require('neotest-playwright.finders')
local getCwd = ____finders.getCwd
local getPlaywrightBinary = ____finders.getPlaywrightBinary
local getPlaywrightConfig = ____finders.getPlaywrightConfig
____exports.options = {
    projects = {},
    preset = "none",
    persist_project_selection = false,
    get_playwright_command = getPlaywrightBinary,
    get_playwright_config = getPlaywrightConfig,
    get_cwd = getCwd,
    env = {},
    extra_args = {}
}
return ____exports
