const ALLOWED_COMPONENTS = [
  "Button",
  "Card",
  "Input",
  "Table",
  "Modal",
  "Sidebar",
  "Navbar",
  "Chart"
];

const ALLOWED_CLASSES = [
  "layout",
  "row",
  "col",
  "stack",
  "grid"
];

export const validateCode = (code: string) => {
  const errors: string[] = [];

  // 1. Check for external imports
  const imports = code.match(/import\s+.*?\s+from\s+['"](.*?)['"]/g) || [];
  imports.forEach(imp => {
    const source = imp.match(/from\s+['"](.*?)['"]/)?.[1];
    if (source && !source.startsWith('react') && source !== '@/ui') {
      errors.push(`Forbidden import: ${source}. Only 'react' and '@/ui' are allowed.`);
    }
  });

  // 2. Check for inline styles (Strictly prohibited by Rule 5)
  if (code.includes('style={{')) {
    errors.push("Forbidden: Inline styles are not allowed. Use the provided layout wrappers (row, col, stack, grid) instead.");
  }

  // 3. Check for Tailwind or arbitrary classes
  const componentTags = code.match(/<([A-Z][a-zA-Z]*)/g) || [];
  componentTags.forEach(tag => {
    const name = tag.substring(1);
    if (!ALLOWED_COMPONENTS.includes(name) && name !== 'GeneratedUI' && name !== 'React') {
      errors.push(`Forbidden component: ${name}. Only components from '@/ui' are allowed.`);
    }
  });

  const classes = code.match(/className=["'](.*?)["']/g) || [];
  classes.forEach(cls => {
    const classList = cls.match(/className=["'](.*?)["']/)?.[1].split(' ') || [];
    classList.forEach(c => {
      if (c && !ALLOWED_CLASSES.includes(c)) {
        errors.push(`Forbidden className: '${c}'. Only layout wrappers are allowed.`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};
