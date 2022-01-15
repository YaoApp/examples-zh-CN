function main(args, out, res) {
  if (parseInt(args[0]) > 100) {
    args[0] = 101;
    return args;
  }
  return args;
}
