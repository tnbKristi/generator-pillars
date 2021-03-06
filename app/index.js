var util = require('util');
var path = require('path');
var generator = require('yeoman-generator');
var chalk = require('chalk');
var _ = require('underscore');
var _s = require('underscore.string');
var inf = require('inflection');

module.exports = generator.Base.extend({

  prompting: function () {
    var done = this.async();

    // replace it with a short and sweet description of your generator
    console.log(chalk.magenta('You\'re using the fantabulous Backbone/Marionette Pillar Generator. \n'));

    var prompts = [{
      type: 'input',
      name: 'moduleName',
      message: 'What\'s the name of your module? (use singular form, like "user") \n',
      default: 'example'
    },
    {
        type: 'checkbox',
        name: 'includes',
        store: true,
        message: 'Which module elements do you want generated? \n',
        choices: [
            {
                name: 'controller',
                checked: true
            },
            {
                name: 'router',
                checked: true
            }, 
            {
                name: 'search view',
                value: 'searchView',
                checked: true
            }, 
            {
                name: 'list view',
                value: 'listView',
                checked: true
            },
            {
                name: 'detail view',
                value: 'detailView',
                checked: true
            },
            {
              name: 'handlebars templates',
              value: 'hbsTemplates',
              checked: true
            },
            {
              name: 'entities',
              checked: true
            }
        ]
    },
    {
      type: 'input',
      name: 'appFileDir',
      store: true,
      message: 'Which directory should we create the app file? (Relative to the directory you are currently in)? \n',
      default: './'
    },
    {
      type: 'input',
      name: 'moduleDir',
      store: true,
      message: 'Which directory should we create the module dir? (Relative to the directory you are currently in)? \n',
      default: './modules'
    },
    {
      type: 'input',
      name: 'hbsDir',
      store: true,
      message: 'What directory should the module\'s templates be created in? \n',
      default: './templates',
      when: function (answers) {
        var hbsTemplates = _.indexOf(answers.includes, 'hbsTemplates') > -1;

        if (hbsTemplates) {
          return true;
        } else {
          return false;
        }
      }
    },
    {
      type: 'input',
      name: 'entityDir',
      store: true,
      message: 'What directory should the module\'s entities be created in? \n',
      default: './entities',
      when: function (answers) {
        var entities = _.indexOf(answers.includes, 'entities') > -1;

        if (entities) {
          return true;
        } else {
          return false;
        }
      }
    },    
    {
      type: 'confirm',
      name: 'defaultTemplates',
      store: true,
      message: 'Use default generator templates? \n',
      default: true
    }, 
    {
      type: 'input',
      name: 'templateDir',
      message: 'Ok, what directory can we find your templates? (Relative to the directory you are currently in) \n',
      when: function (answers) {
        if (answers.defaultTemplates === false) {
          return true;
        } else {
          return false;
        }
      }
    }

    ];

    this.prompt(prompts, function (props) {
      var config = this.config = {};

      if (props.moduleDir) {
        config.moduleDir = props.moduleDir + '/';
      } else {
        config.moduleDir = '';
      }

      if(props.templateDir) {
        this.sourceRoot(path.resolve(this.destinationRoot(), props.templateDir));
        console.log('Set source root to:', this.sourceRoot());
      }

      if(props.appFileDir) {
        config.appDir = props.appFileDir + '/';
      } else {
        config.appDir = '';
      }

      if(props.hbsDir) {
        config.hbsDir = props.hbsDir + '/';
      }

      if(props.entityDir) {
        config.entityDir = props.entityDir + '/';
      }

      config.includes = props.includes || [];

      config.moduleName = props.moduleName;
      config.moduleClass = _s.classify(config.moduleName);

      done();
    }.bind(this));
  },

  app: function () {
    var self = this,
        config = this.config,
        moduleDir, appDir, 
        entityDir, hbsDir;

    if (!config.moduleName) {
      return;
    } 

    config.pluralName = inf.pluralize(config.moduleName);

    this.inf = inf;

    moduleDir = path.resolve(config.moduleDir, './' + inf.pluralize(config.moduleName));
    appDir = path.resolve(config.appDir);

    if(config.hbsDir) {
      hbsDir = path.resolve(config.hbsDir, './' + inf.pluralize(config.moduleName));
    }

    if(config.entityDir) {
      entityDir = path.resolve(config.entityDir);
    }

    // create the root app file in specified dir
    this.template('app.js', appDir + '/' + config.pluralName + '.app.js');

    // create the module directory
    this.mkdir(moduleDir);

    // generate the includes in the module folder
    _.each(config.includes, function(includeName) {
      if(includeName === 'hbsTemplates') {
        self.template('template-list.hbs', hbsDir + '/' + config.moduleName + '-list.hbs');
        self.template('template-detail.hbs', hbsDir + '/' + config.moduleName + '-detail.hbs');
      
      } else if(includeName === 'entities') {

        self.template('model.js', entityDir + '/' + config.moduleClass + '.js');
        self.template('collection.js', entityDir + '/' + inf.pluralize(config.moduleClass) + '.js');

      } else {
        self.template(includeName + '.js', moduleDir + '/' + includeName + '.js');
      }

    });

    console.log('Your new module is at: ' + moduleDir + '/' + config.moduleName + '. Enjoy! :)');
    
  }
});
