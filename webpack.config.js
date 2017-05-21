var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'source-map',
    target: 'web',
        node: {
            fs: 'empty'
    },
    entry: {
        'composerize-js-bundle': './lib/js/composerize',
    },
    externals: {
        // require("jquery") is external and available
        //  on the global var jQuery
        "jquery": "jQuery"
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
                test: /\.s?css$/,
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
