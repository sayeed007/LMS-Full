const { generateMermaidERD, getSchemaData, generateSQLDDL } = require('../utils/modelToMermaid');

exports.getERD = (req, res, next) => {
    try {
        const mermaidDefinition = generateMermaidERD();
        const schemaData = getSchemaData();
        const sqlDDL = generateSQLDDL();

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LMS Database ERD</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
            min-height: 100vh;
            color: #e4e4e4;
        }
        
        .header {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            z-index: 100;
        }
        
        .header h1 {
            font-size: 1.5rem;
            background: linear-gradient(90deg, #00d4ff, #7b2cbf);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .header-info {
            font-size: 0.85rem;
            color: #888;
        }
        
        .controls {
            display: flex;
            gap: 0.5rem;
        }
        
        .btn {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #7b2cbf, #00d4ff);
            color: white;
        }
        
        .btn-secondary {
            background: rgba(255, 255, 255, 0.1);
            color: #e4e4e4;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .btn-success {
            background: linear-gradient(135deg, #11998e, #38ef7d);
            color: white;
        }

        .btn-warning {
            background: linear-gradient(135deg, #f09819, #edde5d);
            color: #1a1a2e;
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }
        
        .diagram-container {
            padding: 2rem;
            overflow: auto;
            height: calc(100vh - 70px);
        }
        
        .mermaid {
            display: flex;
            justify-content: center;
            min-width: fit-content;
        }
        
        .mermaid svg {
            max-width: none !important;
        }

        /* Loading state */
        .loading {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 50vh;
            font-size: 1.2rem;
            color: #00d4ff;
        }
        
        .loading::after {
            content: '';
            width: 20px;
            height: 20px;
            border: 2px solid #00d4ff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-left: 10px;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Toast notification */
        .toast {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(0, 212, 255, 0.9);
            color: #000;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 1000;
        }
        
        .toast.show { opacity: 1; }

        /* Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: none;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        
        .modal {
            background: #1a1a2e;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            border: 1px solid rgba(255,255,255,0.1);
        }

        .modal h2 { color: #00d4ff; margin-bottom: 1rem; }
        .modal p { color: #ccc; margin-bottom: 1rem; line-height: 1.5; }
        .modal button { margin-top: 1rem; width: 100%; }

    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>🗄️ Entity Relationship Diagram</h1>
            <span class="header-info">Auto-generated from Mongoose schemas</span>
        </div>
        <div class="controls">
            <button class="btn btn-secondary" onclick="toggleTheme()">
                🌓 Theme
            </button>
            <button class="btn btn-secondary" onclick="resetZoom()">
                🔍 Reset View
            </button>
            <button class="btn btn-primary" onclick="downloadSVG()">
                📥 Export SVG
            </button>
            <button class="btn btn-success" onclick="downloadJSON()">
                📄 Export JSON
            </button>
            <button class="btn btn-warning" onclick="openDrawioModal()">
                ✏️ Draw.io (Export)
            </button>
        </div>
    </div>
    
    <div class="diagram-container" id="diagramContainer">
        <div class="loading" id="loading">Rendering diagram</div>
        <div class="mermaid" id="diagram" style="display: none;">
${mermaidDefinition}
        </div>
    </div>
    
    <div class="toast" id="toast"></div>

    <div class="modal-overlay" id="drawioModal">
        <div class="modal">
            <h2>Import to Draw.io</h2>
            <p><strong>Recommended:</strong> Use Mermaid code for best results (guarantees relationships).</p>
            
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                <h3 style="color: #00d4ff; font-size: 0.9rem; margin-bottom: 0.5rem;">Option 1: Mermaid (Best)</h3>
                <button class="btn btn-primary" onclick="copyMermaidCode()" style="margin-top: 0;">📋 Copy Mermaid Code</button>
                <ol style="margin-left: 1.5rem; color: #ccc; margin-top: 0.5rem; font-size: 0.9rem;">
                    <li>Go to <a href="https://app.diagrams.net" target="_blank" style="color: #00d4ff;">app.diagrams.net</a></li>
                    <li>Select <strong>Arrange > Insert > Advanced > Mermaid</strong></li>
                    <li>Paste the code</li>
                    <li>Click <strong>Insert</strong></li>
                </ol>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                <h3 style="color: #f09819; font-size: 0.9rem; margin-bottom: 0.5rem;">Option 2: SQL</h3>
                <button class="btn btn-secondary" onclick="downloadSQL()" style="margin-top: 0;">⬇️ Download SQL</button>
                <ol style="margin-left: 1.5rem; color: #ccc; margin-top: 0.5rem; font-size: 0.9rem;">
                    <li>Select <strong>Arrange > Insert > Advanced > SQL</strong></li>
                    <li>Paste file content</li>
                </ol>
            </div>

            <button class="btn btn-secondary" onclick="closeModal()" style="width: 100%; margin-top: 1rem;">Close</button>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    <script>
        let isDark = true;
        // Inject schema data directly from server
        const schemaData = ${JSON.stringify(schemaData)};
        const sqlData = ${JSON.stringify(sqlDDL)};
        const mermaidData = \`${mermaidDefinition.replace(/`/g, '\\`')}\`; // Escape backticks if any
        
        async function initDiagram() {
            mermaid.initialize({
                startOnLoad: false,
                theme: 'dark',
                er: {
                    layoutDirection: 'TB',
                    minEntityWidth: 100,
                    minEntityHeight: 75,
                    entityPadding: 15,
                    useMaxWidth: false
                },
                securityLevel: 'loose'
            });
            
            try {
                const element = document.getElementById('diagram');
                const { svg } = await mermaid.render('erd-svg', element.textContent.trim());
                element.innerHTML = svg;
                element.style.display = 'flex';
                document.getElementById('loading').style.display = 'none';
            } catch (error) {
                console.error('Mermaid rendering error:', error);
                document.getElementById('loading').innerHTML = 
                    '<div style="color: #ff6b6b;">Error rendering diagram. Check console for details.</div>';
            }
        }
        
        function toggleTheme() {
            isDark = !isDark;
            document.body.style.background = isDark 
                ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
            document.body.style.color = isDark ? '#e4e4e4' : '#333';
             showToast('UI theme updated');
        }
        
        function resetZoom() {
            const container = document.getElementById('diagramContainer');
            container.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
        }
        
        function downloadSVG() {
            const svg = document.querySelector('#diagram svg');
            if (!svg) {
                showToast('No diagram to export');
                return;
            }
            const svgData = new XMLSerializer().serializeToString(svg);
            const blob = new Blob([svgData], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lms-erd-diagram.svg';
            a.click();
            URL.revokeObjectURL(url);
            showToast('SVG exported successfully!');
        }

        function downloadJSON() {
            const jsonStr = JSON.stringify(schemaData, null, 2);
            const blob = new Blob([jsonStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lms-schema-data.json';
            a.click();
            URL.revokeObjectURL(url);
            showToast('JSON exported successfully!');
        }

        function downloadSQL() {
            const blob = new Blob([sqlData], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'lms-drawio-import.sql';
            a.click();
            URL.revokeObjectURL(url);
        }

        function copyMermaidCode() {
            navigator.clipboard.writeText(mermaidData).then(() => {
                showToast('Mermaid code copied to clipboard!');
            }).catch(err => {
                showToast('Failed to copy code: ' + err);
            });
        }

        function openDrawioModal() {
            document.getElementById('drawioModal').style.display = 'flex';
        }

        function closeModal() {
            document.getElementById('drawioModal').style.display = 'none';
        }
        
        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 3000);
        }
        
        // Initialize on load
        initDiagram();
    </script>
</body>
</html>`;

        // Set CSP headers to allow Mermaid.js
        res.setHeader('Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "font-src 'self' data:;"
        );
        res.setHeader('Content-Type', 'text/html');
        res.send(html);
    } catch (error) {
        next(error);
    }
};
