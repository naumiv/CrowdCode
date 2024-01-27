module.exports = function (grunt) {

    var dir     = require('./bower.json').appPath || 'app';
    var distDir = dir + 'Dist';
    var cwd = process.cwd();

    process.chdir('../');

    grunt.loadNpmTasks('grunt-contrib-watch');

    process.chdir( dir );

    grunt.initConfig({

        // watch for any edit of the html, js, css or jsp and rebuild the project
        watch: {
            scripts: {
                files: [ '*.html', 'styles/*.css', '*.js', '*.html'],
                tasks: ['build'],
                options: {
                    event: ['all']
                }
            }
        }



    });

    grunt.registerTask('build', [
        'html2js',
        'concat',
        'replace:scripts',
        'replace:jsp',
        'copy',
        // 'usemin'
    ]);
};