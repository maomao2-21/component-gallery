/*
 * @Description: 
 * @Version: 2.0
 * @Autor: Mao 
 * @Date: 2022-01-19 16:46:36
 * @LastEditors: Mao 
 * @LastEditTime: 2022-02-17 13:33:17
 */
module.exports = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
    REACT_APP_ENV: true,
  },
  'rules': {
    'no-debugger': 'error',
    'no-console': [2, { 'allow': ['error', 'warn'] }],  //只允许输出console.error() console.warn()
    'no-multiple-empty-lines': [1, { 'max': 1 }], //空行最多不能超过两行,
    'space-after-keywords': [0, 'always'],//关键字后面是否要空一格
    'space-before-blocks': [2, 'always'],//不以新行开始的块{前面要不要有空格
    'space-before-function-paren': [2, 'always'],//函数定义时括号前面要不要有空格
    'space-in-parens': [0, 'never'],//小括号里面要不要有空格
    'space-infix-ops': 0,//中缀操作符周围要不要有空格
    'space-unary-ops': [0, { 'words': true, 'nonwords': false }],//一元运算符的前/后要不要加空格
    'spaced-comment': 0,//注释风格要不要有空格什么的
    'func-call-spacing': [2, { 'allowNewlines': true }],//函数名称和调用它的括号之间插入可选的空白
    'no-trailing-spaces': 2, //一行最后不允许有空格,
    'no-empty': 2, //不允许出现空的代码块
    // "no-extra-parens": 2, //不允许出现不必要的圆括号
    'no-extra-semi': 2, //不允许出现不必要的分号
    'no-func-assign': 2, //不允许重新分配函数声明
    'no-irregular-whitespace': 2, //不允许出现不规则的空格
    'no-sparse-arrays': 2, //数组中不允许出现空位置
    'camelcase': [2, { 'properties': 'never' }], //制驼峰命名规则
    'semi': [2, 'always'],//语句强制分号结尾
    'semi-spacing': [0, { 'before': false, 'after': true }],//分号前后空格
    'quotes': [1, 'single'],//引号类型 `` "" ''
    'quote-props': [2, 'always'],//对象字面量中的属性名是否强制双引号
    'padded-blocks': 0,//块语句内行首行尾是否要空行
    'operator-linebreak': [2, 'after'],//换行时运算符在行尾还是行首
    'arrow-parens': 2,//箭头函数用小括号括起来
    'arrow-spacing': [2, { 'before': true, 'after': true }],//=>的前/后括号
    'comma-dangle': [2, 'never'],//对象字面量项尾不能有逗号
    'comma-spacing': 0,//逗号前后的空格
    'comma-style': [2, 'last'],//逗号风格，换行时在行首还是行尾
    'rest-spread-spacing': ['error', "never"],
    'implicit-arrow-linebreak': 2,// 强制隐式返回的箭头函数体的位置
    'prefer-const': 0,//首选const
  },
};
