const fs = require('fs');
const path = require('path');

const iconMap = {
  '📦': 'Package',
  '📍': 'MapPin',
  '⭐': 'Star',
  '📸': 'Camera',
  '🤝': 'Handshake',
  '🔗': 'LinkIcon',
  '⏳': 'Clock',
  '📭': 'Mailbox',
  '✏️': 'Pencil',
  '📞': 'Phone',
  '📧': 'Mail',
  '💬': 'MessageSquare',
  '🏷️': 'Tag',
  '🔔': 'Bell',
  '🛠️': 'Wrench',
  '🛍️': 'ShoppingBag',
  '🏢': 'Building',
  '🆕': 'Sparkles',
  '🌍': 'Globe',
  '🔍': 'Search',
  '👋': 'Hand',
  '✉️': 'Mail',
  '🔒': 'Lock',
  '📱': 'Smartphone',
  '🏠': 'Home',
  '➕': 'Plus',
  '📥': 'Inbox',
  '👤': 'User',
  '⚙️': 'Settings',
  '🚪': 'LogOut',
  '⚡': 'Zap'
};

const iconRegex = new RegExp(Object.keys(iconMap).join('|'), 'g');

function getFiles(dir, files = []) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath, files);
    } else if (fullPath.endsWith('.js') && !fullPath.includes('node_modules') && !fullPath.includes('.next')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = [
  ...getFiles(path.join(__dirname, 'app')),
  ...getFiles(path.join(__dirname, 'components'))
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let iconsNeeded = new Set();
  
  // Custom replacements to ensure proper JSX
  // e.g. "📍 {plug.address}" -> "<MapPin size={16} style={{ display: 'inline', marginRight: '4px' }} /> {plug.address}"
  // Since we don't know the context, the safest is replacing emoji directly with the icon component.
  
  let newContent = content.replace(iconRegex, (match) => {
    const iconName = iconMap[match];
    iconsNeeded.add(iconName);
    return `<${iconName} size={16} className="inline-icon" />`;
  });

  if (iconsNeeded.size > 0 && content !== newContent) {
    // Add imports
    const importMatch = newContent.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];/);
    if (importMatch) {
      const existingIcons = importMatch[1].split(',').map(s => s.trim());
      iconsNeeded.forEach(i => {
        if (!existingIcons.includes(i)) existingIcons.push(i);
      });
      newContent = newContent.replace(importMatch[0], `import { ${existingIcons.join(', ')} } from 'lucide-react';`);
    } else {
      // Find the last import and insert after
      const imports = newContent.match(/^import.*$/gm);
      const importStatement = `import { ${Array.from(iconsNeeded).join(', ')} } from 'lucide-react';`;
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        newContent = newContent.replace(lastImport, lastImport + '\n' + importStatement);
      } else {
        newContent = importStatement + '\n' + newContent;
      }
    }
    
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Updated ${file}`);
  }
}
