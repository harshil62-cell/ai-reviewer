# AI Code Reviewer & Fixer 🤖✨

**Your intelligent pair programmer.** Review code, fix bugs, and optimize logic instantly using Google Gemini AI—directly inside VS Code.

> **Note:** This extension puts YOU in control. It never modifies your files without your explicit permission. You see a side-by-side "Diff" and choose to `✅ Accept` or `❌ Reject` every change.

## ✨ Features

* **🔍 Instant Code Analysis:** Detects bugs, syntax errors, and security risks in seconds.
* **🛡️ Human-in-the-Loop:** Uses the VS Code "Diff View" to propose changes. Nothing is saved until you approve.
* **⚡ Powered by Gemini:** Utilizes the latest Google Gemini 2.0 Flash model for fast, accurate fixes.
* **📊 Summary Reports:** Get a detailed breakdown of what was fixed and why in the Output panel.
* **📝 Explanation First:** The AI explains *why* it is suggesting a change before asking you to apply it.

## 🚀 How to Use

1.  Open any code file (JS, TS, HTML, CSS, etc.) in VS Code.
2.  Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3.  Type and select: **`AI: Review Current File`**.
4.  Wait for the analysis...
5.  **Review the Diff:** The extension will open a comparison view.
    * **Left:** Your original code.
    * **Right:** The AI's suggested fix.
6.  Click **Accept Fix** to apply changes or **Reject** to discard them.

## ⚙️ Extension Settings

This extension requires a Google Gemini API Key to function.

1.  Get your **free** API Key from [Google AI Studio](https://aistudio.google.com/).
2.  In VS Code, go to **File > Preferences > Settings**.
3.  Search for `AI Reviewer`.
4.  Paste your key into the **Api Key** field.

| Setting | Description |
|Str |Str |
| `aiReviewer.apiKey` | Your personal Google Gemini API Key. |

## 🔒 Privacy & Security Disclaimer

**Transparency is our priority.**

* **Data Transmission:** To perform the review, the content of the *currently active file* is sent to Google's Gemini API.
* **No Storage:** This extension does not store your code on any external servers.
* **Your Control:** No code is written to your disk until you click "Accept Fix."
* **API Key:** Your API key is stored locally in your VS Code settings.

## 📦 Installation

1.  Install via the Visual Studio Code Marketplace (Search "AI Code Reviewer").
2.  Or, download the `.vsix` file and install manually.

## 📝 Release Notes

### 0.0.1
* Initial release.
* Added "Propose Fix" feature with Diff View.
* Added Summary Reports.

---

**Enjoying the extension?** Please leave a review! ⭐️⭐️⭐️⭐️⭐️