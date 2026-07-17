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

// ONLY match emojis that are NOT immediately surrounded by quotes
const iconRegexStr = `(?<!['"\`])(?:${Object.keys(iconMap).join('|')})(?!['"\`])`;
const iconRegex = new RegExp(iconRegexStr, 'g');

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
  
  let newContent = content.replace(iconRegex, (match) => {
    const iconName = iconMap[match];
    iconsNeeded.add(iconName);
    return `<${iconName} size={16} className="inline-icon" />`;
  });

  if (iconsNeeded.size > 0 && content !== newContent) {
    // Add imports safely
    const importMatch = newContent.match(/import\s+{([^}]+)}\s+from\s+['"]lucide-react['"];/);
    if (importMatch) {
      const existingIcons = importMatch[1].split(',').map(s => s.trim());
      iconsNeeded.forEach(i => {
        if (!existingIcons.includes(i)) existingIcons.push(i);
      });
      newContent = newContent.replace(importMatch[0], `import { ${existingIcons.join(', ')} } from 'lucide-react';`);
    } else {
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
