import path from 'node:path';
import { defineConfig } from '@rspack/core';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { VueLoaderPlugin } from 'vue-loader';
import { getBuildConfig } from './src/shared/config';

const isDev = process.env.NODE_ENV !== 'production';
const buildConfig = getBuildConfig();

export default defineConfig({
  mode: process.env.NODE_ENV || 'development',
  entry: {
    main: './src/frontend/main.ts',
    preload: './src/backend/preload.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/frontend': path.resolve(__dirname, 'src/frontend'),
      '@/backend': path.resolve(__dirname, 'src/backend'),
      '@/shared': path.resolve(__dirname, 'src/shared'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/frontend-lib': path.resolve(__dirname, 'src/frontend/lib'),
      '@/backend-lib': path.resolve(__dirname, 'src/backend/lib'),
      '@/config': path.resolve(__dirname, 'src/shared/config'),
      '@/constants': path.resolve(__dirname, 'src/shared/constants'),
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
    new VueLoaderPlugin(),
  ],
  builtins: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PORT': JSON.stringify(process.env.PORT || '1234'),
    },
  },
  devServer: {
    port: parseInt(process.env.PORT || '1234', 10),
    hot: true,
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'src/assets'),
    },
  },
  node: {
    global: true,
  },
  target: 'electron-renderer',
  devtool: isDev ? 'inline-source-map' : false,
});
