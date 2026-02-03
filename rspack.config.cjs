const path = require('node:path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: './src/frontend/main.ts',
    preload: './src/backend/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/frontend': path.resolve(__dirname, 'src/frontend'),
      '@/backend': path.resolve(__dirname, 'src/backend'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/frontend-lib': path.resolve(__dirname, 'src/frontend/lib'),
      '@/backend-lib': path.resolve(__dirname, 'src/backend/lib'),
      vue$: 'vue/dist/vue.esm-bundler.js',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.vue', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false,
              },
              transform: {
                react: {
                  runtime: 'classic',
                },
              },
            },
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'ecmascript',
                jsx: false,
              },
              transform: {
                react: {
                  runtime: 'classic',
                },
              },
            },
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'body',
      chunks: ['main'],
    }),
    {
      apply(compiler) {
        compiler.hooks.afterResolvers.tap('VueLoaderPlugin', (compiler) => {
          const { VueLoaderPlugin } = require('vue-loader');
          new VueLoaderPlugin().apply(compiler);
        });
      },
    },
  ],
  builtins: {
    define: {
      'process.env': {},
    },
  },
  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  node: {
    global: true,
  },
  target: 'electron-renderer',
};
