function main(args, out, res) {
  var data = args[0] || {}; // 读取表格 Save API 输入数据
  if (parseInt(data.id) > 100) {
    data["id"] = 101; // 如果ID大于 100, 将ID数值设置为101
    args[0] = data;
  }
  return args; // 返回更新后的数据
}
