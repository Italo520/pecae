const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

function addJdbcTypeCode() {
    const root = path.join(__dirname, 'backend', 'src', 'main', 'java', 'com', 'pecae', 'api');
    
    walkDir(root, (filePath) => {
        if (filePath.endsWith('.java')) {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;

            // Only modify entities/models that have private UUID fields
            if (content.includes('private UUID ')) {
                // Check if it already has JdbcTypeCode
                if (!content.includes('@JdbcTypeCode')) {
                    // Replace 'private UUID ' with '@JdbcTypeCode(SqlTypes.VARCHAR)\n    private UUID '
                    // Need to handle indentation correctly
                    content = content.replace(/^(\s*)(?:@[\w\(\)\s=,"]*\n)*(\s*)private UUID /gm, (match, p1, p2) => {
                        // match contains the existing annotations + private UUID
                        // we need to insert @JdbcTypeCode before private UUID
                        if (match.includes('@JdbcTypeCode')) return match;
                        
                        let baseIndent = p2 || p1;
                        if (!baseIndent) baseIndent = '    ';
                        
                        return match.replace(/private UUID /, `@JdbcTypeCode(SqlTypes.VARCHAR)\n${baseIndent}private UUID `);
                    });
                    
                    // Add imports if they were used
                    if (content.includes('@JdbcTypeCode') && !content.includes('import org.hibernate.annotations.JdbcTypeCode;')) {
                        content = content.replace(/(import java\.util\.UUID;)/, "$1\nimport org.hibernate.annotations.JdbcTypeCode;\nimport org.hibernate.type.SqlTypes;");
                        modified = true;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

addJdbcTypeCode();
