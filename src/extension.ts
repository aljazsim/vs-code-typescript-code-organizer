import globToRegExp from "glob-to-regexp";
import * as vscode from "vscode";

import { Settings } from "./settings/settings";
import { Configuration } from "./tsco-cli/configuration/configuration";
import { fileExists, getDirectoryPath, getFullPath, getRelativePath, joinPath, readFile, writeFile } from "./tsco-cli/helpers/file-system-helper";
import { SourceCodeOrganizer } from "./tsco-cli/source-code/source-code-organizer";

// #region Functions (10)

async function getConfiguration(configurationFilePath: string | null)
{
    if (configurationFilePath)
    {
        if (await fileExists(configurationFilePath))
        {
            output.appendLine(`tsco using configuration file ${configurationFilePath}`);

            // absolute configuration file path from settings
            return await Configuration.getConfiguration(configurationFilePath);
        }
        else if (await fileExists(joinPath(getWorkspaceRootDirectoryPath(), configurationFilePath)))
        {
            output.appendLine(`tsco using configuration file ${joinPath(getWorkspaceRootDirectoryPath(), configurationFilePath)}`);

            // relative configuration file path from settings
            return await Configuration.getConfiguration(joinPath(getWorkspaceRootDirectoryPath(), configurationFilePath));
        }
        else
        {
            output.appendLine(`tsco configuration file ${getFullPath(configurationFilePath)} not found`);
        }
    }

    let workspaceRootDirectoryPath = getWorkspaceRootDirectoryPath();

    configurationFilePath = joinPath(workspaceRootDirectoryPath, "tsco.json");

    if (await fileExists(configurationFilePath))
    {
        output.appendLine(`tsco using configuration file ${configurationFilePath}`);

        // look in workspace root
        return await Configuration.getConfiguration(configurationFilePath);
    }

    // go one folder up to see if there's a configuration file
    while (workspaceRootDirectoryPath != getDirectoryPath(workspaceRootDirectoryPath))
    {
        workspaceRootDirectoryPath = getDirectoryPath(workspaceRootDirectoryPath);
        configurationFilePath = joinPath(workspaceRootDirectoryPath, "tsco.json");

        if (await fileExists(configurationFilePath))
        {
            output.appendLine(`tsco using configuration file ${configurationFilePath}`);

            return await Configuration.getConfiguration(configurationFilePath);
        }
    }

    output.appendLine("tsco using default configuration");

    // default configuration
    return Configuration.getDefaultConfiguration();
}

function getOpenedEditor(filePath: string)
{
    return vscode.window.visibleTextEditors.find(e => getFullPath(e.document.uri.fsPath).toLowerCase() === getFullPath(filePath).toLowerCase());
}

function getWorkspaceRootDirectoryPath()
{
    if (vscode.workspace.workspaceFolders &&
        vscode.workspace.workspaceFolders.length > 0)
    {
        return getFullPath(vscode.workspace.workspaceFolders[0].uri.fsPath)
    }

    return getFullPath("./");
}

function matches(pattern: string, text: string)
{
    return globToRegExp(pattern).test(text);
}

async function onInitialize()
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

async function onOrganize(sourceCodeFilePath: string | undefined | null)
{
    if (sourceCodeFilePath)
    {
        sourceCodeFilePath = getFullPath(sourceCodeFilePath);

        if (matches("**/*.ts", sourceCodeFilePath) && await fileExists(sourceCodeFilePath))
        {
            return await organize(sourceCodeFilePath, await getConfiguration(settings.configurationFilePath))
        }
    }

    return false;
}

async function onOrganizeAll()
{
    const configuration = await getConfiguration(settings.configurationFilePath);

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

async function onSave(sourceCodeFilePath: string)
{
    if (settings.organizeOnSave)
    {
        const editor = vscode.window.visibleTextEditors.find(ed => ed.document.uri.fsPath === sourceCodeFilePath);

        if (editor)
        {
            if (await onOrganize(sourceCodeFilePath))
            {
                savingHandler.dispose();

                await editor.document.save();

                savingHandler = vscode.workspace.onWillSaveTextDocument(async (e) => await onSave(e.document.uri.fsPath));
            }
        }
    }
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
    const workspaceRootDirectoryPath = getWorkspaceRootDirectoryPath();
    const sourceCodeDirectoryPath = workspaceRootDirectoryPath;
    const sourceCodeFilePathRelative = getRelativePath(sourceCodeDirectoryPath, sourceCodeFilePath);

    // test for include or exclude patterns
    let include = true;
    let exclude = false;

    if (configuration.files.include.length > 0)
    {
        include = configuration.files.include.some(inc => matches(inc, sourceCodeFilePathRelative) || matches(inc, "./" + sourceCodeFilePathRelative));
    }

    if (configuration.files.exclude.length > 0)
    {
        exclude = configuration.files.exclude.some(exc => matches(exc, sourceCodeFilePathRelative) || matches(exc, "./" + sourceCodeFilePathRelative));
    }

    if (include && !exclude)
    {
        // organize and save
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

            output.appendLine(`tsco organized ${sourceCodeFilePath}`);

            return true;
        }
        else
        {
            output.appendLine(`tsco skipping organizing ${sourceCodeFilePath}, because it is already organized`);
        }
    }
    else if (!include)
    {
        output.appendLine(`tsco skipping organizing ${sourceCodeFilePath}, because it does not match file include patterns`);
    }
    else if (exclude)
    {
        output.appendLine(`tsco skipping organizing ${sourceCodeFilePath}, because it matches file exclude patterns`);
    }

    return false;
}

// #endregion Functions

// #region Exported Functions (1)

export function activate(context: vscode.ExtensionContext)
{
    context.subscriptions.push(vscode.commands.registerCommand('tsco.initialize', async () => await onInitialize()));
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organize', async () => await onOrganize(vscode.window.activeTextEditor?.document.uri.fsPath)));
    context.subscriptions.push(vscode.commands.registerCommand('tsco.organizeAll', async () => await onOrganizeAll()));

    vscode.workspace.onDidChangeConfiguration(() => settings = Settings.getSettings());
    savingHandler = vscode.workspace.onWillSaveTextDocument(async (e) => await onSave(e.document.uri.fsPath));
}

// #endregion Exported Functions

// #region Variables (3)

const output = vscode.window.createOutputChannel("tsco");

let savingHandler: vscode.Disposable;
let settings = Settings.getSettings();

// #endregion Variables
