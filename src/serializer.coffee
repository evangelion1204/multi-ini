_ = require 'lodash'
constants = require './constants'

class Serializer
    line_breaks:
        unix: '\n'
        windows: '\r\n'

    constructor: (options = {}) ->
        @options = options

    needToBeQuoted: (value) ->
        return false if value.match /^"[\s\S]*?"$/g
        return true if value.match /^[\s\S]*?\\"$/g
        return false if value.match /^[\s\S]*?"$/g
        return false if value.match /^"[\s\S]*?$/g

        return true

    serializeContent: (content, path) ->
        serialized = ''
        for key, subContent of content
            if _.isArray(subContent)
                for value in subContent
                    value = "\"" + value + "\"" if @needToBeQuoted(value)

                    serialized += path + (if path.length > 0 then '.' else '') + key + "[]=" + value + constants.line_breaks[@options.line_breaks]
            else if _.isObject(subContent)
                serialized += @serializeContent(subContent, path + (if path.length > 0 then '.' else '') + key)
            else
                subContent = "\"" + subContent + "\"" if @needToBeQuoted(subContent)
                serialized += path + (if path.length>0 then '.' else '') + key + "=" + subContent + constants.line_breaks[@options.line_breaks]

        return serialized

module.exports = Serializer