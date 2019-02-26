
module.exports = (grunt) ->
  grunt.initConfig

    watch:
      clientCoffee:
        files: './src/**/*.coffee'
        tasks: ['coffeelint', 'coffee']
        options: { livereload: true }
      clientLess:
        files: './src/**/*.less'
        tasks: ['less:client']
        options: { livereload: true }
      copyHtml:
        files: './src/**/*.html'
        tasks: ['copy:main']
        options: { livereload: true }
      configFiles:
        files: [ 'gruntfile.coffee'],
        options:
          reload: true

    coffeelint:
      options:
        'max_line_length': {'level': 'ignore'}
      client:
        files:
          src: ['src/**/*.coffee']

    coffee:
      client:
        options:
          join: true
          #bare: true
          sourceMap: true
        files:
          'dist/index.js' : 'src/coffee/**/*.coffee'
      worker:
        files:
          'dist/worker.js' : 'src/worker/**/*.coffee'

    less:
      client:
        files:
          'dist/index.css' : 'src/less/main.less'

    copy:
      main:
        files: [
          expand: false, src: ['src/index.html'], dest: 'dist/index.html'
        ]

    connect:
        server:
          options:
            port: 3000,
            hostname: '*'

  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-copy'
  grunt.loadNpmTasks 'grunt-contrib-less'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-connect'

  # Default task(s).
  grunt.registerTask 'wicked', ['watch']
  grunt.registerTask 'default', ['coffeelint', 'coffee', 'less', 'copy', 'connect', 'watch']
