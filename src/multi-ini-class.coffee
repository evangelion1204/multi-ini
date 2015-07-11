fs = require 'fs'
_  = require 'lodash'

class MultiIni
    default:
        encoding: 'utf8'
        ignore_invalid: true
        keep_quotes: false
        oninvalid: () ->
            return true

        filters: []
        line_breaks: 'unix'

    regExpSection: /^\s*\[(.*?)\]\s*$/
    regExpComment: /^;.*/
    regExpSingleLine: /^\s*(.*?)\s*?=\s*?(\S.*?)$/
#    regExpSimpleSingleLine: /^\s*(.*?)\s*?=\s*?([^"].*?)$/
#    regExpQuotedSingleLine: /^\s*(.*?)\s*?=\s*?"(.*?)"(.*?)$/
    regExpMultiLine: /^\s*(.*?)\s*?=\s*?"(.*?)$/
    regExpNotEscapedMultiLineEnd: /^(.*?)\\"$/
    regExpMultiLineEnd: /^(.*?)"$/
    regExpArray: /^(.*?)\[\]$/

    line_breaks:
        unix: '\n'
        windows: '\r\n'

    STATUS_OK: 0
    STATUS_INVALID: 1

    constructor: (options = {}) ->
        @options = _.extend(_.clone(@default), options)

    isSection: (line) ->
        line.match @regExpSection

    getSection: (line) ->
        line.match(@regExpSection)[1]

    isComment: (line) ->
        line.match @regExpComment

    isSingleLine: (line) ->
        result = line.match(@regExpSingleLine)

        return false unless result

        check = result[2].match(/"/g)

        return not check or (check.length % 2 == 0)

    isMultiLine: (line) ->
        result = line.match @regExpMultiLine

        return false unless result

        check = result[2].match(/"/g)

        return not check or (check.length % 2 == 0)

    isMultiLineEnd: (line) ->
        line.match(@regExpMultiLineEnd) and not line.match(@regExpNotEscapedMultiLineEnd)

    isArray: (line) ->
        line.match @regExpArray

    assignValue: (element, keys, value) ->
        value = @applyFilter value

        current = element
        previous = element
        array = false

        for key in keys
            if @isArray(key)
                key = @getArrayKey key
                array = true

            unless current[key]?
                current[key] = if array then [] else {}

            previous = current
            current = current[key]

        if (array)
            current.push(value)
        else
            previous[key] = value

        return element

    applyFilter: (value) ->
        for filter in @options.filters
            value = filter(value)

        return value

    getKeyValue: (line) ->
        result = line.match @regExpSingleLine

        unless @options.keep_quotes
            result[2] = result[2].replace /^\s*?"(.*?)"\s*?$/, "$1"

        return [result[1], result[2], @STATUS_OK] if result

        throw new Error()

    getMultiKeyValue: (line) ->
        result = line.match(@regExpMultiLine)

        result[2] = '"' + result[2] if @options.keep_quotes

        return [result[1], result[2]] if result

    getMultiLineEndValue: (line) ->
        result = line.match @regExpMultiLineEnd

        result[1] = result[1] + '"' if @options.keep_quotes

        return [result[1], @STATUS_OK ] if result

    getArrayKey: (line) ->
        result = line.match @regExpArray
        return result[1]

    fetchLines: (filename) ->
        content = fs.readFileSync(filename, @options)
        return content.split @line_breaks[@options.line_breaks]

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

                    serialized += path + (if path.length > 0 then '.' else '') + key + "[]=" + value + @line_breaks[@options.line_breaks]
            else if _.isObject(subContent)
                serialized += @serializeContent(subContent, path + (if path.length > 0 then '.' else '') + key)
            else
                subContent = "\"" + subContent + "\"" if @needToBeQuoted(subContent)
                serialized += path + (if path.length>0 then '.' else '') + key + "=" + subContent + @line_breaks[@options.line_breaks]

        return serialized

    serialize: (data) ->
        out = ""
        for section, sectionContent of data
            out += "[" + section + "]" + @line_breaks[@options.line_breaks]
            out += @serializeContent(sectionContent, '')

        return out

    read: (filename = {}) ->
        lines = @fetchLines(filename)
        ini = {}
        current = ini
        multiLineKeys = false
        multiLineValue = ''

        for line in lines
            trimmedLine = line.trim()

            if @isMultiLine(trimmedLine)
                [key, value] = @getMultiKeyValue(line)
                keys = key.split('.')

                multiLineKeys = keys
                multiLineValue = value

            else if multiLineKeys
                if @isMultiLineEnd(trimmedLine)
                    [value, status] = @getMultiLineEndValue(line)

                    # abort on false of onerror callback if we meet an invalid line
                    return if status == @STATUS_INVALID and not @options.oninvalid(line)

                    # ignore whole multiline on invalid
                    if (status == @STATUS_INVALID and @options.ignore_invalid)
                        multiLineKeys = false
                        multiLineValue = ""

                        continue

                    multiLineValue += '\n' + value

                    @assignValue(current, multiLineKeys, multiLineValue)

                    multiLineKeys = false
                    multiLineValue = ""

                else
                    multiLineValue += '\n' + line

            else if @isComment(trimmedLine)
            else if @isSection(trimmedLine)
                section = @getSection(trimmedLine)

                if typeof ini[section] == 'undefined'
                  ini[section] = {}

                current = ini[section]

            else if @isSingleLine(trimmedLine)
                [key, value, status] = @getKeyValue(trimmedLine)

                # abort on false of onerror callback if we meet an invalid line
                return if status == @STATUS_INVALID and not @options.oninvalid(trimmedLine)

                # skip entry
                if status == @STATUS_INVALID and @options.ignore_invalid
                  continue

                keys = key.split('.')
                @assignValue(current, keys, value)

        return ini

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
