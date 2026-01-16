Project Intro
目录
A)文件结构和逻辑
B)文件架构


A）文件结构和逻辑
afterword/docs#存放所有文件。强约束：所有文件必须写在这里。
afterword/docs/implementation 存放所有可以直接落地的计划文件，给牛马员工看。牛马晕啊公不需要查看afterword/docs/general里的总计划，他们只要完成这些，就可以保证总计划完成。
afterword/requirements.txt

I. afterword/LLM：锁死，不要动他，大模型的微调在这个里面。


II. afterword/backend：使用本地部署。LLM在本地7979端口跑。挂在llm.after-word.org上做内网穿透。

backend/tests #存放所有测试。

backend/storage #所有数据都储存到postgres数据集
storage/user #存储用户信息：仅保存-email，密码，用户名
storage/user_retrieve #检索用户记录，用于登录
storage/work #用户自己的作品。用户可以自行修改。storage包括项目id，用户email，文档内容。
storage/work/retrieve
storage/conversation #Postgres新建表格，包含和他的work对齐的项目id，用户email（因为email不让重复，所以可以当用户id用，用于检索），对话内容
storage/conver_retrieve #检索对话记录，在用户端分清楚“谁的是谁的”，方便随时调用。



backend/api #使用fast api

backend/llm_call #调用LLM，包含prompt也放在这里。LLM目前只具备一种调动形式：阅读当前编辑板文本，生成评论。目前虽然叫conversation，但是用户只能通过在前端点击“generate comment”之后，自动生成对当前文本的comment（前期demo）

backend/modules #和前端对齐
Modules/auth #登录等账号验证
modules/auth/JWT #JWT,设定失效时间为60分钟。
modules/auth/check #其他地方会被调用的一个method，主要是审查用户名、邮箱和数据库中的是否会有重复。
modules/auth/login #负责1、和storage/user的交互 2、和storage/user_retrieve的交互 3、调用chec查看是否存在
modules/auth/signup #负责2、和storage/user的交互 2、审查机制：调用modules/auth/check检索是否有一样的邮箱，检索是否有一样的用户名。如果有，则禁止注册。
modules/auth/change #支持更改密码。更改密码流程：要更改密码，新密码输入两次，只要两次匹配，且和旧密码不同，就自动更改密码。用户名随便更改，调用check method，只要和数据库中的不同，就可以。email锁死，email禁止修改，因为当作用户id使用


modules/work
对应衔接storage/work，但是这里的work更多在意1、前端的剪切板交互，2、每隔30秒的云保存3、每次只允许一个用户修改。只要有一个设备上线了，其他的（tab也好，设备也好）上线，都直接禁止进入。使用Redis key单设备锁


III. afterword/frontend #明确的vertical slice，三端分离：HTML（纯画格子），事件，style（css渲染）

frontend/Modules 
index.html #必须要有的入口，cloudflare要用



modules/accountSetting
accountSetting/layout #纯粹的layout（见frontend_intro.md)
accountSetting/events #事件：允许更改用户名，允许更改密码。调用backend/modules/auth/change。但是一切的显示output（如：密码不匹配，请再次尝试）等，全部在这里展示。
accountSettings/style #渲染（见frontend_intro.md)

modules/login
Login/layout#纯粹的layout（见frontend_intro.md)
Login/events #调用modules/auth/login。如果找不到用户或者密码不匹配，产生的文字在前端展示。
Login/style（见frontend_intro.md)

modules/signup

signup/layout 
signup/events #调用modules/auth/signup
signup/style

modules/workspace #真正的文书工作区。文书工作区氛围左右两个板块，左边1/6历史记录，右边5/6是工作区。右下角有一个按钮可以召唤LLM对当前作品作出评论（LLM无法进行任何修改）

workspace/layout

Workspace/events

Events/history 和storage/work/retrieve衔接
Events/llm_call 和backend/llm_call衔接
Events/work 和 backend/modules/work衔接

Workspace/style





B)文件架构

一、架构

如下是系统唯一合法调用，任何组件不得反向依赖。LLM组件为侧边组件，不参与主数据（他只是看到了，output，他并不知道存储等任何事情。

Frontend
   
｜

API
   
｜
组件（核心业务层）
Auth Component       
Work Component       
Conversation Comp.   
LLM Gateway Comp.    
Session/Lock Comp.   

｜

Storage


二、组件约束

1、frontend：没有任何实际权力，一切的请求等必须通过backend执行。
2、api layer：只负责HTTP 协议处理 参数校验 JWT 校验与解析 异常映射（业务异常 → HTTP 状态码，禁止写任何业务逻辑。




3、Storage Layer（持久化层）组件约束 
职责 存储系统事实数据 提供 CRUD 接口 
允许行为：被 Domain Components 调用 
禁止行为： 调用任何业务组件 实现业务规则 调用 LLM 校验权限逻辑 Storage 是 事实源，不是逻辑源。
4、仅核心业务层可以修改业务逻辑。



核心业务层：
1、4.1 Auth Component（身份组件）：
用户注册、登录、凭证变更 定义用户唯一性规则（email 唯一） 
允许：依赖 Storage/User Storage/User_Retrieve 
禁止： 访问 Work 数据  访问 Conversation 数据  调用 LLM  控制编辑权限 
Auth 只定义“人是谁”，不定义“人能干什么”。
2、4.2 Work Component（作品组件）
 职责 管理用户作品（Work / Project） 控制文档内容修改 强制单设备编辑规则 执行自动保存逻辑 
允许依赖： Auth Component（仅获取 user identity） Storage/Work Session / Lock Component 禁止行为： 调用 LLM 修改 Conversation 数据  绕过 Session / Lock  接受未认证的用户上下文 Work Component 是 内容唯一事实的守门人。
3、 Conversation Component（对话组件） 
职责：管理围绕 Work 的对话记录 保证对话与 project_id 的一致性 
允许依赖：Auth Component Work Component（仅校验 project 合法性） Storage/Conversation 禁止行为：修改 Work 内容  控制编辑权限  调用 Storage/Work 写操作  直接调用 LLM（必须通过 LLM Gateway） Conversation 是 记录，不是控制者。
4、Session / Lock Component（会话锁组件） 
职责：管理 Work 的编辑占用状态 保证同一时间仅允许一个设备编辑 
允许依赖：Redis / Postgres（锁存储） 
禁止行为：访问业务数据内容 调用 Auth / Work / Conversation  知道用户密码、文档内容 Session / Lock 是 纯约束组件，不包含业务语义。
5、LLM Gateway Component（LLM 网关组件） 
职责：接收内容快照 构建 prompt 调用本地 LLM 服务 返回生成结果 允许依赖 本地 LLM Runtime（HTTP） 
禁止行为（硬约束）：  访问任何 Storage  修改任何系统状态  接收 JWT 或用户凭证  直接被 Frontend 调用 
LLM Gateway 是 只读、纯函数式外部计算单元。




六、架构违规判定标准（用于自检）
 以下任意情况出现，即为架构违规：
 LLM 修改数据库 
Frontend 判断“是否允许编辑” 
API 层拼 prompt Conversation 
反向控制 Work 
Work 未经过 Session / Lock 写入 Storage 中存在业务判断逻辑