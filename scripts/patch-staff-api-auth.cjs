/**
 * One-off: add rejectIfNoAdminAccess for staff module checks.
 * Run: node scripts/patch-staff-api-auth.cjs
 */
const fs = require('fs');
const path = require('path');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name === 'route.ts') out.push(p);
  }
  return out;
}

function patch(content, filePath) {
  if (!content.includes('getUserFromRequest')) return content;
  if (content.includes('rejectIfNoAdminAccess')) return content;
  if (!content.includes('isAdmin') && !content.includes('isAdminOrVendor')) return content;

  let t = content;

  // Insert import after first @/lib/auth import line
  const authImport = t.match(/import\s+\{[^}]+\}\s+from\s+['"]@\/lib\/auth['"];/);
  if (authImport && !t.includes("@/lib/admin-api-authorize")) {
    t = t.replace(
      authImport[0],
      `${authImport[0]}\nimport { rejectIfNoAdminAccess } from '@/lib/admin-api-authorize';`,
    );
  }

  t = t.replace(
    /if \(!user \|\| !isAdminOrVendor\(user\)\) \{\s*\n\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*\}/g,
    "const deniedOr = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');\n    if (deniedOr) return deniedOr;",
  );

  t = t.replace(
    /if \(!user \|\| !isAdmin\(user\)\) \{\s*\n\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*\}/g,
    "const deniedAd = rejectIfNoAdminAccess(request, user, 'admin-only');\n    if (deniedAd) return deniedAd;",
  );

  // subscription/plans style
  t = t.replace(
    /if \(!user \|\| \(!isAdmin\(user\) && !isVendor\(user\)\)\)\) \{\s*\n\s*return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);\s*\n\s*\}/g,
    "const deniedPl = rejectIfNoAdminAccess(request, user, 'admin-or-vendor');\n    if (deniedPl) return deniedPl;",
  );

  return t;
}

const root = path.join(__dirname, '../app/api');
const files = walk(root);
let n = 0;
for (const f of files) {
  const before = fs.readFileSync(f, 'utf8');
  const after = patch(before, f);
  if (after !== before) {
    fs.writeFileSync(f, after);
    n++;
    console.log('patched', path.relative(process.cwd(), f));
  }
}
console.log('done, files changed:', n);
