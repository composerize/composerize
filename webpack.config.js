var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    entry: {
        'composerize-js-bundle': './lib/js/composerize',
    },
    output: {
        filename: 'dist/[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('css!sass'),
            }
        ],
    },
    plugins: [
        new ExtractTextPlugin('dist/composerize-css-bundle.css', {
            allChunks: true
        }),
        new CopyWebpackPlugin([
            { from: '**/*', to: 'dist', context: './lib/static' },
        ]),
        new webpack.optimize.UglifyJsPlugin(),
    ]
};
