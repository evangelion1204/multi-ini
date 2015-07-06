fs = require 'fs'
_  = require 'lodash'

Parser = require './parser'
Serializer = require './serializer'

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
        @serializer = new Serializer(@options)

    read: (filename) ->
        throw new Error('Missing filename.') unless filename

        lines = @fetchLines(filename)

        return @parser.parse(lines)

    fetchLines: (filename) ->
        content = fs.readFileSync(filename, @options)
        return content.split '\n'

    write: (filename, content = {}) ->
        fs.writeFileSync(filename, @serialize(content), @options)

    serialize: (data) ->
        out = ""
        for section, sectionContent of data
            out += "[" + section + "]\n"
            out += @serializer.serializeContent(sectionContent, '')

        return out

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
