import { parseEditRegions, isEditAllowed } from '../lib/dsaDrillEditRegions';

describe('dsa drill edit regions', () => {
  const code = `function demo() {\n// EDIT_START\n\n// EDIT_END\n}`;
  const regions = parseEditRegions(code, [{ start: '// EDIT_START', end: '// EDIT_END' }]);

  it('blocks edits outside region', () => {
    const next = code.replace('function demo', 'function demo2');
    expect(isEditAllowed(code, next, regions)).toBe(false);
  });

  it('allows edits inside region', () => {
    const next = code.replace('// EDIT_START\n\n// EDIT_END', '// EDIT_START\nconst x = 1;\n// EDIT_END');
    expect(isEditAllowed(code, next, regions)).toBe(true);
  });
});
