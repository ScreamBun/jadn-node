/**
 * Base webpack config used across other specific configs
 */
import webpack from 'webpack';
import path from 'path';

const NODE_ENV = 'production';
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const LIB_DIR = path.join(ROOT_DIR, 'lib');

export default {
  mode: NODE_ENV,
  entry: {
    api: "./lib/api",
    cli: "./lib/cli"
  },
  output: {
    path: DIST_DIR,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs',
  },
  // Determine the array of extensions that should be used to resolve modules
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    modules: [LIB_DIR, 'node_modules']
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new webpack.NamedModulesPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      }
    ]
  },
  node: {
    fs: 'empty'
  }
};
