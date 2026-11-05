const fs = require('fs');
const path = require('path');
const { compile } = require('@tailwindcss/node');
const { Scanner } = require('@tailwindcss/oxide');

async function buildCss() {
  try {
    const rootDir = process.cwd();
    const inputCssPath = path.join(rootDir, 'src', 'app', 'globals.raw.css');
    const outputCssPath = path.join(rootDir, 'src', 'app', 'globals.css');

    // If globals.raw.css doesn't exist, read from globals.css
    let rawCss;
    if (fs.existsSync(inputCssPath)) {
      rawCss = fs.readFileSync(inputCssPath, 'utf8');
    } else {
      rawCss = `@import "tailwindcss";

@layer base {
  body {
    background-color: #f8fafc;
    color: #0f172a;
    font-family: 'Noto Sans Devanagari', 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    -webkit-tap-highlight-color: transparent;
  }
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-track {
  background: #f1f5f9;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes pulseAudio {
  0% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.18); opacity: 0.35; }
  100% { transform: scale(1); opacity: 0.9; }
}

.pulse-listening {
  animation: pulseAudio 1.4s ease-in-out infinite;
}
`;
      fs.writeFileSync(inputCssPath, rawCss);
    }

    const compiler = await compile(rawCss, {
      from: inputCssPath,
      base: rootDir,
      onDependency: () => {}
    });

    const scanner = new Scanner({
      sources: [
        { base: path.join(rootDir, 'src'), pattern: '**/*.{tsx,ts,jsx,js,html}', negated: false }
      ]
    });

    const candidates = scanner.scan();
    const builtCss = compiler.build(candidates);

    fs.writeFileSync(outputCssPath, builtCss);
    console.log(`[compile-css] Successfully built ${outputCssPath} (${builtCss.length} bytes, ${candidates.length} candidate classes).`);
  } catch (err) {
    console.error('[compile-css] Error compiling Tailwind CSS:', err);
    process.exit(1);
  }
}

buildCss();
