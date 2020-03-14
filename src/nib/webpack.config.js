const path = require('path')
const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
	entry: './src/nib/index.ts',
	resolve:{
		extensions: ['.ts', '.mjs', '.js']
	},
	output: {
		filename: 'nib/index.js',
		path: path.resolve(__dirname, '../../dist'),
		libraryTarget: 'commonjs'
	},
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				extractComments: false
			}),
			new OptimizeCSSAssetsPlugin()
		]
	},
	module: {
		rules: [{
			test: /\.ts$/,
			loader: 'ts-loader'
		},{
			test: /\.svg$/,
			loader: 'svg-inline-loader',
			options: {
				removeTags: true,
				removingTagAttrs: ['xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'],
			}
		},{
			test: /\.styl$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
		}]
	},
	plugins: [
		new CopyPlugin([
			{from: path.resolve(__dirname, 'package.json'), to:'nib/package.json'}
		]),
		new MiniCssExtractPlugin({
			filename: 'nib/index.css'
		}),
		//https://stackoverflow.com/questions/43694367/you-are-currently-using-minified-code-outside-of-node-env-production-this
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	]
}