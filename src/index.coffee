_  = require 'lodash'

MultiIni = require './multi-ini-class'

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
