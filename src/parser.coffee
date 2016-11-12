class Parser
    regExpSection: /^\s*\[(.*?)\]\s*$/
    regExpComment: /^;.*/
    regExpSingleLine: /^\s*(.*?)\s*?=\s*?(\S.*?)$/
    regExpMultiLine: /^\s*(.*?)\s*?=\s*?"(.*?)$/
    regExpNotEscapedMultiLineEnd: /^(.*?)\\"$/
    regExpMultiLineEnd: /^(.*?)"$/
    regExpArray: /^(.*?)\[\]$/

    STATUS_OK: 0
    STATUS_INVALID: 1


    constructor: (options = {}) ->
        @options = options

        @handlers = [
            @handleMultiLineStart,
            @handleMultiLineEnd,
            @handleMultiLineAppend,
            @handleComment,
            @handleSection,
            @handleSingleLine
        ]

    parse: (lines) ->
        ctx =
            ini: {}
            current: {}
            multiLineKeys: false
            multiLineValue: ''

        for line in lines
            for handler in @handlers
                stop = handler.call(this, ctx, line)

                break if stop

        return ctx.ini

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
            value = filter(value, @options)

        return value

    getKeyValue: (line) ->
        result = line.match @regExpSingleLine

        throw new Error() unless result

        unless @options.keep_quotes
            result[2] = result[2].replace /^\s*?"(.*?)"\s*?$/, "$1"

        return [result[1], result[2], @STATUS_OK]

    getMultiKeyValue: (line) ->
        result = line.match(@regExpMultiLine)

        throw new Error() unless result

        result[2] = '"' + result[2] if @options.keep_quotes

        return [result[1], result[2]]

    getMultiLineEndValue: (line) ->
        result = line.match @regExpMultiLineEnd

        throw new Error() unless result

        result[1] = result[1] + '"' if @options.keep_quotes

        return [result[1], @STATUS_OK ]

    getArrayKey: (line) ->
        result = line.match @regExpArray
        return result[1]

    handleMultiLineStart: (ctx, line) ->
        return false unless @isMultiLine(line.trim())

        [key, value] = @getMultiKeyValue(line)
        keys = key.split('.')

        ctx.multiLineKeys = keys
        ctx.multiLineValue = value

        return true

    handleMultiLineEnd: (ctx, line) ->
        return false if not ctx.multiLineKeys or not @isMultiLineEnd(line.trim())

        [value, status] = @getMultiLineEndValue(line)

        # abort on false of onerror callback if we meet an invalid line
        return if status == @STATUS_INVALID and not @options.oninvalid(line)

        # ignore whole multiline on invalid
        if (status == @STATUS_INVALID and @options.ignore_invalid)
            ctx.multiLineKeys = false
            ctx.multiLineValue = ""

            return true

        ctx.multiLineValue += '\n' + value

        @assignValue(ctx.current, ctx.multiLineKeys, ctx.multiLineValue)

        ctx.multiLineKeys = false
        ctx.multiLineValue = ""

        return true

    handleMultiLineAppend: (ctx, line) ->
        return false if not ctx.multiLineKeys or @isMultiLineEnd(line.trim())

        ctx.multiLineValue += '\n' + line
        return true

    handleComment: (ctx, line) ->
        return @isComment(line.trim())

    handleSection: (ctx, line) ->
        line = line.trim()
        return false unless @isSection(line)
        section = @getSection(line)

        if typeof ctx.ini[section] == 'undefined'
            ctx.ini[section] = {}

        ctx.current = ctx.ini[section]

        return true

    handleSingleLine: (ctx, line) ->
        line = line.trim()
        return false unless @isSingleLine(line)

        [key, value, status] = @getKeyValue(line)

        # abort on false of onerror callback if we meet an invalid line
        throw new Error('Abort') if status == @STATUS_INVALID and not @options.oninvalid(line)

        # skip entry
        return true if status == @STATUS_INVALID and not @options.ignore_invalid

        keys = key.split('.')
        @assignValue(ctx.current, keys, value)

        return true

module.exports = Parser
