fs = require 'fs'
_  = require 'lodash'

Parser = require './parser'
Serializer = require './serializer'
Constants = require './constants'

class MultiIni
    default:
        encoding: 'utf8'
        ignore_invalid: true
        keep_quotes: false
        oninvalid: () ->
            return true

        filters: []
        line_breaks: 'unix'

    constructor: (options = {}) ->
        @options = _.extend(_.clone(@default), options)

        @parser = new Parser(@options)
        @serializer = new Serializer(@options)

    read: (filename) ->
        throw new Error('Missing filename.') unless filename

        lines = @fetchLines(filename)

        return @parser.parse(lines)

    fetchLines: (filename) ->
        content = fs.readFileSync(filename, @options)
        return content.split Constants.line_breaks[@options.line_breaks]

    write: (filename, content = {}) ->
        fs.writeFileSync(filename, @serializer.serialize(content), @options)
        return

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
