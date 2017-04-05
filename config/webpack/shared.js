// Note: You must restart bin/webpack-watcher for changes to take effect
/* eslint global-require: 0 */
/* eslint import/no-dynamic-require: 0 */

const webpack = require('webpack');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { basename, join, resolve } = require('path');
const { sync } = require('glob');
const { readdirSync } = require('fs');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const extname = require('path-complete-extname');
const { env, paths, publicPath, loadersDir } = require('./configuration.js');

const extensionGlob = `*{${paths.extensions.join(',')}}*`;
const packPaths = sync(join(paths.source, paths.entry, extensionGlob));

module.exports = {
  entry: packPaths.reduce((map, entry) => {
    const localMap = map;
    localMap[basename(entry, extname(entry))] = resolve(entry);
    return localMap;
  }, {}),

  output: {
    filename: '[name].js',
    path: resolve(paths.output, paths.entry),
    publicPath: 'packs/',
  },

  module: {
    rules: readdirSync(loadersDir).map(file => (
      require(join(loadersDir, file))
    ))
  },

  plugins: [
    new webpack.ProvidePlugin({
      // make fetch available
      fetch: 'exports-loader?self.fetch!whatwg-fetch',
    }),

    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(), // Tell webpack we want hot reloading
    new webpack.NoEmitOnErrorsPlugin(),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/, // exclude node_modules
      failOnError: false, // show a warning when there is a circular dependency
    }),
    // new webpack.EnvironmentPlugin(JSON.parse(JSON.stringify(env))),
    // new ExtractTextPlugin(env.NODE_ENV === 'production' ? '[name]-[hash].css' : '[name].css'),
    new ManifestPlugin({ fileName: 'manifest.json', publicPath, writeToFileEmit: true })
  ],

  resolve: {
    modules: [
      'app/javascript/packs',
      'node_modules',
      // resolve(paths.source),
      // resolve(paths.node_modules)
    ],
    extensions: [
      '.js',
      '.jsx',
      '.react.js',
    ],
    mainFields: [
      'browser',
      'jsnext:main',
      'main',
    ],
  },

  resolveLoader: {
    modules: [paths.node_modules]
  }
}
