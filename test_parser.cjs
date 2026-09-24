/**
 * LogicSim 解析器回归测试
 *
 * 用途：验证 LogicParser / ModelGen / ViewGen 的行为（用于重构前后对比）
 * 运行：node test_parser.cjs
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const PUBLIC_DIR = path.join(__dirname, 'public');
const parserCode = fs.readFileSync(path.join(PUBLIC_DIR, 'LogicParser.js'), 'utf8');

// 在沙箱中加载解析器（非严格模式，兼容原有代码风格）
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(parserCode + '\n;this.LogicParser=LogicParser;this.ModelGen=ModelGen;this.ViewGen=ViewGen;', sandbox);

const { LogicParser, ModelGen, ViewGen } = sandbox;

// 测试用例：覆盖全部 7 种操作符 + 错误处理
const cases = [
  // --- 命题逻辑（5 种）---
  { name: 'AND', input: 'a b .' },
  { name: 'OR', input: 'a b ,' },
  { name: 'NOT', input: 'a <' },
  { name: 'IMPLIES', input: 'a b >' },
  { name: 'EQUIV', input: 'a b =' },
  { name: '复合: (a AND b) -> fe', input: 'a b . fe >' },
  { name: '复合: (a AND b) <-> (fe -> ge)', input: 'a b . fe ge > =' },
  { name: '三重嵌套', input: 'a b , c .' },

  // --- 谓词逻辑量词（2 种，本次改造新增）---
  { name: '全称量词: forall x (P(x) -> Q(x))', input: 'x P_x Q_x > ∀' },
  { name: '存在量词: exists x P(x)', input: 'x P_x ∃' },
  { name: '嵌套量词: forall x exists y R(x,y)', input: 'x y R_x_y ∃ ∀' },
  { name: '量词+命题逻辑混合', input: 'x P_x Q_x . ∃ a >' },

  // --- 错误处理 ---
  { name: '错误: 空字符串', input: '' },
  { name: '错误: 参数不足(AND)', input: 'a .' },
  { name: '错误: 参数过多', input: 'a b c .' },
];

function run(input) {
  const parsed = LogicParser(input);
  const result = { parsed: parsed };
  if (typeof parsed === 'string') {
    result.error = parsed;
    return result;
  }
  try {
    result.model = ModelGen(parsed);
    result.view = ViewGen(result.model);
  } catch (e) {
    result.exception = e.message;
  }
  return result;
}

const output = [];
let failed = 0;

console.log('='.repeat(70));
console.log('LogicSim 解析器测试');
console.log('='.repeat(70));

for (const c of cases) {
  let r;
  try {
    r = run(c.input);
  } catch (e) {
    r = { exception: e.message };
    failed++;
  }
  output.push({ name: c.name, input: c.input, result: r });

  const status = r.exception ? '❌ 异常' : (r.error ? '⚠️  错误提示' : '✅ 通过');
  const detail = r.error ? ` → "${r.error}"`
    : r.exception ? ` → ${r.exception}`
      : ` → 节点 ${r.view.nodeArray.length} 个, 连线 ${r.view.linkArray.length} 条`;
  console.log(`${status}  ${c.name.padEnd(38)} "${c.input}"${detail}`);
}

console.log('='.repeat(70));
console.log(`用例总数: ${cases.length}, 异常: ${failed}`);
console.log('='.repeat(70));

// 输出基准 JSON（供重构后对比）
const outFile = path.join(__dirname, 'test_output.json');
fs.writeFileSync(outFile, JSON.stringify(output, null, 2), 'utf8');
console.log(`\n结果已保存: ${outFile}`);
