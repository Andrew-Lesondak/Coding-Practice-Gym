const stripTypeAliases = (code: string) => code.replace(/^\s*type\s+\w+\s*=.*;\s*$/gm, '');

const stripVarTypes = (code: string) =>
  code.replace(/\b(const|let|var)\s+(\w+)\s*:\s*[^=;]+=/g, '$1 $2 =');

const stripClassFieldTypes = (code: string) =>
  code
    .replace(/\b(private|public|protected)\s+(\w+)\s*:\s*[^=;]+=/g, '$2 =')
    .replace(/\b(private|public|protected)\s+/g, '');

const stripReturnTypes = (code: string) => code.replace(/\)\s*:\s*[^\{]+\{/g, '){');

const stripParamTypes = (params: string) => {
  if (!params.trim()) return params;
  return params
    .split(',')
    .map((param) => param.replace(/:\s*[^=]+(?==|$)/, '').trim())
    .join(', ');
};

const stripFunctionParamTypes = (code: string) =>
  code.replace(/function\s+(\w+)\s*\(([^)]*)\)/g, (_match, name, params) => {
    return `function ${name}(${stripParamTypes(params)})`;
  });

const stripMethodParamTypes = (code: string) =>
  code.replace(/(\n\s*)(\w+)\s*\(([^)]*)\)\s*\{/g, (_match, indent, name, params) => {
    return `${indent}${name}(${stripParamTypes(params)}) {`;
  });

export const toJavaScriptStub = (code: string) => {
  let next = stripTypeAliases(code);
  next = stripVarTypes(next);
  next = stripClassFieldTypes(next);
  next = stripReturnTypes(next);
  next = stripFunctionParamTypes(next);
  next = stripMethodParamTypes(next);
  next = next.replace(/<[^>]+>/g, '');
  return next.replace(/\n{3,}/g, '\n\n');
};
