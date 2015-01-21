;(function () {
    'use strict';

    module.exports = function (grunt) {
        require('load-grunt-tasks')(grunt, {
            pattern: ['grunt-*', '!grunt-template-jasmine-istanbul']
        });
        require('time-grunt')(grunt);

        // Project configuration.
        grunt.initConfig({

            // Metadata.
            pkg: grunt.file.readJSON("package.json"),
            banner: '/* ' +
                '<%= pkg.title || pkg.name %> - <%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %> - ' +
                'Copyright (c) <%= grunt.template.today("yyyy") %> Informatik der Arbeitslosenversicherung; */\n',

            // Task configurations.
            clean: {
                all: ['dist', 'build'],
                dist: ['dist'],
                build: ['build'],
                src: ['src/lib']
            },
            copy: {
                material: {
                    files: [
                        {
                            expand: true,
                            cwd: 'lib/alv-ch-ng/dist/',
                            src: ['**/*'],
                            dest: 'src/lib/alv-ch-ng/'
                        },
                        {
                            expand: true,
                            cwd: 'lib/bootstrap/',
                            src: 'fonts/*',
                            dest: 'src/lib/bootstrap/'
                        },
                        {
                            expand: true,
                            cwd: 'lib/bootstrap-select/dist/',
                            src: '**/*',
                            dest: 'src/lib'
                        },
                        {
                            expand: true,
                            cwd: 'lib/bootstrapaccessibilityplugin/plugins/css/',
                            src: '**/bootstrap-accessibility.css',
                            dest: 'src/lib'
                        }
                    ]
                }
            },
            uglify: {
                options: {
                    banner: '<%= banner %>'
                },
                demo: {
                    options: {
                        'mangle': false
                    },
                    files: {
                        'src/lib/lib.min.js': [
                            'lib/jquery/dist/jquery.js',
                            'lib/jquery-ui/jquery-ui.js',
                            'lib/jqueryui-touch-punch/jquery.ui.touch-punch.js',
                            'lib/bootstrap/dist/js/bootstrap.js',
                            'lib/bootstrap-select/dist/js/bootstrap-select.js',
                            'lib/bootstrapaccessibilityplugin/plugins/js/bootstrap-accessibility.js',
                            'lib/angular/angular.js',
                            'lib/angular-http-auth/src/http-auth-interceptor.js',
                            'lib/angular-resource/angular-resource.js',
                            'lib/angular-translate/angular-translate.js',
                            'lib/angular-translate-storage-cookie/angular-translate-storage-cookie.js',
                            'lib/angular-translate-storage-local/angular-translate-storage-local.js',
                            'lib/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
                            'lib/angular-dialog-service/dist/dialogs.min.js',
                            'lib/angular-dragdrop/src/angular-dragdrop.js',
                            'lib/angular-touch/angular-touch.js',
                            'lib/ng-lodash/build/ng-lodash.js',
                            'lib/autofill-event/src/autofill-event.js',
                            'lib/angular-cookies/angular-cookies.js',
                            'lib/angular-route/angular-route.js',
                            'lib/angular-sanitize/angular-sanitize.js',
                            'lib/angular-scroll/angular-scroll.js',
                            'lib/angular-ui-bootstrap/src/bindHtml/bindHtml.js',
                            'lib/angular-ui-bootstrap/src/position/position.js',
                            'lib/angular-ui-bootstrap/src/tabs/tabs.js',
                            'lib/angular-ui-bootstrap/src/tooltip/tooltip.js',
                            'lib/angular-ui-bootstrap/src/typeahead/typeahead.js',
                            'lib/angular-ui-bootstrap/src/modal/modal.js',
                            'lib/angular-ui-bootstrap/src/transition/transition.js'
                        ]
                    }
                }
            },
            jshint: {
                gruntfile: {
                    options: {
                        jshintrc: '.jshintrc'
                    },
                    src: 'Gruntfile.js'
                },
                src: {
                    options: {
                        jshintrc: '.jshintrc'
                    },
                    src: ['src/scripts/**/*.js']
                }
            },
            less: {
                src: {
                    options: {
                        paths: ['src/less/'],
                        compress: false,
                        cleancss: true,
                        ieCompat: true
                    },
                    files: {
                        'src/styles/mtg-app.css': ['src/less/mtg-app.less']
                    }
                }
            },
            lesslint: {
                options: {
                    csslint: {
                        csslintrc: '.csslintrc'
                    },
                    imports: ['src/less/**/*.less']
                },
                src: ['src/less/mtg-styles.less']
            },
            htmlhint: {
                options: {
                    htmlhintrc: '.htmlhintrc'
                },
                src: {
                    src: ['src/**/*.html','!src/lib/**/*']
                }
            },
            watch: {
                templates: {
                    files: 'src/**/*.html',
                    tasks: ['htmlhint']
                },
                lessFiles: {
                    files: 'src/less/**/*.less',
                    tasks: ['less:src']
                },
                jshint: {
                    files: ['src/scripts/**/*.js','!src/lib/**/*.js'],
                    tasks: ['jshint-test']
                }
            },
            express: {
                options: {
                    port: process.env.PORT || 9000
                },
                dev: {
                    options: {
                        script: 'server.js'
                    }
                },
                prod: {
                    options: {
                        script: 'server.js',
                        node_env: 'production'
                    }
                }
            },
            open: {
                server: {
                    url: 'http://localhost:<%= express.options.port %>'
                }
            },
            browserSync: {
                dev: {
                    bsFiles: {
                        src : 'src/**/*'
                    },
                    options: {
                        watchTask: true
                    }
                }
            }
        });

        // Tests
        grunt.registerTask('unit-test', ['jasmine']);
        grunt.registerTask('jshint-test', ['jshint']);
        grunt.registerTask('lesslint-test', ['lesslint']);

        // CI
        grunt.registerTask('travis', ['jshint', 'clean:build']);

        // DEV
        grunt.registerTask('prepare', ['clean:src','copy','build']);
        grunt.registerTask('build', ['uglify','less']);
        grunt.registerTask('dev', ['build', 'browserSync','watch']);

        grunt.registerTask('watch-less', ['browserSync','watch:lessFiles']);

        // Default task.
        grunt.registerTask('default', ['dev']);
    };


})();