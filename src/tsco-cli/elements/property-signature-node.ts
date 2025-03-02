import ts from "typescript";

import { WriteModifier } from "../enums/write-modifier.js";
import { getWriteMode } from "../helpers/node-helper.js";
import { ElementNode } from "./element-node.js";

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
