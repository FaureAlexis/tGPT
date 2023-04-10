function escapeString(str: string) {
  return str.replace(/([(){}\[\]#_<>!?=+-.])/g, "\\\$1").replace(/([`/])/g, "\$1");
}

export default escapeString;
