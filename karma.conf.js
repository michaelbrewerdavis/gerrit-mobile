var path = require('path')
var webpack = require('webpack');
var webpackConfig = require('./webpack.config')

module.exports = function (config) {
  config.set({
    browsers: [ 'Chrome' ], //run in Chrome
    singleRun: true, //just run once by default
    frameworks: [ 'mocha' ], //use the mocha test framework
    files: [
      'webpack.tests.js' //just load this file
    ],
    preprocessors: {
      'webpack.tests.js': [ 'webpack', 'sourcemap' ] //preprocess with webpack and our sourcemap loader
    },
    reporters: [ 'dots' ], //report results in this format
    webpack: //webpackConfig,
    { //kind of a copy of your webpack config
      resolve: {
        alias: {
          'gerrit-mobile': path.join(__dirname, 'app/js')
        }
      },
      devtool: 'inline-source-map', //just do inline source maps instead of the default
      module: {
        loaders: [
          { test: /\.js$/, loader: 'babel-loader' }
        ]
      }
    },
    webpackServer: {
      noInfo: true //please don't spam the console when running in karma!
    }
  });
};
