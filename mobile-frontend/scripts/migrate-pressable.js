const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));

let filesModified = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  if (content.includes('TouchableOpacity')) {
    // 1. Replace import
    // Matches: import { ..., TouchableOpacity, ... } from 'react-native'
    content = content.replace(/import\s+{([^}]*)}\s+from\s+['"]react-native['"]/g, (match, p1) => {
      if (p1.includes('TouchableOpacity')) {
        let newImport = p1.replace(/TouchableOpacity/g, 'Pressable');
        // Clean up duplicate Pressable if already there
        const parts = newImport.split(',').map(s => s.trim()).filter(Boolean);
        const unique = [...new Set(parts)];
        return `import { ${unique.join(', ')} } from 'react-native'`;
      }
      return match;
    });

    // 2. Replace closing tag
    content = content.replace(/<\/TouchableOpacity>/g, '</Pressable>');

    // 3. Replace opening tag and adapt style
    // This regex looks for <TouchableOpacity ... > and captures everything inside.
    // We then search for style={...} inside it and replace it.
    let oldContent = content;
    
    // We need to replace `<TouchableOpacity` with `<Pressable`
    // And remove `activeOpacity={...}` if it exists
    content = content.replace(/<TouchableOpacity([^>]*)>/g, (match, props) => {
      let newProps = props.replace(/\s*activeOpacity=\{[^}]*\}/g, '');
      newProps = newProps.replace(/\s*activeOpacity=[\"'][^\"']*[\"']/g, '');

      // Try to adapt style prop
      // Regex for style={...} or style={[...]}
      // This is basic but works for most standard cases
      newProps = newProps.replace(/style=\{([^}]*)\}/g, (styleMatch, styleInner) => {
        // If it already uses pressed (unlikely for TouchableOpacity), ignore
        if (styleInner.includes('pressed')) return styleMatch;
        return `style={({ pressed }) => [${styleInner}, pressed && { opacity: 0.7 }]}`;
      });

      return `<Pressable${newProps}>`;
    });

    if (oldContent !== content) {
      fs.writeFileSync(file, content, 'utf8');
      filesModified++;
      console.log(`Modified: ${file}`);
    }
  }
});

console.log(`Migration complete. Files modified: ${filesModified}`);
