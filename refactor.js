const fs = require("node:fs");
const path = require("node:path");

const dirsToCreate = [
  "src/features",
  "src/server/db",
  "src/server/auth",
  "src/server/socket",
  "src/hooks",
];

dirsToCreate.forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const filesToMove = [
  { from: "src/lib/prisma.ts", to: "src/server/db/prisma.ts" },
  { from: "src/lib/auth.ts", to: "src/server/auth/auth.ts" },
  { from: "src/lib/auth-client.ts", to: "src/server/auth/auth-client.ts" },
  { from: "src/lib/get-session.ts", to: "src/server/auth/get-session.ts" },
  {
    from: "src/lib/auth-capabilities.ts",
    to: "src/server/auth/auth-capabilities.ts",
  },
  { from: "src/context/AuthContext.tsx", to: "src/hooks/AuthContext.tsx" },
  {
    from: "src/context/PresenceContext.tsx",
    to: "src/hooks/PresenceContext.tsx",
  },
  { from: "server/socket.ts", to: "src/server/socket/socket.ts" },
];

filesToMove.forEach(({ from, to }) => {
  const fromPath = path.join(__dirname, from);
  const toPath = path.join(__dirname, to);
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved ${from} to ${to}`);
  }
});

// Remove old directories if empty
["src/context", "server"].forEach((dir) => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmdirSync(fullPath);
      console.log(`Removed empty directory ${dir}`);
    } catch (_e) {
      console.log(`Could not remove ${dir} (might not be empty)`);
    }
  }
});

// Update package.json
const pkgPath = path.join(__dirname, "package.json");
if (fs.existsSync(pkgPath)) {
  let pkg = fs.readFileSync(pkgPath, "utf8");
  pkg = pkg.replace(
    /"dev:socket": "tsx server\/socket\.ts"/g,
    '"dev:socket": "tsx src/server/socket/socket.ts"',
  );
  pkg = pkg.replace(
    /"dev:all": "concurrently \\"next dev\\" \\"tsx server\/socket\.ts\\""/g,
    '"dev:all": "concurrently \\"next dev\\" \\"tsx src/server/socket/socket.ts\\""',
  );
  fs.writeFileSync(pkgPath, pkg);
  console.log("Updated package.json");
}

// Update imports across the project
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      if (f !== "node_modules" && f !== ".next" && f !== "generated") {
        walkDir(dirPath, callback);
      }
    } else {
      if (f.endsWith(".ts") || f.endsWith(".tsx")) {
        callback(dirPath);
      }
    }
  });
}

const replacements = [
  { regex: /@\/lib\/prisma/g, replacement: "@/server/db/prisma" },
  { regex: /@\/lib\/auth-client/g, replacement: "@/server/auth/auth-client" },
  {
    regex: /@\/lib\/auth-capabilities/g,
    replacement: "@/server/auth/auth-capabilities",
  },
  { regex: /@\/lib\/auth/g, replacement: "@/server/auth/auth" },
  { regex: /@\/lib\/get-session/g, replacement: "@/server/auth/get-session" },
  { regex: /@\/context\//g, replacement: "@/hooks/" },
  {
    regex: /\.\.\/server\/socket/g,
    replacement: "../src/server/socket/socket",
  },
  {
    regex: /\.\.\/\.\.\/server\/socket/g,
    replacement: "../../src/server/socket/socket",
  },
];

walkDir(path.join(__dirname, "src"), (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  replacements.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated imports in ${filePath}`);
  }
});
