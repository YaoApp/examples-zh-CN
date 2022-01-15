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
