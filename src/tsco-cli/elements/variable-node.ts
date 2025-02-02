import * as ts from "typescript";

import { getDependencies, getIsArrowFunction } from "../helpers/node-helper.js";
import { ElementNode } from "./element-node.js";

export class VariableNode extends ElementNode
{
    // #region Properties (3)

    public readonly dependencies: string[] = [];
    public readonly isArrowFunction: boolean = false;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, variableDeclaration: ts.VariableDeclaration, public readonly isExport: boolean, public readonly isConst: boolean, public readonly leadingComment: string, public readonly trailingComment: string)
    {
        super(sourceFile, variableDeclaration);

        // this.name = variableDeclaration.declarationList.declarations.map(d => (<ts.Identifier>d.name).escapedText.toString()).join(",");
        this.name = (<ts.Identifier>variableDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(variableDeclaration.name.pos, variableDeclaration.name.end).trim();

        this.isArrowFunction = getIsArrowFunction(variableDeclaration);

        if (variableDeclaration.initializer)
        {
            // we'll use this when sorting variables to make sure a variable that 
            // depends on another variable is declared after the dependant variable
            this.dependencies = getDependencies(sourceFile, variableDeclaration.initializer, []);
        }
    }

    // #endregion Constructors
}
