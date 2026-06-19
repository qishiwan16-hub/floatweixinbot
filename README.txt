AI Phone 微信本地助手

Windows 使用方法：
1. 解压这个文件夹。
2. 发布包不内置真实 Supabase URL/key；首次使用请自行创建 config.txt，或在命令行通过 --config 传入配置码。
3. 双击「启动助手.bat」。
4. 如需更换配置，请替换 config.txt 内容，或改用 --config 传入新的配置码；脚本不会使用固定内置 Supabase 信息。
5. 保持这个窗口打开，电脑在线时会自动轮询微信并回复。

Windows 测试：
- 双击「测试一次.bat」只轮询一次，适合检查配置是否正常。

Termux 使用方法：
1. 把整个文件夹放到 Termux 可访问的位置。
2. 在 Termux 中进入本文件夹。
3. 执行一键安装：
   chmod +x ./termux-install.sh ./termux-start.sh
   ./termux-install.sh
   安装完成后会自动进入启动流程，并继承启动脚本的远程备份提醒与配置页 y/n 选择。
4. 后续每次执行一键启动：
   ./termux-start.sh
5. 每次启动助手前，脚本会提醒先去小手机提交远程备份/上传最新微信运行包，再继续启动。
6. 启动时可输入 y 打开本地配置页：http://127.0.0.1:8787；也可输入 n 跳过配置页并直接启动助手。
7. 选择 y 后，可在网页中输入或更换 Supabase URL 和 service_role key；保存配置后回到 Termux，按提示回车继续启动助手。

Termux 配置说明：
- 发布包不包含真实 config.txt，也不内置真实 Supabase URL 或 service_role key，避免泄露个人 Supabase 私密密钥。
- termux-install.sh 安装完成后会直接进入 termux-start.sh 的启动流程，并继承远程备份提醒与配置页 y/n 选择。
- termux-start.sh 每次启动助手前都会提醒先去小手机提交远程备份/上传最新微信运行包。
- termux-start.sh 启动时可输入 y 启动并打开本机配置网页，由网页生成或覆盖 config.txt；也可输入 n 跳过配置页并直接启动助手。
- 选择 y 后，请保存配置，再回到 Termux 按提示回车继续启动助手。
- 配置网页默认只监听 127.0.0.1:8787，不对局域网开放。
- Bucket 默认使用 ai-phone-backup，普通用户不需要修改。
- 修改角色、API、预设、世界书或记忆后，只要小手机端把最新运行包上传到 Supabase，本地助手下一轮轮询会自动读取最新运行包。
- 如果微信 bot token 过期，仍需要回到小手机重新扫码或刷新 token，并让小手机端上传新的运行包。

注意：
- config.example.txt 只保留说明和空占位，不包含可用的 Supabase URL/key；用户必须自行配置。
- config.txt、完整配置码、Supabase service_role key 都是私密信息，不要公开分享。
- 不要把真实 config.txt 提交到 GitHub 或打包给别人。
- 如果提示未检测到 Node.js，请安装 Node.js 20+；Termux 可直接运行 ./termux-install.sh 自动安装，安装完成后会自动进入启动流程并提供配置页 y/n 选择。
