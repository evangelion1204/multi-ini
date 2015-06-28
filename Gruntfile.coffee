module.exports = (grunt) ->
    fs = require 'fs'


    grunt.initConfig
        clean:
            build: []
            test: ['test/out/*.ini']

        coffee:
            options:
                bare: true

            build:
                expand: true
#                flatten: true
                cwd: 'src'
                src: ['**/*.coffee']
                dest: 'lib'
                ext: '.js'

        coveralls:
            options:
                force: false
            tests:
                src: 'coverage/*.info',

        jasmine_node:
            tests:
                match: '.',
                matchall: false,
                extensions: 'js',
                specNameMatcher: 'spec',
                projectRoot: ".",
                requirejs: false,
                forceExit: true,
                captureExceptions: true,
                specFolders: ['tests'],
                src: ['lib/*.js']
                junitreport:
                    report: false,
                    savePath : "./build/reports/jasmine/",
                    useDotNotation: true,
                    consolidate: true



    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-coveralls')
    grunt.loadNpmTasks('grunt-jasmine-node-coverage');



    grunt.registerTask('prepare-test', () ->
#        fs.mkdirSync 'test/out'
    )

    grunt.registerTask('default', ['clean:build', 'coffee:build'])
    grunt.registerTask('test', ['clean:test', 'coffee:build', 'prepare-test', 'jasmine_node', 'coveralls'])
