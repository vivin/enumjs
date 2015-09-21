module.exports = function (grunt) {

    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-bg-shell');
    grunt.loadNpmTasks('grunt-qunit-istanbul');
    grunt.loadNpmTasks('grunt-coveralls');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        requirejs: {
            compile: {
                options: {
                    baseUrl: "src",
                    name: "enum",
                    uglify: {
                        except: ["__"]
                    },
                    out: "dist/enum.min.js"
                }
            },
            test: {
                 options: {
                    baseUrl: "src",
                    name: "enum",
                    out: "dist/enum.js",
                    optimize: "none"
                 }
            }
        },

        qunit: {
            options: {
                '--web-security': 'no',
                coverage: {
                    src: ['dist/enum.js'],
                    instrumentedFiles: 'temp/',
                    htmlReport: 'dist/report/coverage',
                    lcovReport: 'dist/report/lcov',
                    coberturaReport: 'dist/report/',
                    linesThresholdPct: 85
                }
            },
            all: ['src/test/test-enumjs.html']
        },

        qunit_junit: {
            options: {
                dest: 'dist/test-reports'
            }
        },

        coveralls: {
            options: {
                force: false
            },
            main_target: {
                src: 'dist/report/lcov/lcov.info'
            }
        }
    });

    grunt.registerTask('build', ['requirejs:compile', 'requirejs:test']);
    grunt.registerTask('test', ['requirejs:test', 'qunit_junit', 'qunit']);
    grunt.registerTask('travis', ['test']);
};
