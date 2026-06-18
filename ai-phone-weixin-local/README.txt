AI Phone 微信本地助手

Windows 使用方法：
1. 解压这个文件夹。
2. 首次使用请创建 config.txt，或在命令行通过 --config 传入配置码。
3. 双击「启动助手.bat」。
4. 保持这个窗口打开，电脑在线时会自动轮询微信并回复。

Windows 测试：
- 双击「测试一次.bat」只轮询一次，适合检查配置是否正常。

Termux 使用方法：
1. 把整个文件夹放到 Termux 可访问的位置。
2. 在 Termux 中进入本文件夹。
3. 执行一键安装：
   chmod +x ./termux-install.sh ./termux-start.sh
   ./termux-install.sh
4. 执行一键启动：
   ./termux-start.sh
5. 浏览器打开：http://127.0.0.1:8787
6. 在网页中输入 Supabase URL 和 service_role key，保存后回到 Termux 按回车继续启动助手。

Termux 配置说明：
- 发布包不包含真实 config.txt，避免泄露个人 Supabase 私密密钥。
- termux-start.sh 会启动本机配置网页，由网页自动生成 config.txt。
- 配置网页默认只监听 127.0.0.1:8787，不对局域网开放。
- Bucket 默认使用 ai-phone-backup，普通用户不需要修改。
- 修改角色、API、预设、世界书或记忆后，只要小手机端把最新运行包上传到 Supabase，本地助手下一轮轮询会自动读取最新运行包。
- 如果微信 bot token 过期，仍需要回到小手机重新扫码或刷新 token，并让小手机端上传新的运行包。

注意：
- config.txt、完整配置码、Supabase service_role key 都是私密信息，不要公开分享。
- 不要把真实 config.txt 提交到 GitHub 或打包给别人。
- 如果提示未检测到 Node.js，请安装 Node.js 20+；Termux 可直接运行 ./termux-install.sh 自动安装。
