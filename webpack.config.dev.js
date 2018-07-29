import path from 'path';
import webpack from 'webpack';

export default {
    entry: ['babel-polyfill', 'webpack-hot-middleware/client',
        path.join(__dirname, '/client/src/index.js')],
    output: {
        path: '/',
        publicPath: '/',
        filename: 'bundle.js'
    },
    mode: 'none',
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.OccurrenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin()
    ],
    module: {
        rules: [{
            test: /\.(js|jsx)$/,
            include: path.join(__dirname, 'client'),
            use: [
                {
                    loader: 'babel-loader',
                    options: {
                        // This is a feature of `babel-loader` for Webpack (not Babel itself).
                        // It enables caching results in ./node_modules/.cache/babel-loader/
                        // directory for faster rebuilds.
                        cacheDirectory: true,
                        plugins: ['react-hot-loader/babel'],
                    },
                },
                { loader: 'source-map-loader' }],

            enforce: "pre"
        }, {
            test: /\.css$/,
            use: [
                { loader: 'style-loader' },
                { loader: 'css-loader' }
            ]
        }, {
            test: /\.(png|jpe?g|svg|gif)$/,
            use: [{
                loader: 'file-loader?context=[path][name].[ext]'

            }]

        },
        {
            test: /\.htm?l$/,
            use: [{ loader: 'html-loader' }]
        },
        {
            test: /\.ttf$/,
            use: [{ loader: 'url-loader' }]
        },
        {
            test: /\.xml$/,
            use: [{ loader: 'xml-loader' }]
        } // will load all .xml files with xml-loader by default

        ]
    },

    node: {
        fs: 'empty',
        child_process: 'empty',
        net: 'empty',
        tls: 'empty',
        dns: 'empty',
        dgram: 'empty'

    }
}