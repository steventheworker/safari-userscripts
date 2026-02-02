import esbuild from "esbuild";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "src");
const OUT = path.join(ROOT, "Userscripts");
const ONCE = process.argv.includes("--once");

const HEADER_RE =
    /\/\/\s*==UserScript==([\s\S]*?)\/\/\s*==\/UserScript==/m;

function extractHeader(file) {
    const text = fs.readFileSync(file, "utf8");
    const m = text.match(HEADER_RE);
    if (!m) return null;
    return `// ==UserScript==\n${m[1].trim()}\n// ==/UserScript==\n\n`;
}

function stripHeader(text) {
    return text.replace(HEADER_RE, "").trimStart();
}

/*
    buildOne
*/
async function buildOne(dir, isPrivate = false) {
    const entry = path.join(dir, "index.ts");
    const name = path.basename(dir);

    const header = extractHeader(entry);
    if (!header) {
        console.warn(`⚠️  ${name}: missing userscript header`);
        return;
    }

    const outfile = path.join(
        OUT,
        `${name}.user.js`
    );

    fs.mkdirSync(path.dirname(outfile), { recursive: true });

    const ctx = await esbuild.context({
        entryPoints: [entry],
        bundle: true,
        format: "iife",
        target: "es2020",
        write: false,
        logLevel: "silent",
    });

    async function rebuild(label) {
        try {
            const result = await ctx.rebuild();
            const js = stripHeader(result.outputFiles[0].text);
            fs.writeFileSync(outfile, header + js);
            console.log(`${label} ${name}`);
        } catch (err) {
            console.error(`❌ ${name}`, err.message);
        }
    }

    // initial build
    await rebuild("✅ built");

    if (!ONCE) {
        await ctx.watch();
        fs.watch(dir, { recursive: true }, async () => {
            await rebuild("🔁 rebuilt ");
        });
    }
}


/*
    _js
*/
function copyUserJS(srcFile, isPrivate = false) {
    fs.mkdirSync(OUT, { recursive: true });

    const dest = path.join(OUT, path.basename(srcFile));
    fs.copyFileSync(srcFile, dest);
    console.log(`📄 copied ${path.basename(srcFile)}`);
}

function watchUserJS(dir, isPrivate = false) {
    for (const file of fs.readdirSync(dir)) {
        if (file.endsWith(".user.js")) {
            copyUserJS(path.join(dir, file), isPrivate);
        }
    }

    if (!ONCE) {
        fs.watch(dir, (_event, filename) => {
            if (!filename || !filename.endsWith(".user.js")) return;
            copyUserJS(path.join(dir, filename), isPrivate);
        });
    }
}


/*
    tryPath
 */
async function tryPath(dir, entry) {
    if (entry === ".git" || entry === "node_modules") return;
    const full = path.join(dir, entry);
    if (!fs.statSync(full).isDirectory()) return;
    if (!fs.existsSync(path.join(full, "index.ts"))) {// recurse organizational folders
        for (const _entry of fs.readdirSync(full)) tryPath(full, _entry);
        return;
    }
    await buildOne(full);
}


/*
    main
*/
async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    for (const entry of fs.readdirSync(SRC)) {
        tryPath(SRC, entry);
        // watch raw .user.js (_js) folders
        const full = path.join(SRC, entry);
        if (entry === "_private") { // PRIVATE
            for (const item of fs.readdirSync(full)) {
                const subdir = path.join(full, item);
                if (fs.statSync(subdir).isDirectory() && item === "_js")
                    watchUserJS(subdir, true);
            }
        } else if (entry === "_js") watchUserJS(full, false); // PUBLIC RAW JS

    }
    if (!ONCE) console.log("👀 watching…");
    else process.exit(0);
}

main();
