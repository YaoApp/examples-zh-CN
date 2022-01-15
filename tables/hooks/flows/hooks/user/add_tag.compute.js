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
