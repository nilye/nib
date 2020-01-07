const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')

module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'index.js',
		path: path.resolve(__dirname, 'dist'),
		library: 'Nib',
		libraryExport: 'default',
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
			filename: 'main.css'
		}),
		//https://stackoverflow.com/questions/43694367/you-are-currently-using-minified-code-outside-of-node-env-production-this
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
		})
	]
}