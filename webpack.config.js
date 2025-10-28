import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin'; 

export default {
  entry: './src/scripts/index.js', // titik masuk aplikasi
  output: {
    path: path.resolve('dist'), // hasil build
    filename: 'app.bundle.js',
    publicPath: '', // penting biar GitHub Pages bisa baca path
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'], // untuk import CSS
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource', // untuk gambar/icon
        generator: {
          filename: 'images/[name][ext]', // pastikan disimpan di folder 'images'
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html', // ambil index.html dari src
      filename: 'index.html',
    }),
  new CopyWebpackPlugin({
      patterns: [
        {
          from: 'node_modules/leaflet/dist/images',
          to: 'images', // pastikan folder tujuan adalah 'dist/images'
        },
      ],
    }),
  ],
  devServer: {
    static: './dist',
    port: 8080,
    open: true,
  },
  mode: 'development',
};
