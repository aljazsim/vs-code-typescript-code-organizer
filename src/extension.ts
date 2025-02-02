import { glob } from "glob";
import * as vscode from "vscode";

import { VscodeConfiguration } from "./configuration/vscode-configuration";
import { Configuration } from "./tsco-cli/configuration/configuration";
import { fileExists, getDirectoryPath, getFullPath, joinPath, writeFile } from "./tsco-cli/helpers/file-system-helper";
import { SourceCodeOrganizer } from "./tsco-cli/source-code/source-code-organizer";

// #region Functions (4)

async function getConfiguration()
{
    const files = await vscode.workspace.findFiles("**/tsco.json");

    if (files && files.length == 1)
    {
        return await Configuration.getConfiguration(getFullPath(files[0].fsPath));
    }
    else
    {
        return Configuration.getDefaultConfiguration();
    }
}

async function initialize()
{
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        const configurationFilePath = joinPath(getFullPath(vscode.workspace.workspaceFolders[0].uri.fsPath), "tsco.json");

        if (await fileExists(configurationFilePath))
        {
            vscode.window.showWarningMessage(`TSCO configuration file already exists at ${configurationFilePath}`);
        }
        else
        {
            await writeFile(configurationFilePath, JSON.stringify(Configuration.getDefaultConfiguration(), null, 4), true);

            const document = await vscode.workspace.openTextDocument(configurationFilePath);

            await vscode.window.showTextDocument(document);
        }
    }

}

async function organize(editor: vscode.TextEditor | undefined, configuration: Configuration): Promise<void>
{
    if (editor && vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        const sourceCodeDirectoryPath = getDirectoryPath(getFullPath(vscode.workspace.workspaceFolders[0].uri.fsPath));
        const filePath = getFullPath(editor.document.uri.fsPath);
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

// #endregion Functions

// #region Exported Functions (2)

export function activate(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('tsco.initialize', async () => await initialize()));
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

export async function getFilePaths(sourcesDirectoryPath: string, configuration: Configuration, filePath: string | null = null)
{
    const include = configuration.files.include.map(fp => joinPath(sourcesDirectoryPath, fp))
    const exclude = configuration.files.exclude.map(fp => joinPath(sourcesDirectoryPath, fp))
    const filePaths = (await glob(include, { ignore: exclude })).map(fp => getFullPath(fp)).sort();

    if (filePath)
    {
        return filePaths.map(fp => getFullPath(fp)).filter(fp => fp.toLowerCase() === getFullPath(filePath).toLowerCase());
    }
    else
    {
        return filePaths.sort();
    }
}

// #endregion Exported Functions

// #region Variables (1)

let configuration = VscodeConfiguration.getConfiguration();

// #endregion Variables
