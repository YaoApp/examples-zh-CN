# 关联查询

[查看文档](https://yaoapps.com/doc/e.API%E5%8F%82%E8%80%83/j.%E6%95%B0%E6%8D%AE%E8%A1%A8%E6%A0%BC#%E5%85%B3%E8%81%94%E6%9F%A5%E8%AF%A2%201)

## 环境配置

在项目目录中添加 `.env` 文件， 并替换数据库配置，文件内容如下:

```bash
XIANG_MODE=debug

# 数据库配置
XIANG_DB_DEBUG=true
XIANG_DB_DRIVER=mysql
XIANG_DB_PRIMARY="root:123456@tcp(db-server:3308)/remote_select?charset=utf8mb4&parseTime=True&loc=Local"
XIANG_DB_SECONDARY="root:123456@tcp(db-server:3308)/remote_select?charset=utf8mb4&parseTime=True&loc=Local"
XIANG_DB_AESKEY="ZLX=T&f6refeCh-ro*r@"

```

## 初始化数据

在项目目录中运行

```bash
cd your_project_dir
yao migrate && yao run flows.menu

```

## 启动服务

在项目目录中运行

```bash
cd your_project_dir
yao start
```

## 访问后台

[http://127.0.0.1:5099/xiang/login/admin](http://127.0.0.1:5099/xiang/login/admin)

默认管理员账号密码:

用户名: `xiang@iqka.com`

密码: `A123456p+`
