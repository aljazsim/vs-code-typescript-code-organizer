import * as ts from "typescript";

import { Configuration } from "../configuration/configuration.js";
import { ClassNode } from "../elements/class-node.js";
import { ElementNode } from "../elements/element-node.js";
import { EnumNode } from "../elements/enum-node.js";
import { ExpressionNode } from "../elements/expression-node.js";
import { FunctionNode } from "../elements/function-node.js";
import { ImportNode } from "../elements/import-node.js";
import { InterfaceNode } from "../elements/interface-node.js";
import { TypeAliasNode } from "../elements/type-alias-node.js";
import { VariableNode } from "../elements/variable-node.js";
import { getIsConst, getIsDeclaration, getIsExport, getLeadingComment, getTrailingComment } from "../helpers/node-helper.js";

export class SourceCodeAnalyzer
{
    // #region Public Static Methods (2)

    public static getNodes(sourceFile: ts.SourceFile, configuration: Configuration)
    {
        let elements: ElementNode[] = [];

        // traverse top ast nodes
        for (const node of sourceFile.getChildren(sourceFile))
        {
            elements = elements.concat(this.traverseSyntaxTree(node, sourceFile, configuration));
        }

        return elements;
    }

    public static hasReference(sourceFile: ts.SourceFile, identifier: string)
    {
        return sourceFile.getChildren(sourceFile).some(node => this.findReference(node, sourceFile, identifier));
    }

    // #endregion Public Static Methods

    // #region Private Static Methods (2)

    private static findReference(node: ts.Node, sourceFile: ts.SourceFile, identifier: string)
    {
        if (ts.isImportDeclaration(node))
        {
            return false;
        }
        if (ts.isIdentifier(node) && node.getText(sourceFile) === identifier)
        {
            return true;
        }
        else
        {
            for (const childNode of node.getChildren(sourceFile))
            {
                if (this.findReference(childNode, sourceFile, identifier))
                {
                    return true;
                }
            }
        }

        return false;
    }

    private static traverseSyntaxTree(node: ts.Node, sourceFile: ts.SourceFile, configuration: Configuration)
    {
        let elements: ElementNode[] = [];

        if (ts.isImportDeclaration(node))
        {
            // import
            elements.push(new ImportNode(sourceFile, node));
        }
        else if (ts.isTypeAliasDeclaration(node))
        {
            // type
            elements.push(new TypeAliasNode(sourceFile, node, configuration.types.members.treatArrowFunctionPropertiesAsMethods));
        }
        else if (ts.isInterfaceDeclaration(node))
        {
            // interface
            elements.push(new InterfaceNode(sourceFile, node, configuration.interfaces.members.treatArrowFunctionPropertiesAsMethods));
        }
        else if (ts.isClassDeclaration(node))
        {
            // class
            elements.push(new ClassNode(sourceFile, node, configuration.classes.members.treatArrowFunctionPropertiesAsMethods, configuration.classes.members.treatArrowFunctionReadOnlyPropertiesAsMethods));
        }
        else if (ts.isEnumDeclaration(node))
        {
            // enum
            elements.push(new EnumNode(sourceFile, node));
        }
        else if (ts.isFunctionDeclaration(node))
        {
            // function
            elements.push(new FunctionNode(sourceFile, node));
        }
        else if (ts.isVariableStatement(node))
        {
            const isExport = getIsExport(node);
            const isDeclaration = getIsDeclaration(node);
            const isConst = getIsConst(node.declarationList);
            const leadingComment = getLeadingComment(node, sourceFile);
            const trailingComment = getTrailingComment(node, sourceFile);

            // variable statement can have multiple variables -> break them up so we can organize them
            for (const variableDeclaration of node.declarationList.declarations)
            {
                // variable
                elements.push(new VariableNode(sourceFile, variableDeclaration, isExport, isConst, isDeclaration, leadingComment, trailingComment));
            }
        }
        else if (node.kind == ts.SyntaxKind.SyntaxList)
        {
            // traverse children ast nodes
            for (const childNode of node.getChildren(sourceFile))
            {
                elements = elements.concat(this.traverseSyntaxTree(childNode, sourceFile, configuration));
            }
        }
        else if (!ts.isEmptyStatement(node) && node.kind != ts.SyntaxKind.EndOfFileToken)
        {
            // expression
            elements.push(new ExpressionNode(sourceFile, node));
        }

        return elements;
    }

    // #endregion Private Static Methods
}
