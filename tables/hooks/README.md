# Hooks

在通常情况下，需要对数据表格接口的输入输出数据进行处理，再将数据保存到多张数据表中。可以通过表格的 `Hook` 机制实现这些操作。

## 使用方式

在描述数据表格时，在 `hooks` 字段，声明 **Hook 关联的处理器**，例如：

```json
{
  "name": "用户",
  "version": "1.0.0",
  "decription": "用户",
  "bind": { "model": "user" },
  "hooks": {
    "before:find": "flows.hooks.before_find",
    "after:find": "flows.hooks.after_find",
    "before:search": "flows.hooks.before_search",
    "after:search": "flows.hooks.after_search",
    "before:save": "flows.hooks.before_save",
    "after:save": "flows.hooks.after_save"
  },
  "apis": {},
  "columns": {}
}
```

**以上为代码片段，[查看完成示例](tables/user.tab.json)**

## 数据表格 Hook 一览表

| Hook          | 说明                     | 输入                          | 输出规范                                      |
| ------------- | ------------------------ | ----------------------------- | --------------------------------------------- |
| before:find   | 在 Find 处理器之前调用   | Find 接口传入数据             | 输出结果作为 Find 关联处理器输入参数          |
| after:find    | 在 Find 处理器之后调用   | Find 接口关联处理器执行结果   | 自定义(输出结果作为 Find 处理器的最终输出)    |
| before:search | 在 Search 处理器之前调用 | Search 接口传入数据           | 输出结果作为 Search 关联处理器输入参数        |
| after:search  | 在 Search 处理器之后调用 | Search 接口关联处理器执行结果 | 自定义 (输出结果作为 Search 处理器的最终输出) |
| before:save   | 在 Save 处理器之前调用   | Save 接口传入数据             | 输出结果作为 Save 关联处理器输入参数          |
| after:save    | 在 Save 处理器之后调用   | Save 接口关联处理器执行结果   | 自定义 (输出结果作为 Save 接口的最终输出)     |

## 场景示例

假设有这样一个功能需求:

1. 如果用户性别为 `女` 则自动添加一个 `小姐姐` 的标签， 如果用户性别为 `男` 则自动添加一个 `小哥哥` 的标签；
2. 如果未指定标签颜色，则标签显示为 `灰色`;
3. 如果用户 ID 大于 100，则显示 ID=101 用户职务信息；

设计三张数据表，一张用于存储用户资料，一张用于存储用户的标签信息，一张用户存储用户的扩展资料；
一个用户有多个标签，即用户与标签之前是一对多(`hasMany`)的关系；
一个用户至多对应一个管理员扩展信息资料, 即用户与用户扩展资料之间是一对一 (`hasOne`) 的关系；

用户数据模型 `user`

| 字段   | 类型                   | 说明     |
| ------ | ---------------------- | -------- |
| id     | ID                     | 用户 ID  |
| name   | String                 | 用户姓名 |
| gender | ENUM("男","女","未知") | 用户性别 |

标签数据模型 `tag`

| 字段    | 类型       | 说明                      |
| ------- | ---------- | ------------------------- |
| id      | ID         | 标签 ID                   |
| user_id | BigInteger | 所属用户 ID, 用于关联用户 |
| label   | String     | 标签名称                  |
| color   | String     | 标签颜色                  |

用户扩展资料数据模型 `extra`

| 字段    | 类型       | 说明                      |
| ------- | ---------- | ------------------------- |
| id      | ID         | 用户 ID                   |
| user_id | BigInteger | 所属用户 ID, 用于关联用户 |
| title   | String     | 职务                      |

[查看数据模型 models ](models)

### 1. Find Hook

#### 1.1 `before:find`

实现如果用户 ID 大于 100，则显示 ID=101 的用户信息

使用 `before:find` hook, 检查用户 ID，如果用户 ID 大于 100，则将 ID 数值设定为 101。

在 `user.tab.json` 数据表格描述中，声明 `before:find` hook 关联 `flows.hooks.user.with_extra` 处理器

```json
{
  "name": "用户",
  "version": "1.0.0",
  "decription": "用户",
  "bind": { "model": "user", "withs": { "tags": {}, "extra": {} } },
  "hooks": {
    "before:find": "flows.hooks.user.with_extra"
  },
  "apis": {},
  "columns": {}
}
```

**以上为代码片段，[查看完成示例](tables/user.tab.json)**

`flows/hooks/user/with_extra.flow.json` 实现用户 ID 检测逻辑，如果用户 ID 大于 100，则显示 ID=101 的用户信息。

```json
{
  "label": "查询条件处理",
  "version": "1.0.0",
  "description": "Before:Find",
  "nodes": [
    {
      "name": "查询条件",
      "script": "check"
    }
  ],
  "output": "{{$res.查询条件}}"
}
```

`flows/hooks/user/with_extra.check.js` 检测脚本

```javascript
function main(args, out, res) {
  if (parseInt(args[0]) > 100) {
    args[0] = 101;
    return args;
  }
  return args;
}
```

[查看 flow 示例 flows/hooks/user/ ](flows/hooks/user/)

**调试方法**

可以使用 `yao run` 对处理器进行调试

当 ID 小于 100 时， 返回原始输入

`yao run flows.hooks.user.with_extra 1`

```json
["1"]
```

当 ID 大于 100 时，返回用户 101

`yao run flows.hooks.user.with_extra 102`

```json
["101"]
```

调试表格 Find 处理器 ( 与 find API 返回结果一致 )

当 ID 小于 100 时， 返回给定 ID 用户资料

`yao run xiang.table.find 1`

```json
{
  "extra": {
    "id": 1,
    "title": "设计师",
    "user_id": 1
  },
  "gender": "男",
  "id": 1,
  "name": "张无忌",
  "tags": [
    {
      "color": "#FF0000",
      "id": 1,
      "label": "大侠",
      "user_id": 1
    },
    {
      "color": "#FF6600",
      "id": 2,
      "label": "古代",
      "user_id": 1
    }
  ]
}
```

当 ID 大于 100 时，返回 ID=101 的用户资料

`yao run xiang.table.find 102`

```json
{
  "extra": {
    "id": 2,
    "title": "工程师",
    "user_id": 101
  },
  "gender": "男",
  "id": 101,
  "name": "赵长青",
  "tags": [
    {
      "color": "#FF0000",
      "id": 3,
      "label": "火箭",
      "user_id": 101
    },
    {
      "color": "#FF6600",
      "id": 4,
      "label": "现代",
      "user_id": 101
    }
  ]
}
```

### Search Hook

### Save Hook

## 数据处理方式

### Process

### Script 脚本

## 常用数据格式转换 Process

```

```

```

```
