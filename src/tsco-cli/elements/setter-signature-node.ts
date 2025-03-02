import ts from "typescript";

import { ElementNode } from "./element-node.js";

export class SetterSignatureNode extends ElementNode
{
    // #region Properties (1)

    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, setterSignatureDeclaration: ts.SetAccessorDeclaration)
    {
        super(sourceFile, setterSignatureDeclaration);

        this.name = (<ts.Identifier>setterSignatureDeclaration.name).escapedText.toString();
    }

    // #endregion Constructors
}
