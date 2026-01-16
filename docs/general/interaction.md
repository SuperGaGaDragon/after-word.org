
 layout.html（这是主页，用户输入after-word.org，会进入这个页面）
访问路径：https://after-word.org
页面类型：主页 + 工作区统一入口
 
如果 判断 用户已登录（浏览器存放在有效JWT），则可以正常使用。
如果 判断 用户未登录，则当他点击一切按钮（除了方块6）时，都会出现弹窗："Signup/Login for full experience"
 
 方块1:New work 按钮
 方块2:work历史
 方块3:编辑板
 方块4:LLM comment记录存储。
 方块5:到时候删掉，不需要方块5
 方块6: 在画面右上角,如果判定为已登陆，展示用户用户名，点击后进入账号设置；如果判定为未登陆，展示"login/signup"
 方块7:About us

 如果用户进入，没有任何操作，方块4不出现
 方块1: "New work" 按钮。按下之后，调动storage/work ，自动创建id。
 
 显示规则：始终显示
点击行为：如果用户未登录：弹出提示弹窗文案：“Signup / Login for full experience”.行为结束，不执行后续操作

如果用户已登录：
前端触发 New Work 点击事件
前端向后端请求创建一个新的 work
后端返回一个新的 work_id
前端执行以下操作：
将当前激活的 work 设置为该 work_id
清空编辑板内容（方块 3）
隐藏 LLM comment 区域（方块 4）
将该 work 添加到左侧 work 历史列表（方块 2）
页面保持在当前 workspace，不进行页面跳转

方块2:work历史列表
内容说明：
显示当前用户的所有 work
排序方式：最近更新时间优先
点击行为：
如果用户未登录：
弹出统一登录提示弹窗，不切换内容

如果用户已登录：
用户点击某一条历史 work
前端向后端请求该 work 的内容
编辑板（方块 3）加载对应内容
LLM comment 区域（方块 4）默认隐藏
该 work 成为当前激活 work

方块3:编辑板
行为说明：
文本编辑区域
仅允许编辑当前激活的 work
用户已登录时：
可自由编辑文本
前端应定时自动保存内容（例如每 30 秒）
编辑行为本身不会触发 LLM
用户未登陆时，锁死，禁止编辑。

方块 4：LLM Comment 按钮
点击后，出现可移动，可以自由调整大小的方块，展示llm历史评论。
用户永远无法自由调动LLM。只能点击“comment current work" 按键让他对当前文本评论。
comment 以只读形式展示
comment 与当前 work 绑定
重要约束：
LLM comment 永远不会修改编辑板内容

方块5：不重要，删了

方块6: 
用户已经登陆-显示用户名-点击后进入after-word.org/account
用户未登陆-显示login/signup，进入after-word.org/login

方块7：
点击后进入after-word.org/about （暂时不急这写）



统一强约束规则
未登录用户
永远不能触发真实后端写操作
所有按钮点击统一行为：提示登录
LLM 行为
只能由用户主动触发
永远只读取当前编辑板内容
永远不自动生成、不实时生成
页面行为
所有 work 的创建与切换均在当前页面完成
不进行整页跳转

