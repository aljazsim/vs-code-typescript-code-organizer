import ts from "typescript";

import { WriteModifier } from "../enums/write-modifier";
import { getWriteMode } from "../helpers/node-helper";
import { ElementNode } from "./element-node";

export class PropertySignatureNode extends ElementNode
{
    // #region Properties (2)

    public readonly name: string;
    public readonly writeMode: WriteModifier;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, propertySignatureDeclaration: ts.PropertySignature)
    {
        super(sourceFile, propertySignatureDeclaration);

        this.name = (<ts.Identifier>propertySignatureDeclaration.name).escapedText.toString();

        this.writeMode = getWriteMode(propertySignatureDeclaration);
    }

    // #endregion Constructors
}
