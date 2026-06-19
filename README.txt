AI Phone 微信本地助手

宝宝级安装启动教程（完全新手也能照着做）

先记住三件事：
1. 这个工具不会自带你的真实 Supabase URL，也不会自带你的 service_role key。
2. 第一次使用前，你需要准备自己的 Supabase URL 和 service_role key。
3. 这些东西都是隐私，不要发给别人，不要放到公开 GitHub 仓库里。

项目 GitHub 地址：
https://github.com/qishiwan16-hub/floatweixinbot.git

一、首次配置前要准备什么

1. 准备 Supabase URL。
   - 这是你的 Supabase 项目地址。
   - README 里不会写真实地址，你要用自己的。

2. 准备 Supabase service_role key。
   - 这是权限很高的私密 key。
   - 只能自己用，不能发群里，不能截图给别人，不能提交到 GitHub。

3. 准备微信运行包。
   - 每次启动本地助手前，都先去“小手机”提交远程备份/上传最新微信运行包。
   - 这样本地助手才能从远端读取最新的微信登录状态、角色、预设、记忆等信息。

二、Termux 安装/启动教程（安卓手机上用，推荐一键复制命令）

第 1 步：安装并打开 Termux

1. 在安卓手机上安装 Termux。
2. 打开 Termux。
3. 如果手机弹出存储权限，请允许。

第 2 步：复制推荐的一键 Bash 命令

在 Termux 里复制下面这一整行，然后按回车：

pkg update -y && pkg install -y git bash && rm -rf floatweixinbot && git clone https://github.com/qishiwan16-hub/floatweixinbot.git && cd floatweixinbot && bash termux-install.sh

这条命令会自动做这些事：
1. 更新 Termux 软件源。
2. 安装 git 和 bash。
3. 删除旧的 floatweixinbot 文件夹，避免新手重复安装时进入旧目录。
4. 从 GitHub 下载最新项目。
5. 进入 floatweixinbot 项目文件夹。
6. 运行 termux-install.sh。
7. 安装 Node.js，并进入 termux-start.sh 启动流程。

第 3 步：可选 Raw 一键 Bash 命令

如果你想用 GitHub Raw 方式，也可以复制下面这一整行：

pkg update -y && pkg install -y curl bash && curl -fsSL https://raw.githubusercontent.com/qishiwan16-hub/floatweixinbot/main/termux-install.sh | bash

Raw 方式会先运行远端 termux-install.sh。脚本会自动安装必要依赖，检测当前是否已经在项目目录；如果不在项目目录，会自动克隆或更新 https://github.com/qishiwan16-hub/floatweixinbot.git，然后进入启动流程。

第 4 步：手动安装方式（备用）

如果一键命令失败，再按下面方式一行一行输入：

pkg update -y
pkg install -y git bash
rm -rf floatweixinbot
git clone https://github.com/qishiwan16-hub/floatweixinbot.git
cd floatweixinbot
bash termux-install.sh

手动方式和一键命令做的事情一样：安装依赖、下载项目、运行安装脚本、进入启动流程。

三、Termux 启动教程（以后每天/每次这样启动）

第 1 步：复制每天启动命令

如果你已经完成过首次安装，刚打开 Termux 后，复制下面这一整行，然后按回车：

cd floatweixinbot && bash termux-start.sh

这条命令会进入项目文件夹，并运行 termux-start.sh 启动脚本。

如果提示找不到 floatweixinbot 文件夹，说明你现在不在当初下载项目的位置。你可以重新回到当初保存项目的目录，再执行上面这条每天启动命令。

第 2 步：先做远程备份

启动脚本会先提醒：
请先去小手机提交远程备份/上传最新微信运行包。

你要这样做：
1. 先不要急着继续 Termux。
2. 打开“小手机”。
3. 提交远程备份/上传最新微信运行包。
4. 确认上传完成。
5. 回到 Termux，按回车继续。

第 3 步：选择要不要打开配置页

脚本会问你：
是否打开本地配置页？输入 y 打开配置页，输入 n 跳过配置页并直接启动助手 [y/n]

你有两个选择：

选择 A：输入 y

适合这些情况：
1. 第一次使用。
2. 你还没有 config.txt。
3. 你换了 Supabase URL。
4. 你换了 service_role key。
5. 你想重新保存配置。

输入 y 后会启动本地配置页：
http://127.0.0.1:8787

然后你这样做：
1. 用同一台手机的浏览器打开 http://127.0.0.1:8787。
2. 在网页里填写你自己的 Supabase URL。
3. 在网页里填写你自己的 service_role key。
4. 可以先点“测试连接”，它会读取默认 Bucket ai-phone-backup 里的 weixin-cloud/index.json，确认能访问远端运行包索引。
5. 点“保存配置”。
6. 保存成功后，页面会明确显示“Supabase URL 已写入 config.txt”，并显示写入的是哪个 URL；service_role key 只显示打码，不会明文展示。
7. 保存成功写入 config.txt 后，页面会尝试删除本机目录里的 config.example.txt，避免你把示例文件和真实配置搞混；删除失败不会影响 config.txt 保存成功，页面会显示失败原因。
8. 回到 Termux。
9. 按回车继续启动助手。

如果以前保存过配置：
1. 页面会自动回填已保存的 Supabase URL。
2. 页面当前状态会提示“已读取到本地配置，URL 已写入 config.txt”。
3. service_role key 不会明文显示，只显示打码占位。
4. 不填 key 会沿用已保存 key。
5. 点击 key 输入框可以重新输入新的 key。

选择 B：输入 n

适合这些情况：
1. 你已经配置过。
2. config.txt 已经存在。
3. 这次不想改配置。

输入 n 后，脚本会跳过配置页，直接启动助手。

第 4 步：测试一次/排查连接（可选）

如果你不想一直运行助手，只想先看看配置和连接有没有问题，可以在项目目录运行：

bash termux-test-once.sh

或者已经给脚本执行权限时运行：

./termux-test-once.sh

这个 Termux 测试脚本只会单次运行，不会一直轮询。它主要帮你看这些内容：
1. 当前目录里有没有 assistant.mjs。
2. Termux 里有没有 Node.js。
3. 本地有没有 config.txt。
4. Supabase 是否能连接，配置是否能读到。
5. 远端 Bucket 里是否能读到 weixin-cloud/index.json 和最新微信运行包。
6. 微信 token/运行包是否还能正常读取微信消息。

运行前也要先去小手机提交远程备份/上传最新微信运行包。测试过程中请认真看 Termux 日志；如果看到 Supabase GET/LIST/PUT 失败，就检查 URL/key 和 Bucket；如果看到 object_not_found:weixin-cloud/index.json 或轮询 0 个 Bot，就检查小手机有没有备份；如果看到 Token 已过期或微信接口失败，就回小手机重新扫码/刷新 token 后再备份。

Windows 上仍然可以继续使用 测试一次.bat 做单次测试。

四、Windows 启动教程（电脑上用）

第 1 步：下载项目

方法 A：用 Git 克隆

在命令提示符或 PowerShell 里输入：

git clone https://github.com/qishiwan16-hub/floatweixinbot.git

然后进入项目文件夹：

cd floatweixinbot

方法 B：从 GitHub 下载压缩包

1. 打开项目地址：https://github.com/qishiwan16-hub/floatweixinbot.git
2. 下载 ZIP 压缩包。
3. 解压到一个你找得到的文件夹。
4. 打开解压后的项目文件夹。

第 2 步：准备 Node.js 20+

1. 如果发布包里带 runtime\node.exe，可以直接用。
2. 如果没有自带 runtime\node.exe，就需要自己安装 Node.js 20 或更高版本。
3. 如果双击启动时提示 Node.js was not found，就去安装 Node.js 20+，然后再启动。

第 3 步：准备配置

Windows 推荐也使用本地配置页生成 config.txt。

1. 在项目文件夹里打开命令提示符或 PowerShell。
2. 运行：node termux-config-server.mjs
3. 用浏览器打开 http://127.0.0.1:8787。
4. 填写你自己的 Supabase URL 和 service_role key。
5. 可以先点“测试连接”，它会读取默认 Bucket ai-phone-backup 里的 weixin-cloud/index.json，确认能访问远端运行包索引。
6. 点“保存配置”，程序会自动生成 config.txt。
7. 看到页面提示“Supabase URL 已写入 config.txt”后，确认显示的是你自己的 URL；service_role key 只会打码显示，不会明文展示。
8. 写入 config.txt 成功后，配置页会尝试删除本机目录里的 config.example.txt；删除失败不会影响保存，页面会显示失败原因。
9. 回到命令行窗口按 Ctrl+C 停止配置页。
10. 不要把真实 config.txt 发给别人，也不要提交到公开仓库。

如果以前保存过配置：
1. 页面会自动回填已保存的 Supabase URL。
2. 页面当前状态会提示“已读取到本地配置，URL 已写入 config.txt”。
3. service_role key 不会明文显示，只显示打码占位。
4. 不填 key 会沿用已保存 key。
5. 点击 key 输入框可以重新输入新的 key。

第 4 步：正常启动

在项目文件夹里，双击：
启动助手.bat

窗口不要关。窗口开着时，助手会持续轮询微信消息并自动回复。

第 5 步：单次测试

如果你只是想检查配置能不能跑，不想一直运行，可以双击：
测试一次.bat

它只轮询一次，适合测试配置是否正常、Supabase 是否能连接、远程运行包和微信 token 是否能读取。Termux 用户请用 termux-test-once.sh。

五、什么时候需要重新打开配置页

只要你换了配置，就重新打开配置页保存一次。

Termux 上的做法：
1. 复制每天启动命令：cd floatweixinbot && bash termux-start.sh。
2. 先完成小手机远程备份。
3. 问你是否打开配置页时，输入 y。
4. 浏览器打开 http://127.0.0.1:8787。
5. 填新的 Supabase URL；如果只是换 URL 且 key 不变，可以不填 key，系统会沿用已保存 key。
6. 如果要更换 key，点击 key 输入框重新输入新的 service_role key。
7. 可以点“测试连接”确认能读取 ai-phone-backup/weixin-cloud/index.json。
8. 保存后看页面提示，确认 Supabase URL 已写入 config.txt；key 只会打码显示。
9. 保存成功写入 config.txt 后，页面会尝试删除本机目录里的 config.example.txt；如果删除失败，页面会把原因写出来，但不会影响配置保存成功。
10. 回到 Termux 按回车继续。

六、更新教程/以后更新项目（宝宝级）

先记住：更新项目不等于把你的真实配置发出去。config.txt 是你自己的隐私文件，不要发给别人，不要截图公开，不要提交到 GitHub。

方法 A：已经用 Git 克隆过项目，直接 git pull 更新

1. 打开 Termux。
2. 进入项目目录：

cd floatweixinbot

3. 拉取 GitHub 最新代码：

git pull

4. 更新完成后，正常启动：

bash termux-start.sh

5. 启动前还是要先去“小手机”提交远程备份/上传最新微信运行包。

方法 B：重新运行一键安装命令

如果你不确定自己有没有进对目录，也可以重新复制首次安装的一键命令：

pkg update -y && pkg install -y git bash && rm -rf floatweixinbot && git clone https://github.com/qishiwan16-hub/floatweixinbot.git && cd floatweixinbot && bash termux-install.sh

这条命令会重新从 GitHub 克隆最新项目，然后进入安装/启动流程。注意：它会先删除当前目录下旧的 floatweixinbot 文件夹，所以如果旧文件夹里有你想保留的东西，请先自己备份；尤其不要把自己的 config.txt 发给别人。

方法 C：Raw 一键命令也可以更新/重新克隆

你也可以重新运行 Raw 方式：

pkg update -y && pkg install -y curl bash && curl -fsSL https://raw.githubusercontent.com/qishiwan16-hub/floatweixinbot/main/termux-install.sh | bash

Raw 脚本会自动检测当前是否在项目目录；如果不在项目目录，会自动克隆或更新 https://github.com/qishiwan16-hub/floatweixinbot.git，再进入启动流程。

更新前后注意事项：
1. 不要把自己的 config.txt 发给别人。
2. 不要把 Supabase URL 或 service_role key 发给别人。
3. 更新后如果 config.txt 还在，并且你不需要换配置，启动时可以输入 n 跳过配置页。
4. 更新后如果配置丢失，或者你需要更换 Supabase URL/key，启动时输入 y 打开本地配置页重新保存。
5. 本地配置页保存后会明确提示 Supabase URL 已写入 config.txt，并显示写入的是哪个 URL。
6. service_role key 只会打码显示，不会明文显示。
7. 写入 config.txt 成功后，页面会尝试删除本机目录里的 config.example.txt，避免你把示例配置当成真实配置；删除失败也不会影响 config.txt 保存成功。

七、非常重要的注意事项

1. 每次启动前，先去小手机提交远程备份/上传最新微信运行包。
   - 不做这一步，本地助手可能读到旧数据。
   - 旧数据可能导致角色、预设、记忆、微信状态不是最新。

2. Supabase URL 是隐私。
   - 不要发给别人。
   - 不要截图公开。
   - 不要提交到公开 GitHub 仓库。

3. service_role key 是更重要的隐私。
   - 它权限很高。
   - 不要发给别人。
   - 不要写进 README。
   - 不要提交到公开 GitHub 仓库。

4. config.txt 是隐私文件。
   - 它包含连接远端需要的信息。
   - 不要提交到公开仓库。
   - 不要打包发给别人。
   - config.example.txt 只是示例说明，不包含真实可用密钥。

5. 如果微信 token 过期：
   - 本地助手可能无法继续正常收发微信消息。
   - 需要回到小手机重新扫码/刷新 token。
   - 刷新后再让小手机提交远程备份/上传最新微信运行包。
   - 然后重新启动本地助手。

6. 默认 Bucket：
   - 默认使用 ai-phone-backup。
   - 普通用户不需要改。
   - 除非你明确知道自己在改什么，否则保持默认。

7. Node.js 版本要求：
   - 需要 Node.js 20 或更高版本。
   - Termux 可以复制推荐的一键 Bash 命令自动安装，也可以在项目目录执行 bash termux-install.sh。
   - Windows 如果提示找不到 Node.js，就安装 Node.js 20+，或者使用带 runtime 的发布包。

八、常见启动失败排查

1. 提示缺少配置

可能原因：
- 没有 config.txt。
- config.txt 是空的。
解决办法：
- Termux：运行 ./termux-start.sh，输入 y 打开配置页，保存配置。
- Windows：运行 node termux-config-server.mjs，打开 http://127.0.0.1:8787 保存配置。

2. 提示配置格式不正确

可能原因：
- config.txt 不是本工具生成的配置。
- config.txt 内容被手动改坏。
- config.txt 复制时多了说明文字或少了一段内容。

解决办法：
- 重新打开配置页，填写 Supabase URL 和 service_role key 后保存。
- 如果只是更换 Supabase URL 且 key 不变，可以不填 key，系统会沿用已保存 key。

3. 测试连接失败

先说清楚“测试连接”到底测什么：
- 它只测试配置页上那一份表单：当前填写的 Supabase URL + 当前 key（key 留空且已保存过，就用旧 key）。
- 它会去读取默认 Bucket ai-phone-backup 里的 weixin-cloud/index.json。
- 测试成功：说明 URL、key、Bucket、网络都正常，而且远端已经有 weixin-cloud/index.json 运行包索引。页面会显示 HTTP 状态、正在测试的 URL、读取的对象路径、index 更新时间和运行包数量。
- 测试失败：说明上面某个环节有问题。页面会显示中文失败原因、正在测试的 URL 和读取的对象路径，并且不会让 Node 进程崩溃，也不会让页面卡死。

可能原因：
- Supabase URL 填错。
- service_role key 填错或权限不足（页面会提示 HTTP 401/403）。
- 默认 Bucket ai-phone-backup 不存在（页面会提示 HTTP 400/404）。
- weixin-cloud/index.json 还没有上传（页面会提示找不到对象）。
- 手机或电脑当前网络无法访问 Supabase（页面会提示网络请求失败）。

解决办法：
- 检查 Supabase URL 和 service_role key。
- 先让小手机提交远程备份/上传最新微信运行包。
- 再回配置页点“测试连接”。页面会显示具体失败原因，不会因为测试失败退出 Node 进程。
- Termux 也可以在项目目录运行 bash termux-test-once.sh，看一次完整日志。

4. 提示 Node.js was not found 或未检测到 Node.js

解决办法：
- Termux：复制推荐的一键 Bash 命令，或在项目目录执行 bash termux-install.sh。
- Windows：安装 Node.js 20+，或者使用带 runtime\node.exe 的发布包。

5. 能启动，但微信消息不同步

可能原因：
- 启动前没有在小手机提交远程备份。
- 微信 token 过期。
- 小手机上传的运行包不是最新。

解决办法：
- 回小手机提交远程备份/上传最新微信运行包。
- 如果 token 过期，回小手机重新扫码/刷新 token，再重新备份。
- 重新启动本地助手。

6. Termux 输入 y 后打不开配置页

解决办法：
- 确认 Termux 窗口还在运行。
- 用同一台手机浏览器打开 http://127.0.0.1:8787。
- 不要把 127.0.0.1 换成别人的手机或电脑地址。
- 如果仍然打不开，按 Ctrl+C 停止后重新运行 cd floatweixinbot && bash termux-start.sh。

7. 配置页还显示“方式二 / 粘贴完整配置码”

先记住：现在的本地配置页只有一种配置方式，就是直接填写 Supabase URL 和 service_role key。页面上不再有“方式二”，也不再有“配置码”输入框。

如果你还看到“方式二”或“配置码”，说明你打开的是旧页面，不是脚本没更新就是旧服务没重启。请按下面顺序排查：
- 看配置页最上方有没有“页面版本”字样。新版页面会显示页面版本号；如果完全没有版本号，就是旧页面。
- 先更新项目：按第六节“更新教程”执行 git pull，或重新运行一键安装命令，把代码更新到最新。
- 更新后一定要重启：在 Termux 里按 Ctrl+C 停掉正在运行的旧服务，再重新运行 cd floatweixinbot && bash termux-start.sh，输入 y 重新打开配置页。
- 浏览器可能缓存了旧页面：配置页已经设置了禁止缓存（Cache-Control: no-store），但保险起见可以下拉刷新，或关闭标签页重新打开 http://127.0.0.1:8787。
- 重新打开后，页面顶部应只剩“保存 Supabase 配置”一个表单，且显示页面版本号。

九、脚本说明

1. termux-install.sh
   - Termux 一键安装/启动脚本。
   - 在项目目录中运行时，会安装依赖、授权脚本，并自动进入 termux-start.sh。
   - 通过 Raw/Bash 一键命令在非项目目录运行时，会自动安装 git、bash、Node.js，克隆或更新项目，再进入 termux-start.sh。

2. termux-start.sh
   - Termux 一键启动脚本。
   - 启动前会提醒小手机提交远程备份/上传最新微信运行包。
   - 可以输入 y 打开本地配置页。
   - 可以输入 n 跳过配置页直接启动。

3. termux-test-once.sh
   - Termux 单次测试/排查连接脚本。
   - 会先检查当前目录、Node.js、config.txt。
   - 会提醒小手机先远程备份/上传最新微信运行包。
   - 然后执行 node assistant.mjs --once，只跑一次，方便看 Supabase、weixin-cloud/index.json、运行包和微信 token 日志。

4. 启动助手.bat
   - Windows 正常启动脚本。
   - 会持续运行助手。

5. 测试一次.bat
   - Windows 单次测试脚本。
   - 只轮询一次，适合检查配置和连接问题。

6. config.example.txt
   - 配置说明示例。
   - 不包含真实 Supabase URL。
   - 不包含真实 service_role key。

十、最后再提醒一次

1. 每次启动前，先让小手机提交远程备份/上传最新微信运行包。
2. 不要把 Supabase URL、service_role key、config.txt 发给别人。
3. 换配置时，Termux 启动输入 y，打开配置页重新保存。
4. 微信 token 过期时，回小手机重新扫码/刷新，再重新备份。
5. README 不内置任何真实 Supabase URL 或 key。
