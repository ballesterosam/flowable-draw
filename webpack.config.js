const webpack = require('webpack')

module.exports = {
  context: __dirname ,
  entry: { 
    main: "./main.js",
    flowableDraw: "./bpmn-draw.js"
  },
  output: {
    path: __dirname + "/dist",
    filename: "[name].js",
    library: "[name]",
    libraryTarget: "umd"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015']
        }
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}