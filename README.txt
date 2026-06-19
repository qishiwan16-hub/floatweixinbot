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
4. 保存配置。
5. 保存成功后，回到 Termux。
6. 按回车继续启动助手。

选择 B：输入 n

适合这些情况：
1. 你已经配置过。
2. config.txt 已经存在。
3. 这次不想改配置。

输入 n 后，脚本会跳过配置页，直接启动助手。

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

Windows 可以用两种方式提供配置。

方式 A：使用 config.txt

1. 参考 config.example.txt。
2. 自己创建 config.txt。
3. 把你自己的配置码写进去。
4. 不要把真实 config.txt 发给别人。
5. 不要把真实 config.txt 提交到公开仓库。

方式 B：使用 --config

如果你不想写 config.txt，可以在命令行里传入配置码。

正常启动示例：

node assistant.mjs --config "你的配置码"

只测试一次示例：

node assistant.mjs --once --config "你的配置码"

注意：这里的“你的配置码”必须换成你自己的配置码。README 里不会写真实配置码，也不会写真实 key。

第 4 步：正常启动

在项目文件夹里，双击：
启动助手.bat

窗口不要关。窗口开着时，助手会持续轮询微信消息并自动回复。

第 5 步：单次测试

如果你只是想检查配置能不能跑，不想一直运行，可以双击：
测试一次.bat

它只轮询一次，适合测试配置是否正常。

五、什么时候需要重新打开配置页

只要你换了配置，就重新打开配置页保存一次。

Termux 上的做法：
1. 复制每天启动命令：cd floatweixinbot && bash termux-start.sh。
2. 先完成小手机远程备份。
3. 问你是否打开配置页时，输入 y。
4. 浏览器打开 http://127.0.0.1:8787。
5. 填新的 Supabase URL 或新的 service_role key。
6. 保存。
7. 回到 Termux 按回车继续。

六、非常重要的注意事项

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

4. 配置码是隐私。
   - 配置码里会包含连接远端需要的信息。
   - 不要发给别人。
   - 不要放到公开地方。

5. config.txt 是隐私文件。
   - 它可能包含完整配置码。
   - 不要提交到公开仓库。
   - 不要打包发给别人。
   - config.example.txt 只是示例说明，不包含真实可用密钥。

6. 如果微信 token 过期：
   - 本地助手可能无法继续正常收发微信消息。
   - 需要回到小手机重新扫码/刷新 token。
   - 刷新后再让小手机提交远程备份/上传最新微信运行包。
   - 然后重新启动本地助手。

7. 默认 Bucket：
   - 默认使用 ai-phone-backup。
   - 普通用户不需要改。
   - 除非你明确知道自己在改什么，否则保持默认。

8. Node.js 版本要求：
   - 需要 Node.js 20 或更高版本。
   - Termux 可以复制推荐的一键 Bash 命令自动安装，也可以在项目目录执行 bash termux-install.sh。
   - Windows 如果提示找不到 Node.js，就安装 Node.js 20+，或者使用带 runtime 的发布包。

七、常见启动失败排查

1. 提示缺少配置

可能原因：
- 没有 config.txt。
- config.txt 是空的。
- 没有通过 --config 传入配置码。

解决办法：
- Termux：运行 ./termux-start.sh，输入 y 打开配置页，保存配置。
- Windows：创建 config.txt，或用 node assistant.mjs --config "你的配置码" 启动。

2. 提示配置码格式不正确

可能原因：
- 复制配置码时少复制了一段。
- 多复制了空格、说明文字或换行。
- 配置码不是这个工具需要的格式。

解决办法：
- 重新复制完整配置码。
- 重新保存 config.txt。
- 或在 Termux 配置页重新填写 Supabase URL 和 service_role key 后保存。

3. 提示 Node.js was not found 或未检测到 Node.js

解决办法：
- Termux：复制推荐的一键 Bash 命令，或在项目目录执行 bash termux-install.sh。
- Windows：安装 Node.js 20+，或者使用带 runtime\node.exe 的发布包。

4. 能启动，但微信消息不同步

可能原因：
- 启动前没有在小手机提交远程备份。
- 微信 token 过期。
- 小手机上传的运行包不是最新。

解决办法：
- 回小手机提交远程备份/上传最新微信运行包。
- 如果 token 过期，回小手机重新扫码/刷新 token，再重新备份。
- 重新启动本地助手。

5. Termux 输入 y 后打不开配置页

解决办法：
- 确认 Termux 窗口还在运行。
- 用同一台手机浏览器打开 http://127.0.0.1:8787。
- 不要把 127.0.0.1 换成别人的手机或电脑地址。
- 如果仍然打不开，按 Ctrl+C 停止后重新运行 cd floatweixinbot && bash termux-start.sh。

八、脚本说明

1. termux-install.sh
   - Termux 一键安装/启动脚本。
   - 在项目目录中运行时，会安装依赖、授权脚本，并自动进入 termux-start.sh。
   - 通过 Raw/Bash 一键命令在非项目目录运行时，会自动安装 git、bash、Node.js，克隆或更新项目，再进入 termux-start.sh。

2. termux-start.sh
   - Termux 一键启动脚本。
   - 启动前会提醒小手机提交远程备份/上传最新微信运行包。
   - 可以输入 y 打开本地配置页。
   - 可以输入 n 跳过配置页直接启动。

3. 启动助手.bat
   - Windows 正常启动脚本。
   - 会持续运行助手。

4. 测试一次.bat
   - Windows 单次测试脚本。
   - 只轮询一次，适合检查配置。

5. config.example.txt
   - 配置说明示例。
   - 不包含真实 Supabase URL。
   - 不包含真实 service_role key。

九、最后再提醒一次

1. 每次启动前，先让小手机提交远程备份/上传最新微信运行包。
2. 不要把 Supabase URL、service_role key、配置码、config.txt 发给别人。
3. 换配置时，Termux 启动输入 y，打开配置页重新保存。
4. 微信 token 过期时，回小手机重新扫码/刷新，再重新备份。
5. README 不内置任何真实 Supabase URL 或 key。
