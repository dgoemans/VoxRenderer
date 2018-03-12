var webpack = require('webpack');
var path = require('path');
var BrowserSyncPlugin = require('browser-sync-webpack-plugin')

var BUILD_DIR = path.resolve(__dirname, 'dist/');
var APP_DIR = path.resolve(__dirname, 'src/');

var config = {
    devtool: 'cheap-eval-source-map',
    entry: [
        'babel-polyfill',
        APP_DIR + '/index.js',
    ],
    node: {
        fs: "empty"
    },
    output: {
        path: BUILD_DIR,
        filename: 'bundle.js'
    },
    plugins: [
        new BrowserSyncPlugin({
            host: process.env.IP || 'localhost',
            port: process.env.PORT || 3000,
            server: {
                baseDir: ['./', './dist']
            },
            notify: false,
            logLevel: 'debug'
        }),
        new webpack.ProvidePlugin({
            THREE: 'three'
        })
    ],
    module : {
        rules : [
            { 
                test : /\.js?/,
                include : APP_DIR,
                use : 'babel-loader'
            },
            {
                test: /\.html/,
                loader: 'file-loader',
                options: {
                    name: '[name].[ext]'
                }
            },
            { 
                test: /\.css$/, 
                use: [
                    { loader: 'style-loader' },
                    { loader: 'css-loader' }
                ]
            }
        ]
    },
    watch: true
};

module.exports = config;