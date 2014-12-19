var path= require("path");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',

        // generate source maps in /dist/js/sourceMaps for files in /dist/js
        sourceMap: true,
        sourceMapName: function(dest){
          var filename= path.basename(dest).split(".")[0] +".js.map";
          return path.join(path.dirname(dest),"sourceMaps/", filename);
        }
      },


      // compile and minify js
      main: {
        files:{
          "dist/js/default.js": ["src/js/default.js"],
        }
      },
    },

    less : {
      options: {
        cleancss: false,
      },
      // compile bootstrap seperately to save time
      all: {
        files: [
          {
            expand: true,
            src: ["*/main.less"],
            ext: ".css",
          }
        ]
      },
    },


    watch: {
      less: {
        files: ["*/*.less"],
        tasks: ["less:all"],
        options: {spawn:false}
      },
    },
  });

  // Load plugins
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-newer');

  // Default task(s).
  grunt.registerTask('default', ["build", "watch"]);
  grunt.registerTask('build', ["less"]);

  grunt.event.on('watch', function(action, filepath, target) {
    grunt.log.writeln(target + ': ' + filepath + ' has ' + action);
  });
};
