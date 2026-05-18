"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const verifyPRCmd = vscode.commands.registerCommand("apohara-probant.verifyPR", async () => {
        const diff = await getCurrentDiff();
        if (!diff) {
            vscode.window.showWarningMessage("No git diff found in current workspace.");
            return;
        }
        await runVerification(diff, "Git diff");
    });
    const verifySelectionCmd = vscode.commands.registerCommand("apohara-probant.verifySelection", async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage("No active editor.");
            return;
        }
        const selection = editor.document.getText(editor.selection);
        if (!selection.trim()) {
            vscode.window.showWarningMessage("No selection. Select code to verify.");
            return;
        }
        await runVerification(selection, "Selection");
    });
    context.subscriptions.push(verifyPRCmd, verifySelectionCmd);
}
async function getCurrentDiff() {
    // Use git CLI via vscode.workspace.workspaceFolders + child_process
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0)
        return null;
    const cwd = folders[0].uri.fsPath;
    return new Promise((resolve) => {
        const { exec } = require("child_process");
        exec("git diff HEAD", { cwd }, (err, stdout) => {
            resolve(err ? null : stdout);
        });
    });
}
async function runVerification(code, sourceName) {
    const config = vscode.workspace.getConfiguration("apohara");
    const apiUrl = config.get("apiUrl", "https://api.apohara.dev");
    const geminiKey = config.get("geminiApiKey", "");
    const useDemoKey = !geminiKey;
    const endpoint = useDemoKey ? "/v1/demo_verify" : "/v1/verify";
    const body = useDemoKey
        ? { task_input: code }
        : { task_input: code, gemini_api_key: geminiKey };
    await vscode.window.withProgress({
        location: vscode.ProgressLocation.Notification,
        title: `Apohara: verifying ${sourceName}...`,
        cancellable: false,
    }, async () => {
        try {
            const resp = await fetch(`${apiUrl}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });
            if (!resp.ok) {
                vscode.window.showErrorMessage(`Apohara HTTP ${resp.status}`);
                return;
            }
            const data = (await resp.json());
            displayVerdict(data);
        }
        catch (e) {
            vscode.window.showErrorMessage(`Apohara error: ${e.message}`);
        }
    });
}
function displayVerdict(r) {
    const color = r.verdict === "verified" ? "✓" : r.verdict === "risky" ? "⚠" : "✕";
    const harmful = r.attackers.filter((a) => a.found_issue).length;
    const total = r.attackers.length;
    const msg = `${color} Apohara: ${r.verdict.toUpperCase()} — ${harmful}/${total} attackers flagged | cost $${r.cost_estimate_usd.toFixed(4)} | latency ${(r.latency_ms / 1000).toFixed(1)}s`;
    if (r.verdict === "verified")
        vscode.window.showInformationMessage(msg);
    else if (r.verdict === "risky")
        vscode.window.showWarningMessage(msg);
    else
        vscode.window.showErrorMessage(msg);
    // Show details in output channel
    const out = vscode.window.createOutputChannel("Apohara PROBANT");
    out.show(true);
    out.appendLine(`=== Verdict: ${r.verdict} (signed_hash: ${r.signed_hash.slice(0, 16)}...) ===`);
    for (const a of r.attackers) {
        const mark = a.found_issue ? "FLAGGED" : "ok";
        out.appendLine(`[${mark}] ${a.vendor}:${a.model}: ${a.reasoning}`);
    }
}
function deactivate() { }
//# sourceMappingURL=extension.js.map