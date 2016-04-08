var path = require('path');
var webpack = require('webpack');

module.exports = {
	context: __dirname,
	entry: {
		bundle: './app/index.jsx',
		vendor: [
			'react',
			'react-dom',
			'react-redux',
			'react-router',
			'react-router-redux',
			'redux',
			'redux-saga',
			'redux-storage',
			'redux-storage-engine-localstorage',
			'es6-promise',
			'whatwg-fetch'
		]
	},
	output: {
		path: 'dist/',
		filename: '[name].js',
		sourceMapFilename: '[name].js.map',
		publicPath: '/'
	},
	plugins: [
		new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"'} }),
		new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', minChunks: Infinity})
	],
	module: {
		loaders: [{
			test: /\.jsx?$/,
			include: [ path.resolve(__dirname, 'app') ],
			loader: 'babel-loader', // 'babel' is also a legal name to reference
			query: {
				plugins: ['transform-runtime']
			}
		}]
	},
	devtool: ['source-map'],
	resolve: {
		extensions: ['', '.js', '.jsx']
	},
};