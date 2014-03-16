fs = require 'fs'
_  = require 'lodash'

class MultiIni
    regExpSection: /^\s*\[(.*?)\]\s*$/
    regExpComment: /^;.*/
    regExpSimpleSingleLine: /^\s*(.*?)\s*?=\s*?([^"].*?)$/
    regExpQuotedSingleLine: /^\s*(.*?)\s*?=\s*?"(.*?)"$/
    regExpMultiLine: /^\s*(.*?)\s*?=\s*?"(.*?)$/
    regExpMultiLineEnd: /^(.*?)"$/
    regExpArray: /^(.*?)\[\]$/

    isSection: (line) ->
        line.match @regExpSection

    getSection: (line) ->
        line.match(@regExpSection)[1]

    isComment: (line) ->
        line.match @regExpComment

    isSingleLine: (line) ->
        line.match(@regExpQuotedSingleLine) or line.match(@regExpSimpleSingleLine)

    isMultiLine: (line) ->
        line.match @regExpMultiLine

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

    getKeyValue: (line) ->
        result = line.match @regExpQuotedSingleLine
        return [result[1], result[2]] if result

        result = line.match @regExpSimpleSingleLine
        return [result[1], result[2]] if result

        throw new Error()

    getMultiKeyValue: (line) ->
        result = line.match(@regExpMultiLine)
        return [result[1], result[2]] if result

    getMultiLineEndValue: (line) ->
        result = line.match @regExpMultiLineEnd
        return result[1] if result

    getArrayKey: (line) ->
        result = line.match @regExpArray
        return result[1]

    fetchLines: (filename) ->
        content = fs.readFileSync(filename, {encoding: 'utf8'})
        return content.split '\n'

    serializeContent: (content, path) ->
        serialized = ''
        console.log path
        for key, subContent of content
            if _.isArray(subContent)
                for value in subContent
                    serialized += path + (if path.length > 0 then '.' else '') + key + "[]=\"" + value + "\"\n"
            else if _.isObject(subContent)
                serialized += @serializeContent(subContent, path + (if path.length > 0 then '.' else '') + key)
            else
                serialized += path + (if path.length>0 then '.' else '') + key + "=\"" + subContent + "\"\n"

        console.log serialized
        return serialized

    serialize: (data) ->
        out = ""
        for section, sectionContent of data
            out += "[" + section + "]\n"
            out += @serializeContent(sectionContent, '')

        return out

    read: (filename) ->
        lines = @fetchLines(filename)
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
                [key, value] = @getKeyValue(line)
                keys = key.split('.')
                @assignValue(current, keys, value)

            else if @isMultiLine(line)
                [key, value] = @getMultiKeyValue(line)
                keys = key.split('.')

                multiLineKeys = keys
                multiLineValue = value

            else if multiLineKeys
                if @isMultiLineEnd(line)
                    multiLineValue += '\n' + @getMultiLineEndValue(line)
                    @assignValue(current, multiLineKeys, multiLineValue)

                    multiLineKeys = false
                    multiLineValue = ""

                else
                    multiLineValue += '\n' + line

        return ini

    write: (filename, content) ->
        fs.writeFileSync(filename, @serialize(content), {encoding: 'utf8'})

module.exports = new MultiIni