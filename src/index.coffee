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

        constants: (value, options) ->
            return value unless _.isString(value) or _.isEmpty(options.constants)

            _.forIn options.constants, (replacement, constant) ->
              matcher = new RegExp("\" #{constant} \"", 'g')
              value = value.replace(matcher, "#{replacement}")

              matcher = new RegExp("\" #{constant}$", 'g')
              value = value.replace(matcher, "#{replacement}\"")

              matcher = new RegExp("^#{constant} \"", 'g')
              value = value.replace(matcher, "\"#{replacement}")

            return value

    read: (filename, options = {}) ->
        instance = new MultiIni(options)
        return instance.read(filename)

    write: (filename, content, options = {}) ->
        instance = new MultiIni(options)
        return instance.write(filename, content)
