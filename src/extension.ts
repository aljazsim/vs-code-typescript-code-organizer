import * as vscode from "vscode";
import { VscodeConfiguration } from "./configuration/vscode-configuration.js";
import { SourceCodeOrganizer } from "./tsco-cli/source-code/source-code-organizer.js";
import { Configuration } from "./tsco-cli/configuration/configuration.js";
import { getFilePaths, } from "./tsco-cli/index-helper.js";
import { getDirectoryPath, getFullPath } from "./tsco-cli/helpers/file-system-helper.js";

// #region Functions (4)

export function activate(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organize', async () => await organize(vscode.window.activeTextEditor, await getConfiguration())));
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organizeAll', async () => await organizeAll(await getConfiguration())));

    vscode.workspace.onDidChangeConfiguration(() => configuration = VscodeConfiguration.getConfiguration());

    vscode.workspace.onWillSaveTextDocument(async (e) => 
    {
        if (configuration.organizeOnSave) 
        {
            const editor = vscode.window.visibleTextEditors.find(vte => vte.document.uri.toString() === e.document.uri.toString());

            if (editor) 
            {
                await organize(editor, await getConfiguration());
            }
        }
    });
}

async function getConfiguration()
{
    const files = await vscode.workspace.findFiles("tsco.json");

    if (files && files.length == 1)
    {
        return await Configuration.getConfiguration(files[0].fsPath);
    }
    else
    {
        return Configuration.getDefaultConfiguration();
    }
}

async function organize(editor: vscode.TextEditor | undefined, configuration: Configuration): Promise<void>
{
    if (editor && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        const sourceCodeDirectoryPath = getDirectoryPath(vscode.workspace.workspaceFolders[0].uri.toString());
        const filePath = getFullPath(editor.document.uri.toString());
        const filePaths = await getFilePaths(sourceCodeDirectoryPath, configuration, filePath);

        if (filePaths.length === 1)
        {
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(editor.document.lineCount, editor.document.lineAt(editor.document.lineCount - 1).text.length);
            const range = new vscode.Range(start, end);
            const edit = new vscode.WorkspaceEdit();

            const sourceCodeFilePath = filePaths[0];
            const sourceCode = editor.document.getText();
            const organizedSourceCode = await SourceCodeOrganizer.organizeSourceCode(sourceCodeFilePath, sourceCode, configuration);

            if (organizedSourceCode !== sourceCode)
            {
                edit.replace(editor.document.uri, range, organizedSourceCode);

                await vscode.workspace.applyEdit(edit);
            }
        }
    }
}

async function organizeAll(configuration: Configuration)
{
    for (const filePath of await vscode.workspace.findFiles("**/*.ts", "**/node_modules/**"))
    {
        const document = await vscode.workspace.openTextDocument(filePath);
        const editor = await vscode.window.showTextDocument(document);

        await organize(editor, configuration);
    }
}

// #endregion Functions (4)

// #region Variables (1)

let configuration = VscodeConfiguration.getConfiguration();

// #endregion Variables (1)
