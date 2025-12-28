// @ts-nocheck
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Create a channel to show logs and the Final Summary
const outputChannel = vscode.window.createOutputChannel("AI Code Reviewer");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

    let disposable = vscode.commands.registerCommand('ai-reviewer.startReview', async () => {
        
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("Please open a file to review.");
            return;
        }

        const config = vscode.workspace.getConfiguration('aiReviewer');
        const apiKey = config.get('apiKey');
        
        if (!apiKey) {
            vscode.window.showErrorMessage("API Key missing. Go to Settings > AI Reviewer.");
            return;
        }

        const filePath = editor.document.fileName;
        const fileContent = editor.document.getText();
        
        outputChannel.clear(); 
        outputChannel.show();
        outputChannel.appendLine(`🚀 Starting review for: ${path.basename(filePath)}`);

        // Show Progress Bar
        await vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "AI is reviewing...",
            cancellable: false
        }, async () => {
            try {
                await runAgentOnSingleFile(apiKey, filePath, fileContent);
            } catch (error) {
                vscode.window.showErrorMessage(`Error: ${error.message}`);
                outputChannel.appendLine(`Error: ${error.message}`);
            }
        });
    });

    context.subscriptions.push(disposable);
}

// ==========================================
// CORE LOGIC (With Loop & Summary)
// ==========================================

async function runAgentOnSingleFile(apiKey, filePath, fileContent) {
    
    // Dynamic Import
    const { GoogleGenAI, Type } = await import("@google/genai");

    const ai = new GoogleGenAI({ apiKey });

    // Define the tools
    const tools = {
        'propose_fix': async ({ fixed_content, explanation }) => {
            
            outputChannel.appendLine(`\n💡 AI Suggestion: ${explanation}`);
            outputChannel.appendLine(`   Asking user for permission...`);
            
            const fileName = path.basename(filePath);
            const tempFilePath = path.join(os.tmpdir(), `FIX_${fileName}`);
            fs.writeFileSync(tempFilePath, fixed_content, 'utf-8');

            const originalUri = vscode.Uri.file(filePath);
            const tempUri = vscode.Uri.file(tempFilePath);
            
            // Show Diff View
            await vscode.commands.executeCommand(
                'vscode.diff', 
                originalUri, 
                tempUri, 
                `Original ↔ AI Fix`
            );

            // Ask User
            const selection = await vscode.window.showInformationMessage(
                `AI Suggestion: ${explanation}`, 
                "✅ Accept Fix", 
                "❌ Reject"
            );

            // Close the diff editor to clean up
            await vscode.commands.executeCommand('workbench.action.closeActiveEditor');

            if (selection === "✅ Accept Fix") {
                fs.writeFileSync(filePath, fixed_content, 'utf-8');
                vscode.window.showInformationMessage("Fix applied!");
                outputChannel.appendLine("   ✅ User ACCEPTED the fix.");
                return { result: "User accepted the fix. The file has been updated." };
            } else {
                outputChannel.appendLine("   ❌ User REJECTED the fix.");
                return { result: "User rejected the fix. Do not apply changes." };
            }
        }
    };

    // Tool Definition
    const toolConfig = {
        functionDeclarations: [{
            name: "propose_fix",
            description: "Propose a fix for the code.",
            parameters: {
                type: Type.OBJECT, 
                properties: { 
                    fixed_content: { type: Type.STRING, description: "The fixed code" },
                    explanation: { type: Type.STRING, description: "What you fixed" }
                },
                required: ["fixed_content", "explanation"]
            }
        }]
    };

    // Initial History
    const history = [{
        role: 'user',
        parts: [{ text: `Review this code:\n\n${fileContent}\n\nIf issues found, use propose_fix. After you are done (or if the user rejects), provide a detailed SUMMARY REPORT.` }]
    }];

    // ============================================
    // THE LOOP (Restored)
    // ============================================
    while (true) {
        
        // 1. Send request to AI
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: history,
            config: { tools: [toolConfig] }
        });

        const call = result.functionCalls?.[0];

        if (call) {
            // --- CASE A: AI Wants to Fix Code ---
            
            // 1. Add AI's request to history
            history.push({
                role: "model",
                parts: [{ functionCall: call }]
            });

            // 2. Run the tool (Ask User)
            // @ts-ignore
            const toolResponse = await tools[call.name](call.args);

            // 3. Add result back to history
            history.push({
                role: "user",
                parts: [{
                    functionResponse: {
                        name: call.name,
                        response: { result: toolResponse }
                    }
                }]
            });

            // Loop continues... AI will now generate the summary based on the result!

        } else {
            // --- CASE B: AI is Done (Summary Report) ---
            
            const summary = result.text;
            
            // Print the Summary to the Output Channel
            outputChannel.appendLine("\n" + "=".repeat(30));
            outputChannel.appendLine(summary);
            outputChannel.appendLine("=".repeat(30));
            
            // Notify user
            vscode.window.showInformationMessage("Review Complete! Check the 'Output' panel for the summary.");
            
            break; // Stop the loop
        }
    }
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};