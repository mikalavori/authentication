module.exports = {
  test: /\.js(\.erb)?$/,
  exclude: /node_modules/,
  loader: 'babel-loader',
  options: {
    presets: ['babel-preset-react-hmre'].map(require.resolve),
  }
}
