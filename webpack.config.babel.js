import path from 'path'
import flat from 'flat'
import rimraf from 'rimraf'
import webpack from 'webpack'
import CopyWebpackPlugin from 'copy-webpack-plugin'
import ExtractTextPlugin from 'extract-text-webpack-plugin'
import OptimizeCSSPlugin from 'optimize-css-assets-webpack-plugin'
import HtmlWebpackPlugin from 'html-webpack-plugin'
import FaviconsWebpackPlugin from 'favicons-webpack-plugin'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer'
import fs from 'fs'
import lessToJs from 'less-vars-to-js'

console.log(`Current SDP_ENV is : ${process.env.SDP_ENV}`)

function resolve (p) {
  return path.resolve(__dirname, p)
}

const pkg = require('./package.json')

// 或 resolve('../webapp')
const dist = resolve('dist')

const __PROD__ = process.env.NODE_ENV === 'production'

if (__PROD__) {
  console.log('Clean dist.')
  rimraf.sync(dist)
}

console.log('Create configuration.')
const postcssOptions = {
  plugins: [
    require('postcss-import')({
      path: [
        resolve('src/theme/styles'),
        resolve('node_modules/@sdp.nd')
      ]
    }),
    require('postcss-url')({
      basePath: resolve('src/static')
    }),
    // postcss-cssnext 与 postcss-nesting 大家？
    require('postcss-nesting')(),
    require('postcss-cssnext')({
      features: {
        customProperties: {
          variables: require(resolve('src/theme/styles/variables.json'))
        },
        nesting: false,
        // 禁用 autoprefixer，在 postcss-rtl 后单独引入
        // 否则会跟 postcss-rtl 冲突
        autoprefixer: false
      }
    }),
    // PostCSS plugin for RTL-optimizations
    require('postcss-rtl-fish')({
      // Custom function for adding prefix to selector. Optional.
      addPrefixToSelector (selector, prefix) {
        if (/^html/.test(selector)) {
          return selector.replace(/^html/, `html${prefix}`)
        }
        if (/:root/.test(selector)) {
          return selector.replace(/:root/, `${prefix}:root`)
        }
        return `${prefix} ${selector}`
      }
    }),
    require('autoprefixer')(),
    require('postcss-browser-reporter')(),
    require('postcss-reporter')()
  ]
}

let fishTheme = {}
if (pkg.theme) {
  if (typeof pkg.theme === 'string') {
    var cfgPath = pkg.theme
    // relative path
    if (cfgPath.charAt(0) === '.') {
      cfgPath = (0, path.resolve)(process.cwd(), cfgPath)
    }
    if (fs.existsSync(cfgPath)) {
      fishTheme = lessToJs(fs.readFileSync(cfgPath, 'utf8'))
      if (fishTheme['@icon-url']) {
        fishTheme['@icon-url'] = decodeURIComponent(fishTheme['@icon-url'])
      }
    } else {
      console.log('no find ' + cfgPath)
    }
  } else if (typeof pkg.theme === 'object') {
    fishTheme = pkg.theme
  }
}

const lessOptions = {
  modifyVars: {
    ...fishTheme
  }
}

function getCSSLoader (type) {
  const loaders = [
    {
      loader: 'style-loader'
    },
    {
      loader: 'css-loader',
      options: {
        importLoaders: 1
      }
    },
    {
      loader: 'postcss-loader',
      options: postcssOptions
    }
  ]
  if (type === 'less') {
    loaders.push({
      loader: 'less-loader',
      options: lessOptions
    })
  }
  if (__PROD__) {
    return ExtractTextPlugin.extract({
      fallback: loaders.shift().loader,
      use: loaders
    })
  }
  return loaders
}

const webpackConfig = {
  target: 'web',
  entry: {
    app: [
      resolve('src/index.js')]
  },
  output: {
    path: dist,
    publicPath: '',
    filename: '[name].[hash].js',
    chunkFilename: '[id].[hash].js'
  },
  resolve: {
    modules: [resolve('src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.css'],
    alias: {
      '~': resolve('src'),
      ae: '@sdp.nd/ae',
      fish: '@sdp.nd/fish'
    }
  },
  node: {
    fs: 'empty',
    net: 'empty'
  },
  devtool: __PROD__ ? 'source-map' : 'cheap-module-eval-source-map',
  devServer: {
    host: '0.0.0.0',
    port: 3000,
    compress: true,
    disableHostCheck: true,
    hot: true,
    noInfo: true,
    useLocalIp: true
  },
  performance: {
    hints: __PROD__ ? 'warning' : false
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: resolve('src'),
        use: [{
          loader: 'eslint-loader',
          options: {
            emitWarning: !__PROD__,
            formatter: require('eslint-friendly-formatter')
          }
        }],
        enforce: 'pre'
      }, {
        test: /\.jsx?$/,
        include: [
          resolve('src'),
          // AE 与那些提供 ES 的模块
          /[/\\]node_modules.*[/\\](ae|((lodash-)?es))[/\\](?!node_modules)/
        ],
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: getCSSLoader('css')
      },
      {
        test: /\.less$/,
        use: getCSSLoader('less')
      },
      {
        test: /\.(png|jpg|gif|svg|woff2?|eot|ttf)(\?.*)?$/,
        use: [{
          loader: 'url-loader',
          options: {
            limit: 8192,
            name: '[name].[ext]?[hash:7]'
          }
        }]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.SDP_ENV': JSON.stringify(process.env.SDP_ENV || process.env.npm_config_sdp_env || 'test'),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('src/template/index.ejs'),
      title: `${pkg.name} - ${pkg.description}`,
      hash: false,
      inject: true,
      minify: {
        collapseWhitespace: false,
        minifyJS: false
      }
    }),
    new CopyWebpackPlugin([
      // 静态文件
      {
        from: 'src/static'
        // 拍平 comp，没有很强的必要，只是为了各模块的翻译保持一致
        // fish 的翻译不能拍平，因为 fish 翻译的实现我们控制不了
        // {a: {b: {c: {d: '...'}}}} ->  {'a.b.c.d': '...'}
        // ,transform: (content, path) => {
        //   if (/comp.+\.json$/.test(path)) {
        //     return JSON.stringify(flat(JSON.parse(content)))
        //   }
        //   return content
        // }
      },
      // 各模块的国际化资源
      {
        context: 'src/modules',
        from: '**/*.json',
        to: 'locale',
        // 拍平，因为 react-intl 不支持嵌套格式
        // {a: {b: {c: {d: '...'}}}} ->  {'a.b.c.d': '...'}
        transform: content => JSON.stringify(flat(JSON.parse(content)))
      }
    ], {
      ignore: ['README.md']
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'ae',
      minChunks: module => /[/\\](ae|react|redux)(-[0-9a-z-]*)?[/\\]/.test(module.resource)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'fish',
      minChunks: module => /[/\\](@sdp\.nd[/\\]fish|moment|rc-[0-9a-z-]+)[/\\]/.test(module.resource)
    }),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    })
  ]
}

if (__PROD__) {
  console.log('Enable plugins for production (Dedupe & UglifyJS).')
  webpackConfig.plugins.push(
    new FaviconsWebpackPlugin({
      logo: resolve('src/assets/favicon.svg'),
      prefix: 'icons-[hash:7]/',
      icons: {
        android: false,
        appleIcon: false,
        appleStartup: false,
        coast: false,
        favicons: true,
        firefox: false,
        opengraph: false,
        twitter: false,
        yandex: false,
        windows: true
      }
    }),
    // 按需优化 moment
    // new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^\.\/(zh-cn|en-gb)$/),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      options: {
        context: __dirname
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        unused: true,
        dead_code: true,
        warnings: false
      },
      sourceMap: true
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: {
        safe: true
      }
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: '[name].[contenthash].css',
      allChunks: true
    })
  )

  if (process.env.npm_lifecycle_event === 'start') {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        // Can be `server`, `static` or `disabled`.
        // In `server` mode analyzer will start HTTP server to show bundle report.
        // In `static` mode single HTML file with bundle report will be generated.
        // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
        analyzerMode: 'server',
        // Host that will be used in `server` mode to start HTTP server.
        analyzerHost: '127.0.0.1',
        // Port that will be used in `server` mode to start HTTP server.
        analyzerPort: 8888,
        // Path to bundle report file that will be generated in `static` mode.
        // Relative to bundles output directory.
        reportFilename: 'report.html',
        // Automatically open report in default browser
        openAnalyzer: true,
        // If `true`, Webpack Stats JSON file will be generated in bundles output directory
        generateStatsFile: false,
        // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
        // Relative to bundles output directory.
        statsFilename: 'stats.json',
        // Options for `stats.toJson()` method.
        // For example you can exclude sources of your modules from stats file with `source: false` option.
        // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
        statsOptions: null,
        // Log level. Can be 'info', 'warn', 'error' or 'silent'.
        logLevel: 'info'
      })
    )
  }
} else {
  console.log('Enable plugins for live development (HMR, NoErrors).')
  webpackConfig.plugins.push(
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.LoaderOptionsPlugin({
      debug: true,
      options: {
        context: __dirname
      }
    }),
    new FriendlyErrorsPlugin()
  )
}

export default webpackConfig
