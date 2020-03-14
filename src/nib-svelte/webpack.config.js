const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
	entry: './src/nib-svelte/index.js',
	resolve:{
		extensions: ['.ts', '.mjs', '.js', 'svelte']
	},
	output: {
		filename: 'nib-svelte/index.js',
		path: path.resolve(__dirname, '../../dist'),
		library: 'NibSvelte',
		libraryExport: 'default',
		libraryTarget: 'umd'
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
			test: /\.svelte$/,
			use: {
				loader: 'svelte-loader',
				options: {
					emitCss: true,
					hotReload: true
				}
			}
		},{
			test: /\.ts$/,
			loader: 'ts-loader',
		},{
			test: /\.styl$/,
			use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader']
		},{
			test: /\.svg$/,
			loader: 'svg-inline-loader',
			options: {
				removeTags: true,
				removingTagAttrs: ['xmlns', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'stroke-miterlimit'],
			}
		}]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'nib-svelte/index.css'
		}),
		//https://stackoverflow.com/questions/43694367/you-are-currently-using-minified-code-outside-of-node-env-production-this
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	]
}