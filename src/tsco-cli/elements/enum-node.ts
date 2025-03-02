import ts from "typescript";

import { getIsExport } from "../helpers/node-helper";
import { ElementNode } from "./element-node";

export class EnumNode extends ElementNode
{
    // #region Properties (2)

    public readonly isExport: boolean;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, enumDeclaration: ts.EnumDeclaration)
    {
        super(sourceFile, enumDeclaration);

        this.name = (<ts.Identifier>enumDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(enumDeclaration.name.pos, enumDeclaration.name.end).trim();

        this.isExport = getIsExport(enumDeclaration);
    }

    // #endregion Constructors
}
