const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '../server.js');
const routesDir = path.join(__dirname, '../routes');

// Read server.js
const serverContent = fs.readFileSync(serverFile, 'utf8');

// Regex to find app.use('/api/xxx', require('./routes/yyy'))
// Also handle variables: const userRoutes = require('./routes/users'); app.use('/api/users', userRoutes);
const routeMounts = [];

// Match direct requires
const directRegex = /app\.use\(\s*['"`](\/api\/.*?)['"`]\s*,\s*require\(\s*['"`]\.\/routes\/(.*?)['"`]\s*\)\s*\)/g;
let match;
while ((match = directRegex.exec(serverContent)) !== null) {
  routeMounts.push({ mountPath: match[1], fileName: match[2] + '.js' });
}

// Match variable requires
const varRequireRegex = /const\s+([a-zA-Z0-9_]+)\s*=\s*require\(\s*['"`]\.\/routes\/(.*?)['"`]\s*\)/g;
const varMap = {};
while ((match = varRequireRegex.exec(serverContent)) !== null) {
  varMap[match[1]] = match[2] + '.js';
}

const varUseRegex = /app\.use\(\s*['"`](\/api\/.*?)['"`]\s*,\s*([a-zA-Z0-9_]+)\s*\)/g;
while ((match = varUseRegex.exec(serverContent)) !== null) {
  const mountPath = match[1];
  const varName = match[2];
  if (varMap[varName]) {
    routeMounts.push({ mountPath: mountPath, fileName: varMap[varName] });
  }
}

console.log('Found route mounts:', routeMounts.length);

routeMounts.forEach(mount => {
  const filePath = path.join(routesDir, mount.fileName);
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"`](.*?)['"`]/g;
  let modifications = [];
  let routeMatch;
  
  while ((routeMatch = routeRegex.exec(content)) !== null) {
    const method = routeMatch[1];
    let routePath = routeMatch[2];
    const index = routeMatch.index;
    
    // Check if there's already a swagger comment right before this
    const textBefore = content.substring(Math.max(0, index - 300), index);
    if (textBefore.includes('@swagger')) {
       continue; // Skip, already documented
    }
    
    // Clean up paths
    if (routePath === '/') routePath = '';
    
    // Convert express path params /:id to swagger /{id}
    const swaggerRoutePath = routePath.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');
    const fullPath = (mount.mountPath + swaggerRoutePath).replace(/\/+/g, '/');
    
    const tagName = mount.mountPath.replace('/api/', '').split('/')[0];
    const capitalizedTag = tagName.charAt(0).toUpperCase() + tagName.slice(1);
    
    // Extract parameters for swagger block
    const pathParams = [];
    const paramRegex = /\{([a-zA-Z0-9_]+)\}/g;
    let pMatch;
    while ((pMatch = paramRegex.exec(swaggerRoutePath)) !== null) {
      pathParams.push(pMatch[1]);
    }
    
    let paramsYaml = '';
    if (pathParams.length > 0) {
      paramsYaml = '\n *     parameters:';
      pathParams.forEach(p => {
        paramsYaml += `\n *       - in: path\n *         name: ${p}\n *         required: true\n *         schema:\n *           type: string`;
      });
    }
    
    const swaggerBlock = `/**
 * @swagger
 * ${fullPath}:
 *   ${method}:
 *     summary: ${method.toUpperCase()} ${fullPath}
 *     tags: [${capitalizedTag}]
 *     security:
 *       - bearerAuth: []${paramsYaml}
 *     responses:
 *       200:
 *         description: Successful response
 */
`;
    modifications.push({ index, block: swaggerBlock });
  }
  
  // Apply from bottom to top
  if (modifications.length > 0) {
    for (let i = modifications.length - 1; i >= 0; i--) {
      const mod = modifications[i];
      content = content.slice(0, mod.index) + mod.block + content.slice(mod.index);
    }
    fs.writeFileSync(filePath, content);
    console.log(`Auto-documented ${modifications.length} routes in ${mount.fileName}`);
  }
});
console.log('Done!');
