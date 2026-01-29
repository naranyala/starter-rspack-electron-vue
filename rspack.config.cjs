const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/renderer/main.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/renderer': path.resolve(__dirname, 'src/renderer'),
      '@/main': path.resolve(__dirname, 'src/main'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/renderer-lib': path.resolve(__dirname, 'src/renderer/lib'),
      '@/main-lib': path.resolve(__dirname, 'src/main/lib'),
      vue$: 'vue/dist/vue.esm-bundler.js',
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue', '.json'],
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader',
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
                jsx: false, // Disable JSX for Vue
              },
              transform: {
                react: {
                  runtime: 'classic', // Use classic runtime or remove react transform entirely for Vue
                },
              },
            },
          },
        },
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'builtin:swc-loader',
          options: {
            jsc: {
              parser: {
                syntax: 'typescript',
                tsx: false, // Disable TSX for Vue
              },
              transform: {
                react: {
                  runtime: 'classic', // Use classic runtime or remove react transform entirely for Vue
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

  devServer: {
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
  target: 'electron-renderer',
};
