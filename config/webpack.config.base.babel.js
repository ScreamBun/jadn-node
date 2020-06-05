/**
 * Base webpack config used across other specific configs
 */
import webpack from 'webpack';
import path from 'path';

const NODE_ENV = 'production';
const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'lib');
const SRC_DIR = path.join(ROOT_DIR, 'src');

export default {
  mode: NODE_ENV,
  entry: {
    api: "./src/api",
    cli: "./src/cli"
  },
  output: {
    path: DIST_DIR,
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs',
  },
  // Determine the array of extensions that should be used to resolve modules
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    modules: [SRC_DIR, 'node_modules']
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV
    }),
    new webpack.NamedModulesPlugin()
  ],
  optimization: {
    mergeDuplicateChunks: true,
    runtimeChunk: false,
    splitChunks: {
      automaticNameDelimiter: '_',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        },
        utils: {
          test: /src\/jadnschema[\\/]/,
          name: 'jadnschema',
          chunks: 'all'
        }
      }
    }
  },

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
