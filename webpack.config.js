var webpack = require('webpack')

module.exports = {
  context: __dirname + "/app/js",
  entry: './app',

  output: {
    path: __dirname + "/public/js/generated",
    publicPath: '/js/generated/',
    filename: "bundle.js"
  },

  devtool: 'inline-source-map', //just do inline source maps instead of the default

  module: {
    preLoaders: [{
      test: /\.jsx?$/,
      loader: 'eslint-loader',
      exclude: /node_modules/,
    }],

    loaders: [{
      test: /.jsx?$/,
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: {
        presets: ['es2015', 'react']
      }
    },
    {
      test: /\.css$/,
      loader: "style-loader!css-loader"
    }]
  },

  devServer: {
    proxy: {
      '/api/*': {
          target: 'http://localhost:3000',
          secure: false
      },
      '/auth/*': {
          target: 'http://localhost:3000',
          secure: false
      }
    }
  },
}
