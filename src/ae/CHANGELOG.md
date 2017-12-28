## 阅读说明
  - [+] 加：功能新增……
  - [-] 减：功能移除……
  - [*] 乘：功能修改……
  - [/] 除：问题解决……
  - [=] 等：优化……

## 0.1.19
  - [/] 修复聚合后台单点登录跳转 request_uri 问题

## 0.1.18
  - [+] source 支持为不同的 action 配置不同的 interceptor
  - [+] button 支持配置 disabled，取值可为函数或布尔值
  - [/] 修复Grid 表单按钮问题
  - [/] 修复表单验证问题
  - [/] 修复带数字前导的模块的国际化问题

## 0.1.17
  - [/] 修复登录校验码无法输入的问题

## 0.1.16
  - [*] **注意** Grid 的配置项（比如 checkable、fields）现在通过装饰器 config 实现，未来会有更多的配置项
  - [*] buttons 的排序 index 改成 offset，基准值是 0，负数往前，正数往后
  - [/] 解决 Grid checkable 及 fields 配置无效的问题（参见第一点）
  - [=] 主题移除 `FormattedMessage`，改用 `__`

## 0.1.15
  - [/] 解决装饰器 search 清空搜索项后提交响应不正确的问题 2

## 0.1.14
  - [/] 好吧，0.1.13 没发成功，因为 gerrit 同步失败

## 0.1.13
  - [/] 解决装饰器 search 清空搜索项后提交响应不正确的问题

## 0.1.12
  - [+] query 回填搜索表单（#高靖淞）
  - [+] 装饰器 search 支持配置 transformer，用于对输入输出进去转换
  - [+] displayRender/editRender 现在接收更多的 props
  - [+] 添加全局的进度条
  - [-] 移除表格的 loading
  - [*] 装饰器基类的 hookRender 不再默认向下传递 this.config
    - 支持手动下传（建议不下传，以避免污染），参见 decorators/config
  - [=] 优化装饰器 detail

## 0.1.11
  - [=] 好吧，0.1.10 没发成功

## 0.1.10
  - [+] 增加时间与日期区域选择控件
  - [*] 修改搜索表单默认 formItemLayout
  - [=] 装饰器 back 样式调整

## 0.1.9
  - [+] 添加装饰器 back
  - [*] 装饰器 list 里的刷新功能修改为局部刷新
  - [/] 修复 DatePicker 返回值为空的问题

## 0.1.8
  - [+] 表单提交（增删改）支持传入操作回调
    - 通过 `onResponse(payload)`
    - 在 `onResponse` 内可以调用 `this.redirect()` 方法，实现跳转到列表
  - [+] 表单提交失败后停留在当前页面
  - [/] 修复装饰器的 config 优先级问题
  - [/] 修复装饰器 detail 的问题
    - useBtn 问题
    - 国际化问题
    - 返回现在跳转到列表页
  - [/] 修复 Fields 子类 onChange 不覆盖父类的问题
  - [/] 修复 route 重复 encode 问题
  - [=] 子模块路由默认包含父模块路由（现在新闻模块的路径更优美一点了）
  - [=] 主题 fish 优化

## 0.1.7
  - [+] 默认的 fish 主题采用异步加载
  - [+] 自定义主题建议使用异步：`.theme(import('theme/simple'))`
  - [-] Grid 的 scope 为 list 的 action 的 arguments 不再包含 state，要访问 state 请直接使用 this.state
  - [-] 移除 darkgray 主题
  - [/] 重新发起列表请求（如翻页、搜索） selectedRowKeys 重置为 []
  - [=] 允许 mount 不传入挂载节点
  - [=] 其他一些优化

## 0.1.6
  - [+] 自动加载 ckeditor 的功能又回来了
  - [+] 增加 stylelint
  - [+] `__` 方法完全兼容扁平与嵌套两种模式
    - 建议拍平 modules 下的国际化资源，可以在 webpack 的 copy 插件里配置
  - [+] i18n 支持自定义 `getTranslations` 方法
    - 为了将来支持获取动态翻译资源（比如来自翻译平台）
    - 还可以配置 `AECONST.LOCALE_BASE` （默认 `locale/`，如果使用外域，需要考虑跨域支持）
  - [/] fish 组件国际化同步升级到 2.x
  - [/] moment 国际化问题修复
  - [=] react-intl 与 moment 的 locale 相关 js 移到 CS
    - 通过全局变量 `AECONST.CDN_JS_BASE` （默认 `//cdncs.101.com/v0.1/static/static/`）
  - [=] buildField 优化

## 0.1.5
  - [+] module.component 支持数组：`component: ['Form', 'Grid']`
  - [-] 移除 Dashboard
  - [=] 优化 Container

## 0.1.4
  - [+] 装饰器 list 里的 fields 支持传入更多配置
    - `fields: [ ['created_at', { width: 200 }] ]`

## 0.1.3
  - [+] 提供 `redirect` 方法，用于模块间跳转：
    - `redirect('news/modules/categories/modules/news', { cateId })`
    - `redirect('redux')`
    - `redirect('mypage', {}, { $offset: 20 })`
    - `redirect('')`
  - [/] 修复fish 主题登录页 loading 不居中的问题
  - [=] fish 主题面包屑优化

## 0.1.2
  - [-] 移除 redux-persist
  - [-] 移除 @sdp.nd/ndfront
  - [/] fish 升级到 2.0.2-dev（解决 autoprefixer 告警）
  - [/] 改用 moment（fish@2.0.1-dev 的时间控件使用的是 moment）
    - 影响：`yyyy-MM-dd` -> `YYYY-MM-DD`

## 0.1.1
  - [/] 解决一些告警
  - [=] 大幅升级依赖性

## 0.1.0
  - [*] **注意** 此版本存在重大变更，升级需要调整：
    - 依赖项
    - webpack 配置
    - src/index
  - [*] AE 目录结构大调整
  - [*] 将 polyfills 移到 AE 内部，业务上无需手动引入
  - [-] example 移到 `http://git.sdp.nd/fed/ae-boilerplate/tree/example`
  - [/] IE 10 下国际化问题解决

## 0.0.82
  - [+] actions 支持简写，reducers 可以省略，见 examples/redux
  - [*] 不建议在模块中声明 `children`
  - [/] `children` 问题修复（key 冲突、i18n 问题）
  - [/] `browserlist` to `browserslist`
  - [=] 一些优化

## 0.0.81
  - [/] 使用 `postcss-rtl-fish` 解决 fish 部分 animation 失效的问题

## 0.0.80
  - [/] themes/fish 不再引入 `fish/dist/fish.css`，改用按需加载 fish 的样式（需要修改 babel-plugin-import 配置）
  - [/] 使用 `postcss-rtl-sp` 解决 fish 部分 animation 失效的问题

## 0.0.79
  - [/] GET 请求参数带中文，服务端接口 `401` 问题修复

## 0.0.78
  - [/] 无力，RBAC 的服务端接口改了
  - [=] example 中 ckeditor 使用 CS 地址
  - [=] example 增加 template 目录，用于存放那些 ejs

## 0.0.77
  - [+] 装饰器 edit/detail 增加 `optimistic` 配置，以控制进入编辑/详情状态时是否总是向 source 取数据
  - [/] 一些隐藏的小问题修复

## 0.0.76
  - [+] 模块支持配置 `redirect`，实现路由跳转
  - [=] 添加部分单元测试代码

## 0.0.75
  - [+] 组件翻译优化（与模块的 react-intl 翻译一样，现在支持变量替换了）

## 0.0.74
  - [/] IE 10 兼容性问题

## 0.0.73
  - [*] **重要** 不再支持声明 `path` 为 `*` 的模块，请直接使用 `src/modules/.../404.js(x)`
  - [=] AE 会 merge 相同 scope 的模块的 state（见首页与 404 页）

## 0.0.72
  - [*] **重要** 不再支持声明 `path` 为 `/` 的模块，请直接使用 `src/modules/index.js(x)`
  - [*] **重要** 移除一级模块路由地址前的 `modules`（需要修改：src/index.js 与 webpack.config.babel.js）
  - [+] 没有自定义的 404 模块时，使用默认的 404 页
  - [/] 修改 package.json 中 main 字段
  - [/] 恢复 intl.js 中误删除的代码
  - [=] 一些模块加载与处理优化

## 0.0.71
  - [*] BaseComponent render nothing
  - [/] componentIntl 获取被包裹的组件实例

## 0.0.70
  - [/] Decorator/edit 按钮国际化
  - [=] RBAC 优化：不再重复获取国际化信息

## 0.0.69
  - [/] 获取 authorization 前，使用 encodeURI 对 URL 进行编码
  - [=] theme/fish 优化

## 0.0.68
  - [+] 自定义模块作为默认首页时，该模块的 bread 将被设置为第一个 bread（及替换默认的 Home）
  - [=] 模块解析与 fish/comp 的国际化并行加载，缩短等待时间

## 0.0.67
  - [+] 修复 render 方法返回 undefined 导致的报错

## 0.0.66
  - [+] AE 暴露 `formatPath`、`formatPattern`，参见 example/news 与 example/decorator
  - [+] themes/fish 切换语言时保留当前路由
  - [+] 401/403 提示现在支持国际化（在 locale/comp 里配置）
  - [+] Decorator 里的 label/title/content 等配置项会自动获取翻译
  - [+] Base 组件的 this.__ 方法支持获取组件的翻译了（以前只支持获取模块的翻译）
  - [-] **注意** 由于上一个特性，所以 componentIntl 不再为被装饰对象提供 props.__
  - [-] **注意** FieldHTML 的 componentConfig.editorConfig 用于 ckeditor 配置，其它配置不被识别
  - [*] AE 内部组件的国际化资源统一在 comp 里配置
  - [*] props.intl 修改为 props.aeInjectedIntl
  - [=] 简化路由地址：/_m/ 替代 /modules/，/_g/ 替代 /grid/，/_f/ 替代 /form/，增加 /_a/作为默认后缀
  - [=] themes/fish 左侧菜单优化

## 0.0.65
  - [+] **重要** 装饰器 create/edit/detail 支持配置是否弹窗显示
  - [+] 装饰器设置 detail 可以配置 label
  - [+] 装饰器设置 label 为空即可隐藏按钮/链接
    - 移除 list 装饰器的 hideReload 参数
  - [+] AEBase context 增加 source
    - source 增加 makeParams 与 makeKey 等方法
  - [=] fish 升级到 2.0.0-dev

## 0.0.64
  - [/] 修复数据国际化问题

## 0.0.63
  - [+] **注意** 模块的 component 支持使用 import() 实现按需加载
    - 理论上 Field 里的 component、displayRender、editRender 也支持，需要更多的测试
  - [+] 支持数据的国际化（服务端数据的国际化管理，有别于界面的国际化）（#何春霖）
  - [+] 增加翻译项：`UC/IDENTIFY_CODE_INVALID`
  - [/] 修复表单 buttons 问题
  - [=] fish/index 继承 components/base

## 0.0.62
  - [+] 向需要国际化的模块注入了 intl 属性
  - [+] components/Base 增加 __ 方法，作为 intl.formatMessage 的语法糖
  - [+] 全局（错误）消息提示支持国际化
  - [+] 装饰器 list 可以通过配置 hideReload: true/false 控制是否显示刷新按钮
  - [+] generateElement 支持传入 props
  - [*] **注意** Field 中的 componentConfig 属性重命名为 config，且支持静态属性 defaultConfig
  - [=] theme/fish 等国际化及样式优化

## 0.0.61
  - [+] RBAC 支持控制子模块、以及装饰器
  - [+] 值为 1 的 permission 转换为 `前缀_模块名`
  - [+] 装饰器的 pushButton 支持数组，可以一次 push 多个
  - [-] **注意** 为了支持更精确的权限控制，请不要在模块下直接设置 buttons，应该改用装饰器的 pushButton

## 0.0.60
  - [+] permission 支持`分号`与`逗号`分隔符，分别表示`或`和`与`，如`a;b,c`表示`a||(b&&c)`

## 0.0.59
  - [+] 支持地址栏传入 org_name
  - [+] 增加 RBAC 开关
  - [+] 支持自定义 RBAC 的 getPermissions 与 checkAuth 方法，见 example
  - [/] RBAC 问题修复
  - [/] 全局错误提示兼容 action 存在多个请求的情况

## 0.0.58
  - [+] 支持 RBAC 的权限控制
  - [*] 重命名 auth 模块 state 里的值，使用指向性更强的名称，以避免可能的冲突
  - [*] 移除 notShowMessage，改用自定义 metaCreator
  - [*] 重写 request，不在支持全局 interceptors
  - [=] fish 更新到 1.0.4

## 0.0.57
  - [+] 支持 auth 单点登录

## 0.0.56
  - [+] Grid 点击字段排序时保留地址上的查询参数
  - [+] Grid 点击搜索时保留地址上的排序参数

## 0.0.55
  - [/] 解决 Grid 分页与搜索请求参数缺失的问题

## 0.0.54
  - [/] 解决 search 搜索'单引号报权限错误的问题

## 0.0.53
  - [/] 解决 search 参数为空时数据搜索有误的问题

## 0.0.52
  - [/] 解决 Grid 翻页或删除数据后，selectedRowKeys未更新问题

## 0.0.51
  - [/] 解决 search placeholder问题
  - [/] 解决 Fish 主题 路由过滤的潜在问题

## 0.0.50
  - [=] 优化 Fish 主题 全局的错误提示兼容业务层和登录页面

## 0.0.49
  - [/] 解决 Fish 主题 登录的其他报错没有提示的问题

## 0.0.48
  - [/] 解决 Fish 主题 刷新登录页面报错的问题

## 0.0.47
  - [/] 解决 inject 业务模块不生效的问题（inject 例子参见 nested 下 的 x 模块）

## 0.0.46
  - [/] 统一修改 production 为 product，解决线上预生产构建问题
  - [+] 增加线上构建的pom.xml示例

## 0.0.45
  - [/] 解决 Fish 主题 propType 告警

## 0.0.44
  - [+] 公共 components 支持国际化（使用 antd 的 locale 方案，见默认首页）
  - [+] 通过设置 `path` 为 `/`，可以将模块设置为默认**首页**
  - [+] 通过设置 `path` 为 `*`，可以将模块设置为**404 页**，还支持为指定模块设置自己的 404 页
  - [-] **BREAKING CHANGES** 移除通过 theme 方法设置 Dashboard 与 NotFound 的功能
  - [/] 解决 Grid 排序问题
  - [*] 弃用 `babel-plugin-import`，改用在主题里主动引入 fish.css（需要修改 .babelrc）
  - [=] 主题样式优化，搜索样式优化
  - [=] MR#18, MR#19

## 0.0.43
  - [/] 解决了带有 description 的字段的验证提示不正确的问题
  - [=] example 中 modules/form 增加了 required 的国际化配置示例

## 0.0.42
  - [+] Fish 主题中的菜单可以显示图标了
  - [-] 移除了 Fish 主题中无用的 footer
  - [/] 解决登录验证码不显示的问题（#谢飞）
  - [/] 修复富文本编辑器修改不生效的问题
  - [=] 完善 AE 内置组件的国际化
  - [=] MR#17 Fish 主题 header 增加头像及更多语言选项
  - [=] Fish 主题的一些样式优化

## 0.0.41
  - [*] 使用 `SDP_ENV` 判断 SDP 环境，不再使用 `NODE_ENV`
  - [=] 移除无用的 es3ify（见 webpack 配置文件） 与 polyfill/shim（见 index.ejs）

## 0.0.40
  - [/] 兼容 IE 10+

## 0.0.39
  - [/] 修复Grid列表请求带参问题

## 0.0.38
  - [*] 禁用的 decorator 将不再被执行
  - [+] example 里增加全局 utils/interceptors
  - [=] 优化 Grid 分页获取（避免重复请求）

## 0.0.37
  - [/] 修复装饰器表单不显示问题

## 0.0.36
  - [/] 修复翻页跳页失败问题

## 0.0.35
  - [+] search 支持更多的 config
  - [/] 翻页注释回滚
  - [=] 装饰器默认的 buttons 移入 defaultConfig

## 0.0.34
  - [+] search 布局优化（#郑美双）
  - [*] fish 样式优化（#郑美双）
  - [/] 修复 Grid 路由点击两次返回才能返回上一个的问题

## 0.0.33
  - [+] MR#13 增加主题国际化支持
  - [+] 自定义的 Dashboard 与 NotFound 支持国际化

## 0.0.32
  - [+] 新闻管理增加评论管理
  - [*] 优化 news 模块中的 grid 跳转
  - [*] 优化左侧菜单
  - [*] 优化 rest-actions/reducers：针对不同的请求实现最小化更新 state
  - [/] 修复装饰器 detail 切换时读取不到最新 params 的问题

## 0.0.31
  - [+] MR#14 删除条目后本页为空则自动翻页

## 0.0.30
  - [/] 解决 delete 接口返回空数据导致界面不刷新的问题
  - [/] 解决国际化资源加载前的 react-intl 告警问题
  - [/] 回滚 request

## 0.0.29
  - [*] MR#12: 更精确的加载模块配置正则
    - **BREAKING CHANGES** 现在业务模块的路由都是以 modules 开头
  - [*] i18n 优化，现在禁用 i18n 不需要显式地传入 `i18n: false`，AE 会根据函数的形式参数的长度智能判断，为 2 时才加载 i18n 资源：
    ```js
    // 禁用
    export default scope => ({...})
    export default () => ({...})
    // 启用
    export default (scope, __) => ({...})
    ```
  - [/] 修复 Grid 数据更新界面不刷新的问题

## 0.0.28
  - [/] 修复 InputNumber 的问题

## 0.0.27
  - [/] request sdp-app-id 注释回滚

## 0.0.26
  - [/] 修复子模块 redux 问题

## 0.0.25
  - [*] 装饰器 detail 不再显示 field 的 description
  - [/] 修复 i18n 问题
  - [/] 修复 Grid 删除项列表数据不刷新的问题

## 0.0.24
  - [+] example news 模块重写为自动解析子模块
  - [*] **BREAKING CHANGES**
    - bootstrap 方法重写， 不再接收参数，但增加 ns 与 req 方法
    - AE 默认向全局注入 ORIGINS，并与业务提供的 ORIGINS 合并
  - [/] 不再写死 RenderUser 中 UC 地址

## 0.0.23
  - [*] example 中 ORIGINS 不再使用 webpack define，使用全局的 ORIGINS
  - [*] 确保模块的显示的顺序与加载时的顺序保持一致

## 0.0.22
  - [+] **重大变更** 实现多级菜单/子模块，现在有两种方法
    - 在 module 里定义 children
    - 按指定的目录规范存放的文件，AE 将自动加载为子模块，参见 nested
  - [+] **重大变更** 现在默认各模块都会加载 i18n 文件，可以手动禁用，参见 auth/base/nested
  - [+] 嵌入到 iframe 时只显示 main（用于支持聚合后台）
  - [+] fish 主题样式优化
  - [*] 当分页数等于 1 时，不显示分页组件
  - [*] 为了避免冲突与歧义，grid 路由 params 中的 action 重写为 act
  - [/] 修复自定义装饰器的按钮点击没有响应的问题
  - [/] 修复路由上存在非可选的 params 时，从编辑页跳回列表提示参数缺失的问题

## 0.0.21
  - [+] 增加国际化支持
  - [+] 当前语言的优先级：location.search > navigator.language
  - [+] 添加 fish 的 localeProvider，支持组件自动渲染为指定语言
  - [*] 不再默认继承 scope，子级默认生成新的 scope，不再支持自定义 scope
  - [/] 回滚 auth

## 0.0.20
  - [+] decorators 配置项支持 enforce 参数，可选值为 pre|post，用于调整顺序
  - [-] theme() 方法不再接收字符串作为参数（因为 webpack 会打包所有可能被动态 require 的内容）
  - [*] 重写 ae/index
  - [/] 修复 Grid 类左侧菜单地址被 deco/id/action 乱入的问题

## 0.0.19
  - [*] 路由优化，支持 Grid 跳子 Grid，参看 news（需要手动将 request 中的 sdp-app-id 注释掉才能 Demo）
  - [*] 面包屑优化，支持替换 name / menu.title 中的变量，比如 `新闻<:id>` -> `新闻<123>`
  - [/] 修复二次进入 Grid，loading 状态不正确的问题

## 0.0.18
  - [+] 增加 Dashboard 配置
  - [+] field 的 validator 的 this 指向 form，可用于做关联校验等
  - [*] 优化 schema 中的 hidden 逻辑

## 0.0.17
  - [/] 修复 fish theme 错误消息提示问题
  - [/] 修复修复 Form 默认按钮丢失的问题引发的问题

## 0.0.16
  - [+] 增加国际化支持，基于 i18n-webpack-plugin，见 example
  - [/] 修复 Form 默认按钮丢失的问题

## 0.0.15
  - [+] 增加面包屑

## 0.0.14
  - [+] 表单验证支持完善
  - [+] 表单支持组合字段，即字段内可以设置 fields，参见 profile 模块

## 0.0.13
  - [+] 表单的 decorators/config 支持配置 onLoad
  - [+] hidden 字段现在在表单上渲染为 input[hidden]
  - [-] 移除 links，统一使用 menus
  - [-] 移除 themes/classic
  - [-] 移除 decorators/paginate 的 page/size 模式
  - [*] 优化列表获取：由 decorators/list 发起请求
  - [*] redux-persist 现在只处理 auth
  - [*] 优化了 services/uc
  - [*] 优化了退出功能：直接退出，不等 ucsdk 返回，因为太慢了
  - [/] 修复路由跳转问题：编辑表单无法返回列表
  - [/] 修复路由更新问题：装饰器信息不应更新到 route._originalParams
  - [/] 修复 globalMessage 为空的问题

## 0.0.12
  - [+] 增加数字输入框，type 为 number 的字段使用
  - [+] 增加 File Field，支持文件上传，参见 news
  - [+] 增加全局错误提示
  - [+] 增加 Switch Field

## 0.0.11
  - [+] 支持对 Grid 指定带 params 的 path，参见 news
  - [+] 编辑、新建成功后默认跳转到列表（自定义功能待开发）
  - [+] 增加全局属性 isLoading 与 globalMessage

## 0.0.10
  - [/] 修复全新进入详情页不获取数据的问题
  - [-] 现在装饰器只从装饰器的配置项里取 buttons，全局的 buttons 只用于 Grid/Form 本身

## 0.0.9
  - [+] 重写了装饰器逻辑，支持自定义装饰器
    ```js
    decorators: {
      myDeco: {
        decorator: function myDeco(WrappedComponent) {
          return myDecorateComponent extends AEDecorator {
            render () {
              return <WrappedComponent ... />
            }
          }
        }
      }
    }
    ```
  - [+] source 不需要定义 indentity 了，AE 会自动去 schema 里取 primary：第一个 primary 为 id，剩下的为 queryKeys
  - [*] 全局的 buttons 支持设置 scope（'list' 或 'item'）
  - [/] 装饰器 list 不再支持 buttons，请直接在上级添加 buttons

## 0.0.8
  - [+] 表格支持批量操作
  - [+] 对某一条信息隐藏装饰器，使用配置项 `shouldHookItem`
  - [/] 修复 paginate 被禁用时 Grid 不发起请求的问题
  - [/] 修复当只有一个 primary field 时，detail 插件无数据的问题

## 0.0.7
  - [+] 提供 `ae/shared/request`
  - [+] 装饰器 create 支持配置 `label`
  - [*] 装饰器提供 `pushButton`，用于添加操作按钮
  - [/] 修复 Grid 编辑页刷新无法自动获取数据
  - [/] 修复 CKEditor 内容不更新的问题
  - [/] 修复 Form 重置功能无效的问题

## 0.0.6
  - [+] `source` 支持配置 `interceptors`，返回值支持同步与异步
  - [+] Form 增加 action `back`，实现 `history.back()`
  - [*] 装饰器 detail 直接使用 Form 组件展示页面
  - [/] 修复装饰器 detail 多次修改 field.component 导致报 a 不能嵌套 a 的错误

## 0.0.5
  - [+] 自动注册 ae/componnets/**
  - [*] ae/componnets 下的文件统一为大驼峰风格
  - [*] layouts 重命名为 themes
  - [/] AEBase auth state 读取错误

## 0.0.4
  - [+] 子模块会自动继承父模块的 `state/actions`（通过 props 传递实现），所以请注意避免冲突，框架不再处理冲突
  - [+] 支持注入其它模块的 `state/actions`，见 `模块定义（Definition）` 中 `inject` 配置
  - [+] edit 装饰器支持配置 buttons，见 example/mypage
  - [-] 移除 `$prop` 与 `$action` 方法
  - [*] 注入的 `state/actions` 不再添加 namespace（之前是以 scope 为 namespace）
  - [/] 装饰器 BUG 的修复
