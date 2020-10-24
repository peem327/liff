module.exports = {
	publicPath: process.env.NODE_ENV === 'production'
	? '/service/'
	: '/service/',
	publicPath: process.env.BASE_URL,
	runtimeCompiler: true,
	// devServer: {
	// 	port: process.env.NODE_ENV === 'production' ? './' : '/',
	// 	proxy: process.env.NODE_ENV === 'production' ? {
	// 		'^/service': {
	// 			// target: 'https://develop.spaceloop.com',
	// 			target: 'https://api.flowsale.com',
	// 			changeOrigin: true,
	// 			//pathRewrite: { '^/api': '' }
	// 		}
	// 	}: null
	// },
	pwa: {
		name: 'Flowsale',
		shortName: 'Flowsale',
		themeColor: '#00AEEF',
		msTileColor: '#000000',
		appleMobileWebAppCapable: 'yes',
		appleMobileWebAppStatusBarStyle: '#00AEEF',

		// configure the workbox plugin
		workboxPluginMode: 'InjectManifest',
		workboxOptions: {
			// swSrc is required in InjectManifest mode.
			swSrc: './src/assets/service-worker.js',
			// ...other Workbox options...
		}
	},
	pages: {
		index: {
			// entry for the page
			entry: 'src/main.ts',
			// the source template
			template: 'public/index.html',
			// output as dist/index.html
			filename: 'index.html',
			// when using title option,
			// template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
			title: process.env.VUE_APP_TITLE,
			// chunks to include on this page, by default includes
			// extracted common chunks and vendor chunks.
			chunks: ['chunk-vendors', 'chunk-common', 'index']
		},
		// when using the entry-only string format,
		// template is inferred to be `public/subpage.html`
		// and falls back to `public/index.html` if not found.
		// Output filename is inferred to be `subpage.html`.
		//subpage: 'src/subpage/main.js'
	},
	css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            'primary-color': 'rgb(54, 180, 1)',
            //'link-color': '#1DA57A',
            //'border-radius-base': '2px',
          },
          javascriptEnabled: true,
        },
      },
    },
  },
}
