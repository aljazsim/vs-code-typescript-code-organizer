import globToRegExp from "glob-to-regexp";
import * as vscode from "vscode";

import { VscodeConfiguration } from "./configuration/vscode-configuration";
import { Configuration } from "./tsco-cli/configuration/configuration";
import { fileExists, getFullPath, getRelativePath, joinPath, readFile, writeFile } from "./tsco-cli/helpers/file-system-helper";
import { SourceCodeOrganizer } from "./tsco-cli/source-code/source-code-organizer";

// #region Functions (7)

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

function getOpenedEditor(filePath: string)
{
    return vscode.window.visibleTextEditors.find(e => getFullPath(e.document.uri.fsPath).toLowerCase() === getFullPath(filePath).toLowerCase());
}

async function initialize()
{
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0)
    {
        const configurationFilePath = joinPath(getFullPath(vscode.workspace.workspaceFolders[0].uri.fsPath), "tsco.json");

        if (await fileExists(configurationFilePath))
        {
            vscode.window.showWarningMessage(`TypeScript Class Organizer configuration file already exists at ${configurationFilePath}.`);
        }
        else
        {
            await writeFile(configurationFilePath, JSON.stringify(Configuration.getDefaultConfiguration(), null, 4), true);

            const document = await vscode.workspace.openTextDocument(configurationFilePath);

            await vscode.window.showTextDocument(document);

            vscode.window.showWarningMessage(`TypeScript Class Organizer created a default configuration file at ${configurationFilePath}.`);
        }
    }
}

function matches(pattern: string, text: string)
{
    return globToRegExp(pattern).test(text);
}

async function openEditor(filePath: string)
{
    let editor = getOpenedEditor(filePath);

    if (!editor)
    {
        const document = await vscode.workspace.openTextDocument(filePath);

        editor = await vscode.window.showTextDocument(document);
    }

    return editor;
}

async function organize(sourceCodeFilePath: string, configuration: Configuration)
{
    // ensure it's a ts file and the workspace root directory is present
    if (matches("**/*.ts", sourceCodeFilePath) &&
        vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0)
    {
        const sourceCodeDirectoryPath = getFullPath(vscode.workspace.workspaceFolders[0].uri.fsPath);
        const sourceCodeFilePathRelative = getRelativePath(sourceCodeDirectoryPath, sourceCodeFilePath);

        // test for include or exclude patterns
        let include = true;
        let exclude = false;

        if (configuration.files.include.length > 0)
        {
            include = configuration.files.include.some(inc => matches(inc, sourceCodeFilePathRelative) ||
                matches(inc, "./" + sourceCodeFilePathRelative));
        }

        if (configuration.files.exclude.length > 0)
        {
            exclude = configuration.files.exclude.some(exc => matches(exc, sourceCodeFilePathRelative) ||
                matches(exc, "./" + sourceCodeFilePathRelative));
        }

        if (include && !exclude)
        {
            let editor = await getOpenedEditor(sourceCodeFilePath);
            const sourceCode = editor ? editor.document.getText() : await readFile(sourceCodeFilePath);
            const organizedSourceCode = await SourceCodeOrganizer.organizeSourceCode(sourceCodeFilePath, sourceCode, configuration);

            if (organizedSourceCode !== sourceCode)
            {
                editor ??= await openEditor(sourceCodeFilePath);
                const start = new vscode.Position(0, 0);
                const end = new vscode.Position(editor.document.lineCount, editor.document.lineAt(editor.document.lineCount - 1).text.length);
                const range = new vscode.Range(start, end);
                const edit = new vscode.WorkspaceEdit();

                edit.replace(editor.document.uri, range, organizedSourceCode);

                await vscode.workspace.applyEdit(edit);

                return true;
            }
        }
    }

    return false;
}

async function organizeAll(configuration: Configuration)
{
    let files = 0;
    let organized = 0;

    for (const filePath of await vscode.workspace.findFiles("**/*.ts", "**/node_modules/**"))
    {
        files++;

        if (await organize(getFullPath(filePath.fsPath), configuration))
        {
            organized++;
        }
    }

    if (organized > 0)
    {
        vscode.window.showInformationMessage(`TypeScript Class Organizer organized ${organized} file${files > 1 ? "s" : ""} out of ${files} file${files > 1 ? "s" : ""}.`);
    }
    else
    {
        vscode.window.showInformationMessage(`TypeScript Class Organizer did not find any files in need of organizing.`);
    }
}

// #endregion Functions

// #region Exported Functions (1)

export function activate(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('tsco.initialize', async () => await initialize()));
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organize', async () => vscode.window.activeTextEditor?.document.uri.fsPath && await organize(getFullPath(vscode.window.activeTextEditor!.document.uri.fsPath), await getConfiguration())));
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organizeAll', async () => await organizeAll(await getConfiguration())));

    vscode.workspace.onDidChangeConfiguration(() => configuration = VscodeConfiguration.getConfiguration());
    vscode.workspace.onWillSaveTextDocument(async (e) => configuration.organizeOnSave && await organize(getFullPath(e.document.uri.fsPath), await getConfiguration()));
}

// #endregion Exported Functions

// #region Variables (1)

let configuration = VscodeConfiguration.getConfiguration();

// #endregion Variables
