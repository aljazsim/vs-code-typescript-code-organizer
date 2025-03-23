import * as ts from "typescript";

import { getLeadingComment, getTrailingComment } from "../helpers/node-helper";

export abstract class ElementNode
{
    // #region Properties (6)

    public readonly dependencies: string[] = [];
    public readonly indentation: string = "";
    public readonly leadingComment: string | null;
    public abstract readonly name: string;
    public readonly sourceCode: string;
    public readonly trailingComment: string | null;

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, public readonly node: ts.Node, leadingComment: string | null = null, trailingComment: string | null = null)
    {
        this.indentation = this.getIndentation(sourceFile, node);

        this.leadingComment = leadingComment ?? getLeadingComment(node, sourceFile);
        this.trailingComment = trailingComment ?? getTrailingComment(node, sourceFile);

        this.sourceCode = node.getText(sourceFile);
        this.sourceCode = this.sourceCode.replace(leadingComment ?? "", "");
        this.sourceCode = this.sourceCode.replace(trailingComment ?? "", "");
        this.sourceCode = this.indentation + this.sourceCode.trim();
    }

    // #endregion Constructors

    // #region Protected Methods (2)

    protected getClosingBraceIndex(sourceFile: ts.SourceFile, node: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeLiteralNode)
    {
        const closingBrace = "}";
        const sourceCode = sourceFile.getText();

        for (let i = node.getEnd(); i > node.getStart(sourceFile); i--)
        {
            if (sourceCode[i] === closingBrace)
            {
                return i
            }
        }

        throw new Error("Closing brace not found");
    }

    protected getOpeningBraceIndex(sourceFile: ts.SourceFile, node: ts.ClassDeclaration | ts.InterfaceDeclaration | ts.TypeLiteralNode)
    {
        const openingBrace = "{";
        const sourceCode = sourceFile.getText();
        let startIndex = node.getStart(sourceFile);

        if (ts.isClassDeclaration(node))
        {
            // class could start with a decorator containing curly braces
            startIndex = sourceCode.indexOf("class ", startIndex);
        }

        for (let i = startIndex; i < node.getEnd(); i++)
        {
            if (sourceCode[i] === openingBrace)
            {
                return i
            }
        }

        throw new Error("Opening brace not found");
    }

    // #endregion Protected Methods

    // #region Private Methods (1)

    private getIndentation(sourceFile: ts.SourceFile, node: ts.Node)
    {
        const space = " ";
        const tab = "\t";
        const sourceCode = sourceFile.getText();
        const startIndex = sourceCode.indexOf(node.getText(sourceFile));
        let indentation = "";

        for (let i = startIndex - 1; i > 0; i--)
        {
            if (sourceCode[i] === space || sourceCode[i] === tab)
            {
                indentation = sourceCode[i] + indentation;
            }
            else
            {
                break;
            }
        }

        return indentation;
    }

    // #endregion Private Methods
}
