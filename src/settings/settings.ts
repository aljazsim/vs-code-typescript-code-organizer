import * as vscode from "vscode";

export class Settings
{
    // #region Constructors (1)

    constructor(public readonly organizeOnSave: boolean, public readonly configurationFilePath: string | null)
    {
    }

    // #endregion Constructors

    // #region Public Static Methods (1)

    public static getSettings()
    {
        const configuration = vscode.workspace.getConfiguration("tsco");
        const organizeOnSave = configuration.get<boolean>("organizeOnSave");
        const configurationFilePath = configuration.get<string>("configurationFilePath");

        return new Settings(
            organizeOnSave === true,
            configurationFilePath && configurationFilePath.length > 0 ? configurationFilePath : null,
        );
    }

    // #endregion Public Static Methods
}
