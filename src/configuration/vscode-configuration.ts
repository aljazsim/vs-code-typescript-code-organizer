import * as vscode from "vscode";

export class VscodeConfiguration
{
    // #region Constructors (1)

    constructor(public readonly organizeOnSave: boolean)
    {
    }

    // #endregion Constructors

    // #region Public Static Methods (1)

    public static getConfiguration()
    {
        const configuration = vscode.workspace.getConfiguration("tsco");

        return new VscodeConfiguration(
            configuration.get<boolean>("organizeOnSave") === true,
        );
    }

    // #endregion Public Static Methods
}
