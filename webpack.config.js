/*
 *   Copyright (c) 2023 
 *   All rights reserved.
 */
const path = require('path');
const webpack = require('webpack');
const { ModifySourcePlugin } = require('modify-source-webpack-plugin');
const fs = require("fs");
const {log} = require("util");
const projectConfig = require('./package.json')

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    mode: projectConfig.debug ? 'development' : 'production',
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.jsx'],
        fallback: {
            crypto: require.resolve("crypto-browserify"),
            stream: require.resolve("stream-browserify"),
            util: require.resolve("util"),
        }
    },
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        publicPath: "/"
    },
    // node: {
    //     '__dirname': true
    // },
    plugins: [
        new webpack.ProvidePlugin({
            process: 'process/browser',
        }),
        new ModifySourcePlugin({
            rules: [
                {
                    test: /.*(\.|-)component\.ts$/,
                    modify: (src, path) =>
                    {
                        // console.log("Replacing html filename by html file content.");
                        // let filename = path.split('/').reverse()[0].replace('ts', 'html');
                        let filepath = path.substring(0, path.lastIndexOf('/'))
                        const extractedHtmlFilename = src.match(/template:\s(?:'|")([a-z]+(?:-[a-z]+)*\.html)(?:'|")/);

                        if(extractedHtmlFilename)
                        {
                            let filename = extractedHtmlFilename[1];

                            const htmlFile = fs.readFileSync(`${filepath}/${filename}`);

                            if(htmlFile)
                            {
                                let replaceString = `\`${htmlFile.toString()
                                    .replace(new RegExp('(?:\\r\\n|\\r|\\n)', 'g'), ' ')}\``;

                                if(projectConfig.debug)
                                {
                                    replaceString = `'${filename}', dirname: '${filepath.substring(filepath.indexOf('src/'))}'`;
                                }
                                
                                // detect if debug mode or production
                                const newSrc = src.replace(new RegExp(`("|')${filename}("|')`), replaceString);
                                // console.log(newSrc);
                                return newSrc;
                            }
                        }

                        return src;
                    }
                }
            ]
        })
    ],
    devtool: "source-map",
    devServer: {
        static: {
            directory: __dirname,
        },
        compress: true,
        allowedHosts: "all",
        port: 1980,
        devMiddleware: {
            writeToDisk: true
        },
        historyApiFallback: {
            index: 'index.html',
            rewrites: [
                { from: '.*', to: (context) =>
                    {
                        // check if the url is a route url then rewrite it to item.html
                        let pathname = context.parsedUrl.pathname;
                        const routeUrl = /^(\/(?:[a-zA-Z0-9]+-?[a-zA-Z0-9]*))*$/.exec(pathname);

                        if(routeUrl)
                        {
                            return 'index.html'
                        }

                        // sometimes it can happen that / are put at the end of a .html or .css url.
                        if(pathname.charAt(pathname.length - 1) === '/')
                        {
                            pathname = pathname.substring(0, pathname.length - 1);
                        }
                        // else check if the file is in src.
                        const srcIndex = pathname.indexOf('src/');
                        if(srcIndex !== -1)
                        {
                            return pathname.substring(srcIndex);
                        }

                        // or in dist/ (if not in src/ the file MUST be in dist/
                        const distIndex = pathname.indexOf('dist/');
                        return pathname.substring(distIndex);
                    }}
            ]
        }
    },
};
