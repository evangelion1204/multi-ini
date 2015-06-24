fs = require 'fs'
_  = require 'lodash'

Parser = require './parser'


class Serializer
    constructor: (options = {}) ->
        @options = options


class MultiIni
    default:
        encoding: 'utf8'
        ignore_invalid: true
        keep_quotes: false
        oninvalid: () ->
            return true

        filters: []

    constructor: (options = {}) ->
        @options = _.extend(_.clone(@default), options)

        @parser = new Parser(@options)


    fetchLines: (filename) ->
        content = fs.readFileSync(filename, @options)
        return content.split '\n'

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

                    serialized += path + (if path.length > 0 then '.' else '') + key + "[]=" + value + "\n"
            else if _.isObject(subContent)
                serialized += @serializeContent(subContent, path + (if path.length > 0 then '.' else '') + key)
            else
                subContent = "\"" + subContent + "\"" if @needToBeQuoted(subContent)
                serialized += path + (if path.length>0 then '.' else '') + key + "=" + subContent + "\n"

        return serialized

    serialize: (data) ->
        out = ""
        for section, sectionContent of data
            out += "[" + section + "]\n"
            out += @serializeContent(sectionContent, '')

        return out

    read: (filename = {}) ->
        lines = @fetchLines(filename)

        return @parser.parse(lines)

    write: (filename, content = {}) ->
        fs.writeFileSync(filename, @serialize(content), @options)


module.exports =
    Class: MultiIni

    filters:
        lowercase: (value) ->
            return if _.isString(value) then value.toLowerCase() else value

        uppercase: (value) ->
            return if _.isString(value) then value.toUpperCase() else value

        trim: (value) ->
            return if _.isString(value) then value.trim() else value

    read: (filename, options = {}) ->
        instance = new MultiIni(options)
        return instance.read(filename)

    write: (filename, content, options = {}) ->
        instance = new MultiIni(options)
        return instance.write(filename, content)
