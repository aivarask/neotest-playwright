--[[ Generated with https://github.com/TypeScriptToLua/TypeScriptToLua ]]
-- Lua Library inline imports
local function __TS__ObjectAssign(target, ...)
    local sources = {...}
    for i = 1, #sources do
        local source = sources[i]
        for key in pairs(source) do
            target[key] = source[key]
        end
    end
    return target
end

local function __TS__ArrayFilter(self, callbackfn, thisArg)
    local result = {}
    local len = 0
    for i = 1, #self do
        if callbackfn(thisArg, self[i], i - 1, self) then
            len = len + 1
            result[len] = self[i]
        end
    end
    return result
end

local function __TS__ArrayIsArray(value)
    return type(value) == "table" and (value[1] ~= nil or next(value) == nil)
end

local function __TS__ArrayConcat(self, ...)
    local items = {...}
    local result = {}
    local len = 0
    for i = 1, #self do
        len = len + 1
        result[len] = self[i]
    end
    for i = 1, #items do
        local item = items[i]
        if __TS__ArrayIsArray(item) then
            for j = 1, #item do
                len = len + 1
                result[len] = item[j]
            end
        else
            len = len + 1
            result[len] = item
        end
    end
    return result
end
-- End of Lua Library inline imports
local ____exports = {}
local getExtraArgs
local ____build_2Dcommand = require('neotest-playwright.build-command')
local buildCommand = ____build_2Dcommand.buildCommand
local async = require("neotest.async")
local logger = require("neotest.logging")
local ____adapter_2Doptions = require('neotest-playwright.adapter-options')
local options = ____adapter_2Doptions.options
local ____preset_2Doptions = require('neotest-playwright.preset-options')
local COMMAND_PRESETS = ____preset_2Doptions.COMMAND_PRESETS
____exports.buildSpec = function(args)
    if not args then
        logger.error("No args")
        return
    end
    if not args.tree then
        logger.error("No args.tree")
        return
    end
    local pos = args.tree:data()
    local testFilter = (pos.type == "test" or pos.type == "namespace") and (pos.path .. ":") .. tostring(pos.range[1] + 1) or pos.path
    local commandOptions = __TS__ObjectAssign(
        {},
        COMMAND_PRESETS[options.preset],
        {
            bin = options.get_playwright_command(pos.path),
            config = options.get_playwright_config(pos.path),
            projects = options.projects,
            testFilter = testFilter
        }
    )
    local resultsPath = async.fn.tempname() .. ".json"
    local extraArgs = getExtraArgs(args.extra_args, options.extra_args)
    local ____buildCommand_result_1 = buildCommand(commandOptions, extraArgs)
    local ____temp_0
    if type(options.get_cwd) == "function" then
        ____temp_0 = options.get_cwd(pos.path)
    else
        ____temp_0 = nil
    end
    return {
        command = ____buildCommand_result_1,
        cwd = ____temp_0,
        context = {results_path = resultsPath, file = pos.path},
        env = __TS__ObjectAssign({PLAYWRIGHT_JSON_OUTPUT_NAME = resultsPath}, options.env)
    }
end
getExtraArgs = function(...)
    local args = {...}
    local extraArgs = __TS__ArrayFilter(
        args,
        function(____, arg) return arg ~= nil end
    )
    return __TS__ArrayConcat(
        {},
        unpack(extraArgs)
    )
end
return ____exports
