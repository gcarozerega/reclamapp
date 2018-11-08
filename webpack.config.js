var webpack = require('webpack');

var path = require('path');
var HtmlwebpackPlugin = require('html-webpack-plugin');
var WriteFilePlugin = require('write-file-webpack-plugin');

var ROOT_PATH = path.resolve(__dirname);

module.exports = {
  entry: [
    'react-hot-loader/patch',
    path.resolve(ROOT_PATH, 'app/src/index'),
  ],
  module: {
    loaders: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
      	presets:['es2015', 'react', 'react-hmre'],
        plugins: ['react-hot-loader/babel']
      },
      include: path.resolve(ROOT_PATH, 'app/src'),
    },
    {
      test: /\.scss$/,
      loaders: ['style-loader','css-loader','sass-loader']
    },
    {
      test: /\.css$/,
      loaders: ['style-loader', 'css-loader']
    },
    {
      test: /\.(png|woff|woff2|eot|ttf|svg)$/,
      loader: 'url-loader?limit=100000'
    }]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  output: {
    path: path.resolve(ROOT_PATH, 'app/build'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  devServer: {
    contentBase: path.resolve(ROOT_PATH, 'app/build'),
    outputPath: path.join(ROOT_PATH, 'app/build'),
    historyApiFallback: true,
    inline: true,
    progress: true,
    host: '0.0.0.0',
    disableHostCheck: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new HtmlwebpackPlugin({
      title: 'Sercolex',
      template: 'template.ejs'
    }),
    new WriteFilePlugin()
  ]
};
