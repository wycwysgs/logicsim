/**
 * LogicSim - 逆波兰逻辑表达式解析器
 *
 * 支持七种操作符：
 *   "."  逻辑与   (AND)      a b .
 *   ","  逻辑或   (OR)       a b ,
 *   "<"  逻辑非   (NOT)      a <
 *   ">"  推出     (IMPLIES)  a b >
 *   "="  等价     (EQUIV)    a b =
 *   "∀"  全称量词 (FORALL)   x φ ∀
 *   "∃"  存在量词 (EXISTS)   x φ ∃
 *
 * 解析流程：LogicParser（文本 → 逻辑树）
 *        → ModelGen（逻辑树 → 化简后的电路模型）
 *        → ViewGen（电路模型 → JointJS 图形数据）
 */

/** 解析错误消息（集中管理，便于国际化） */
var LOGIC_ERR = {
    empty: '输入为空，请输入逆波兰逻辑表达式',
    notEnough: '格式错误：操作数不足',
    tooMany: '格式错误：操作数过多',
    wrongName: '变量名使用错误（操作符前不能直接跟变量）'
};

/**
 * 解析逆波兰逻辑表达式
 * @param {string} npn - 逆波兰逻辑表达式，如 "a b ." 或 "x P_x Q_x > ∀"
 * @returns {Object|string} 成功返回逻辑树对象，失败返回错误消息字符串
 */
function LogicParser(npn) {
    /* ==================== 逻辑节点构造器 ==================== */

    /** 逻辑与：真值表节点 */
    var andM = function (a, b) {
        return {
            "S": a,
            "0": "0",
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };

    /** 逻辑或 */
    var orM = function (a, b) {
        return {
            "S": a,
            "0": {
                "S": b,
                "0": "0",
                "1": "1"
            },
            "1": "1"
        }
    };

    /** 逻辑非（一元操作符） */
    var notM = function (a) {
        return {
            "S": a,
            "0": "1",
            "1": "0"
        }
    };

    /** 逻辑推出 a → b */
    var infM = function (a, b) {
        return {
            "S": a,
            "0": "1",
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };

    /** 逻辑等价 a ↔ b */
    var equalM = function (a, b) {
        return {
            "S": a,
            "0": {
                "S": b,
                "0": "1",
                "1": "0"
            },
            "1": {
                "S": b,
                "0": "0",
                "1": "1"
            }
        }
    };

    /** 全称量词 ∀x φ（变量 x 绑定公式 φ） */
    var forallM = function (x, a) {
        return {
            "Q": "∀",
            "V": x,
            "S": a
        };
    };

    /** 存在量词 ∃x φ */
    var existsM = function (x, a) {
        return {
            "Q": "∃",
            "V": x,
            "S": a
        };
    };

    /* ==================== 操作符表 ==================== */
    // 二元操作符：弹出 2 个操作数，注意栈序（后弹出的在前）
    var BINARY_OPS = {
        '.': andM,
        ',': orM,
        '>': infM,
        '=': equalM,
        '∀': forallM,
        '∃': existsM
    };
    // 一元操作符：弹出 1 个操作数
    var UNARY_OPS = {
        '<': notM
    };

    /* ==================== 主解析循环 ==================== */

    if (npn === "" || npn === null || npn === undefined) {
        return LOGIC_ERR.empty;
    }

    var stack = [];     // 操作数栈
    var state = 0;      // 0: 等待操作数；1: 刚读入一个操作数
    var nstate = 0;     // 已完成的表达式数量（用于检测多余参数）

    var tokens = npn.split(/(\.|,|<|>|=|∀|∃|\s)/);

    for (var t = 0; t < tokens.length; t++) {
        var token = tokens[t];
        if (token === "") {
            continue;
        }

        // 空白分隔符
        if (/^\s+$/.test(token)) {
            if (state === 1) {
                state = 0;
                nstate++;
            }
            continue;
        }

        // 二元操作符
        var binaryOp = BINARY_OPS[token];
        if (binaryOp) {
            if (state === 1) {
                return LOGIC_ERR.wrongName;
            }
            var bOperand = stack.pop();
            var aOperand = stack.pop();
            if (aOperand === undefined || bOperand === undefined) {
                return LOGIC_ERR.notEnough;
            }
            stack.push(binaryOp(aOperand, bOperand));
            nstate--;
            continue;
        }

        // 一元操作符
        var unaryOp = UNARY_OPS[token];
        if (unaryOp) {
            if (state === 1) {
                return LOGIC_ERR.wrongName;
            }
            var operand = stack.pop();
            if (operand === undefined) {
                return LOGIC_ERR.notEnough;
            }
            stack.push(unaryOp(operand));
            continue;
        }

        // 变量 / 谓词名
        if (state === 0) {
            state = 1;
            stack.push(token);
        }
    }

    if (nstate > 1) {
        return LOGIC_ERR.tooMany;
    }
    return stack.pop();
};


/**
 * 将逻辑树化简为电路模型（含量词处理）
 * @param {Object} np - LogicParser 返回的逻辑树
 * @returns {{value: Array, order: Array, quantifier?: Object}} 电路模型
 */
function ModelGen(np) {
    /* value: 真值表行集合，"." 字段取值 "<"(假) / ">"(真)
       order: 涉及的变量列表 */
    var result = {
        value: [],
        order: []
    };

    // 常量：1 = 真，0 = 假
    if ("string" == typeof (np)) {
        if ("1" == np) {
            result.value = [{ ".": ">" }];
            result.order = [];
        } else if ("0" == np) {
            result.value = [{ ".": "<" }];
            result.order = [];
        } else {
            // 单变量：真值表两行
            var trueRow = { ".": ">" };
            var falseRow = { ".": "<" };
            trueRow[np] = ">";
            falseRow[np] = "<";
            result.value = [trueRow, falseRow];
            result.order = [np];
        }
        return result;
    }

    // 量化节点：∀x φ 或 ∃x φ
    if (np.Q === "∀" || np.Q === "∃") {
        var subResult = ModelGen(np.S);
        // 被量词绑定的变量不再作为自由变量出现在电路输入端
        result.order = subResult.order.filter(function (v) { return v !== np.V; });
        result.value = subResult.value;
        result.quantifier = {
            "type": np.Q,
            "var": np.V
        };
        return result;
    }

    /* ==================== 一般逻辑组合 ==================== */
    var result1 = ModelGen(np.S);

    // 常量短路：整体为常量时直接返回常量
    if (0 == result1.order.length) {
        if ("<" == result1.value[0]["."]) {
            return ModelGen(np[0]);
        }
        return ModelGen(np[1]);
    }

    var mySet = new Set(result1.order);
    var result2 = ModelGen(np[0]);
    var result3 = ModelGen(np[1]);

    var intersection2 = result2.order.filter(function (x) { return mySet.has(x); });
    var intersection3 = result3.order.filter(function (x) { return mySet.has(x); });

    var all0 = false;   // 全部为假
    var all1 = false;   // 全部为真

    for (var i = 0; i < result1.value.length; i++) {
        var row = result1.value[i];
        // 根据当前行分支（"<" 走 false 分支，">" 走 true 分支）
        var branchIsFalse = ("<" == row["."]);
        var subResult = branchIsFalse ? result2 : result3;
        var intersection = branchIsFalse ? intersection2 : intersection3;

        for (var j = 0; j < subResult.value.length; j++) {
            var subRow = subResult.value[j];

            // 检查变量赋值是否兼容
            var compatible = true;
            for (var k = 0; k < intersection.length; k++) {
                var v = intersection[k];
                if (undefined != row[v] && undefined != subRow[v] && row[v] != subRow[v]) {
                    compatible = false;
                    break;
                }
            }
            if (!compatible) {
                continue;
            }

            // 合并两行赋值
            var merged = {};
            for (var key in row) {
                merged[key] = row[key];
            }
            for (var a = 0; a < subResult.order.length; a++) {
                var alpha = subResult.order[a];
                if (undefined != subRow[alpha]) {
                    merged[alpha] = subRow[alpha];
                }
            }
            merged["."] = subRow["."];

            if (">" == merged["."]) {
                all1 = true;
            } else {
                all0 = true;
            }
            result.value.push(merged);
        }
    }

    // 常量折叠：结果恒假 / 恒真
    if (all0 && !all1) {
        return {
            value: [{ ".": "<" }],
            order: []
        };
    }
    if (all1 && !all0) {
        return {
            value: [{ ".": ">" }],
            order: []
        };
    }

    var tempOrder = new Set(
        result1.order.concat(result2.order).concat(result3.order)
    );
    result.order = Array.from(tempOrder);
    return result;
}


/**
 * 将电路模型转换为 JointJS 图形数据（节点 + 连线）
 * @param {Object} pn - ModelGen 返回的电路模型
 * @returns {{nodeArray: Array, linkArray: Array}} 图形数据
 */
function ViewGen(pn) {
    var countKey = 2;
    var result = {
        nodeArray: [
            { "key": "0", "type": "0", "name": "Zero" },
            { "key": 1, "type": "1", "name": "One" },
            { "key": 2, "type": "Export", "name": "Out" }
        ],
        linkArray: []
    };

    /**
     * 递归生成子图
     * @param {Object} pnp       当前电路模型
     * @param {number|string} NodeKey 父节点 key
     * @param {string} PortId    父节点输入端口
     */
    function ViewGen0(pnp, NodeKey, PortId) {
        // ---- 量化节点：生成 QUANT 节点并递归其内部公式 ----
        if (pnp.quantifier) {
            countKey++;
            var quantKey = countKey;
            var subPnp = {
                value: pnp.value,
                order: pnp.order
            };
            var subResult = ViewGen0(subPnp, quantKey, "IN");
            return {
                nodeArray: [{
                    "key": quantKey,
                    "type": "QUANT",
                    "qtype": pnp.quantifier.type,
                    "var": pnp.quantifier.var,
                    "name": pnp.quantifier.var
                }].concat(subResult.nodeArray),
                linkArray: [{
                    "from": quantKey,
                    "frompid": "OUT",
                    "to": NodeKey,
                    "topid": PortId
                }].concat(subResult.linkArray)
            };
        }

        // ---- 常量节点：直接连到 0 或 1 ----
        if (1 == pnp.value.length) {
            if ("<" == pnp.value[0]["."]) {
                return {
                    nodeArray: [],
                    linkArray: [{ "from": "0", "frompid": "OUT", "to": NodeKey, "topid": PortId }]
                };
            }
            return {
                nodeArray: [],
                linkArray: [{ "from": 1, "frompid": "OUT", "to": NodeKey, "topid": PortId }]
            };
        }

        // ---- 查找可作为选择器控制变量的变量 ----
        var CName = "";
        for (var i = 0; i < pnp.order.length; i++) {
            var candidate = pnp.order[i];
            var allDefined = pnp.value.filter(function (x) {
                return undefined != x[candidate];
            }).length == pnp.value.length;
            if (allDefined) {
                CName = candidate;
            }
        }

        if ("" == CName) {
            return undefined;
        }

        var TempOrder = pnp.order.filter(function (x) {
            return x != CName;
        });

        var pnp1 = {
            value: pnp.value.filter(function (x) { return "<" == x[CName]; }),
            order: TempOrder
        };
        var pnp2 = {
            value: pnp.value.filter(function (x) { return ">" == x[CName]; }),
            order: TempOrder
        };

        countKey++;
        var NodeKeyNow = countKey;
        var NodeLink1 = ViewGen0(pnp1, NodeKeyNow, "0");
        var NodeLink2 = ViewGen0(pnp2, NodeKeyNow, "1");

        return {
            nodeArray: [{ "key": NodeKeyNow, "type": "SEL" }]
                .concat(NodeLink1.nodeArray, NodeLink2.nodeArray),
            linkArray: [
                { "from": NodeKeyNow, "frompid": "N", "to": NodeKey, "topid": PortId },
                { "from": CName, "frompid": "OUT", "to": NodeKeyNow, "topid": "SI" }
            ].concat(NodeLink1.linkArray, NodeLink2.linkArray)
        };
    }

    // 输入变量节点
    for (var i = 0; i < pn.order.length; i++) {
        var x = pn.order[i];
        result.nodeArray = result.nodeArray.concat({ "key": x, "type": "Import", "name": x });
    }

    var temp = ViewGen0(pn, countKey, "OUT");
    if (temp) {
        result.nodeArray = result.nodeArray.concat(temp.nodeArray);
        result.linkArray = result.linkArray.concat(temp.linkArray);
    }
    return result;
}
