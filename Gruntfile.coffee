module.exports = (grunt) ->
    grunt.initConfig
        clean:
            build: ['test/*.coffee']

        coffee:
            options:
                expand: true

            build:
                src: ['**/*.coffee']

        jasmine_node:
            match: '.',
            matchall: false,
            extensions: 'js',
            specNameMatcher: 'spec',
            projectRoot: ".",
            requirejs: false,
            forceExit: true,
            jUnit:
                report: false,
                savePath : "./build/reports/jasmine/",
                useDotNotation: true,
                consolidate: true

    grunt.loadNpmTasks('grunt-contrib-coffee')
    grunt.loadNpmTasks('grunt-contrib-clean')
    grunt.loadNpmTasks('grunt-jasmine-node')

    grunt.registerTask('default', ['clean:build', 'coffee:build']);
    grunt.registerTask('test', ['clean:build', 'coffee:build']);
