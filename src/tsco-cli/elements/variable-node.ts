import * as ts from "typescript";

import { getDependencies, getIsArrowFunction } from "../helpers/node-helper";
import { ElementNode } from "./element-node";

export class VariableNode extends ElementNode
{
    // #region Properties (2)

    public readonly isArrowFunction: boolean = false;
    public readonly name: string;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, variableDeclaration: ts.VariableDeclaration, public readonly isExport: boolean, public readonly isConst: boolean, public readonly isDeclaration: boolean, leadingComment: string | null, trailingComment: string | null)
    {
        super(sourceFile, variableDeclaration, leadingComment, trailingComment);

        if (ts.isIdentifier(variableDeclaration.name) && variableDeclaration.name.escapedText)
        {
            this.name = variableDeclaration.name.escapedText!.toString();
        }
        else if (ts.isObjectBindingPattern(variableDeclaration.name))
        {
            this.name = variableDeclaration.name.elements.map(e => (<ts.Identifier>e.name).escapedText!.toString()).join(",");
        }
        else
        {
            this.name = sourceFile.getFullText().substring(variableDeclaration.name.pos, variableDeclaration.name.end).trim();
        }

        this.isArrowFunction = getIsArrowFunction(variableDeclaration);

        if (variableDeclaration.initializer)
        {
            for (const dependency of getDependencies(sourceFile, variableDeclaration.initializer, []))
            {
                this.dependencies.push(dependency);
            }
        }
    }

    // #endregion Constructors
}
