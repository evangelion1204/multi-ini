fs = require 'fs'
_  = require 'lodash'

class MultiIni
    options:
        encoding: 'utf8'
        ignore_invalid: true
        keep_quotes: false
        oninvalid: () ->
            return true

    regExpSection: /^\s*\[(.*?)\]\s*$/
    regExpComment: /^;.*/
    regExpSingleLine: /^\s*(.*?)\s*?=\s*?(.*?)$/
#    regExpSimpleSingleLine: /^\s*(.*?)\s*?=\s*?([^"].*?)$/
#    regExpQuotedSingleLine: /^\s*(.*?)\s*?=\s*?"(.*?)"(.*?)$/
    regExpMultiLine: /^\s*(.*?)\s*?=\s*?"(.*?)$/
    regExpMultiLineEnd: /^(.*?)"$/
    regExpArray: /^(.*?)\[\]$/

    STATUS_OK: 0
    STATUS_INVALID: 1

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
        line.match @regExpMultiLineEnd

    isArray: (line) ->
        line.match @regExpArray

    assignValue: (element, keys, value) ->
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

    getKeyValue: (line, options) ->
        result = line.match @regExpSingleLine

        unless options.keep_quotes
            result[2] = result[2].replace /^\s*?"(.*?)"\s*?$/, "$1"

        return [result[1], result[2], @STATUS_OK] if result

        throw new Error()

    getMultiKeyValue: (line, options) ->
        result = line.match(@regExpMultiLine)

        result[2] = '"' + result[2] if options.keep_quotes

        return [result[1], result[2]] if result

    getMultiLineEndValue: (line, options) ->
        result = line.match @regExpMultiLineEnd

        result[1] = result[1] + '"' if options.keep_quotes

        return [result[1], @STATUS_OK ] if result

    getArrayKey: (line) ->
        result = line.match @regExpArray
        return result[1]

    fetchLines: (filename, options) ->
        content = fs.readFileSync(filename, options)
        return content.split '\n'

    needToBeQuoted: (value) ->
        return false if value.match /^"[\s\S]*?"$/g
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

    read: (filename, options = {}) ->
        options = _.extend(_.clone(@options), options)

        lines = @fetchLines(filename, options)
        ini = {}
        current = ini
        multiLineKeys = false
        multiLineValue = ''

        for line in lines
            line = line.trim()

            if @isComment(line)
            else if @isSection(line)
                section = @getSection(line)

                if typeof ini[section] == 'undefined'
                    ini[section] = {}

                current = ini[section];

            else if @isSingleLine(line)
                [key, value, status] = @getKeyValue(line, options)

                # abort on false of onerror callback if we meet an invalid line
                return if status == @STATUS_INVALID and not options.oninvalid(line)

                # skip entry
                if status == @STATUS_INVALID and options.ignore_invalid
                    continue

                keys = key.split('.')
                @assignValue(current, keys, value)

            else if @isMultiLine(line)
                [key, value] = @getMultiKeyValue(line, options)
                keys = key.split('.')

                multiLineKeys = keys
                multiLineValue = value

            else if multiLineKeys
                if @isMultiLineEnd(line)
                    [value, status] = @getMultiLineEndValue(line, options)

                    # abort on false of onerror callback if we meet an invalid line
                    return if status == @STATUS_INVALID and not options.oninvalid(line)

                    # ignore whole multiline on invalid
                    if (status == @STATUS_INVALID and options.ignore_invalid)
                        multiLineKeys = false
                        multiLineValue = ""

                        continue

                    multiLineValue += '\n' + value

                    @assignValue(current, multiLineKeys, multiLineValue)

                    multiLineKeys = false
                    multiLineValue = ""

                else
                    multiLineValue += '\n' + line

        return ini

    write: (filename, content, options = {}) ->
        options = _.extend(_.clone(@options), options)

        fs.writeFileSync(filename, @serialize(content), options)

module.exports = new MultiIni