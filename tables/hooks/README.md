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

## 使用场景

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

`yao run xiang.table.find user 1`

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

`yao run xiang.table.find user 102`

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

#### 1.2 `after:find`

实现如果未指定标签颜色，则标签显示为 `灰色`

使用 `after:find` hook, 循环检查 ID 标签的数值，如果标签颜色字段为空，则将颜色设置为灰色 `#efefef`。

在 `user.tab.json` 数据表格描述中，声明 `after:find` hook 关联 `flows.hooks.user.tags_color` 处理器

```json
{
  "name": "用户",
  "version": "1.0.0",
  "decription": "用户",
  "bind": { "model": "user", "withs": { "tags": {}, "extra": {} } },
  "hooks": {
    "after:find": "flows.hooks.user.tags_color"
  },
  "apis": {},
  "columns": {}
}
```

**以上为代码片段，[查看完成示例](tables/user.tab.json)**

`flows/hooks/user/tags_color.flow.json` 实现标签颜色检测，如果为空，则将颜色设置为灰色

```json
{
  "label": "查询结果处理",
  "version": "1.0.0",
  "description": "After:Find",
  "nodes": [
    {
      "name": "处理后的数据",
      "script": "default"
    }
  ],
  "output": "{{$res.处理后的数据}}"
}
```

`flows/hooks/user/tags_color.default.js` 数据处理脚本

```javascript
function main(args, out, res) {
  var data = args[0] || {}; // 读取表格 Find 处理器返回结果
  var tags = data.tags || [];
  for (var i in tags) {
    var tag = tags[i] || {};
    if (tag.color == "" || tag.color == undefined || tag.color == null) {
      data["tags"][i]["color"] = "#efefef"; // 如果标签颜色为空, 则设定为灰色
    }
  }
  return data; // 返回新结果
}
```

[查看 flow 示例 flows/hooks/user/ ](flows/hooks/user/)

**调试方法**

调试表格 Find 处理器 ( 与 find API 返回结果一致 )

ID=1 的用户数据中，`默认颜色` 标签被设置为灰色，在数据表中，这个字段数值为 `null`

`yao run xiang.table.find user 1`

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
      "color": "#efefef",
      "id": 1,
      "label": "默认颜色",
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

### 2. Search Hook

### 3. Save Hook

#### 3.1 `before:save`

实现当用户 ID 大于 100 时, 更新 ID=101 的数据记录

使用 `before:save` hook, 检查数据数据 ID，如果 ID 大于 100，则将 ID 设置为 101。

在 `user.tab.json` 数据表格描述中，声明 `before:save` hook 关联 `flows.hooks.user.before_save` 处理器

```json
{
  "name": "用户",
  "version": "1.0.0",
  "decription": "用户",
  "bind": { "model": "user", "withs": { "tags": {}, "extra": {} } },
  "hooks": {
    "before:save": "flows.hooks.user.before_save"
  },
  "apis": {},
  "columns": {}
}
```

**以上为代码片段，[查看完成示例](tables/user.tab.json)**

`flows/hooks/user/before_save.flow.json` 实现检查数据 ID，如果 ID 大于 100，则将 ID 设置为 101

```json
{
  "label": "表单提交数据预处理",
  "version": "1.0.0",
  "description": "Before:Save",
  "nodes": [
    {
      "name": "处理后的输入数据",
      "script": "format"
    }
  ],
  "output": "{{$res.处理后的输入数据}}"
}
```

`flows/hooks/user/before_save.format.js` 数据处理脚本

```javascript
function main(args, out, res) {
  var data = args[0] || {}; // 读取表格 Save API 输入数据
  if (parseInt(data.id) > 100) {
    data["id"] = 101; // 如果ID大于 100, 将ID数值设置为101
    args[0] = data;
  }
  return args; // 返回更新后的数据
}
```

[查看 flow 示例 flows/hooks/user/ ](flows/hooks/user/)

**调试方法**

验证 Hook 处理逻辑, 如果用户 ID 大于 100, 则将 ID 修改为 101

`yao run flows.hooks.user.before_save '::{"id":102, "name":"李小龙"}'`

```json
[
  {
    "id": 101,
    "name": "李小龙"
  }
]
```

调试表格 Save 处理器 ( 与 Save API 返回结果一致 )

`yao run xiang.table.save user '::{"id":102, "name":"李小龙"}'`

```json
101
```

运行 Find 处理器，验证 101 数据是否被修改

`yao run xiang.table.find user 101`

```json
{
  "extra": {
    "id": 2,
    "title": "工程师",
    "user_id": 101
  },
  "gender": "男",
  "id": 101,
  "name": "李小龙",
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

#### 3.2 `after:save`

实现如果用户性别为 女 则自动添加一个 小姐姐 的标签， 如果用户性别为 男 则自动添加一个 小哥哥 的标签。

使用 `after:save` hook, 保存用户资料之后，根据用户性别，添加一个标签。

在 `user.tab.json` 数据表格描述中，声明 `after:save` hook 关联 `flows.hooks.user.add_tag` 处理器

```json
{
  "name": "用户",
  "version": "1.0.0",
  "decription": "用户",
  "bind": { "model": "user", "withs": { "tags": {}, "extra": {} } },
  "hooks": {
    "after:save": "flows.hooks.user.add_tag"
  },
  "apis": {},
  "columns": {}
}
```

**以上为代码片段，[查看完成示例](tables/user.tab.json)**

`flows/hooks/user/add_tag.flow.json` 实现检查用户性别，并根据性别，调用 `models.tag.Save` 处理器添加标签

```json
{
  "label": "根据性别添加标签",
  "version": "1.0.0",
  "description": "After:Save",
  "nodes": [
    {
      "name": "用户",
      "process": "models.user.Find",
      "args": ["{{$in.0}}", { "withs": { "tags": {} } }]
    },
    {
      "name": "标签",
      "script": "compute"
    },
    {
      "name": "保存标签",
      "process": "xiang.helper.Case",
      "args": [
        {
          "when": [{ "用户ID存在": "{{$res.标签.user_id}}", "is": "notnull" }],
          "name": "保存标签",
          "process": "models.tag.Save",
          "args": ["{{$res.标签}}"]
        }
      ]
    }
  ],
  "output": "{{$in}}"
}
```

`flows/hooks/user/add_tag.compute.js` 数据处理脚本

```javascript
function main(args, out, res) {
  var user = res.用户 || {};
  var tags = user.tags || [];
  var gender = user.gender || "未知";

  // 检查是否已有 小哥哥/小姐姐标签, 则忽略处理
  for (var i in tags) {
    if (tags[i].label == "小哥哥" || tags[i].label == "小姐姐") {
      return {};
    }
  }

  if (gender == "男") {
    return { user_id: user.id, label: "小哥哥", color: "#0398e2" };
  } else if (gender == "女") {
    return { user_id: user.id, label: "小姐姐", color: "#d80128" };
  }
  return {};
}
```

[查看 flow 示例 flows/hooks/user/ ](flows/hooks/user/)

**调试**

调试表格 Save 处理器 ( 与 Save API 返回结果一致 )

`yao run xiang.table.save user '::{"id":102, "name":"李小龙"}'`

```json
101
```

运行 Find 处理器，验证 101 数据是否被修改

`yao run xiang.table.find user 101`

```json
{
  "extra": {
    "id": 2,
    "title": "工程师",
    "user_id": 101
  },
  "gender": "男",
  "id": 101,
  "name": "李小龙",
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
    },
    {
      "color": "#0398e2",
      "id": 5,
      "label": "小哥哥",
      "user_id": 101
    }
  ]
}
```

## 数据处理方式

### Process

### Script 脚本

## 常用数据格式转换 Process
