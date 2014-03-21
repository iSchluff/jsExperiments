var path= require("path");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
  });

  // Load plugins

  // Default task(s).
  grunt.registerTask('build', ["uglify", "preprocess", "recess"]);
  grunt.registerTask('template', ["lodash:template", "uglify"]);
  
  grunt.registerTask('create', function() {
     var tmpPkg = require('./path/to/manifest/manifest.json');

     tmpPkg.foo = "bar";
     fs.writeFileSync('./new/path/to/manifest.json', JSON.stringify(tmpPkg,null,2));
  });
};