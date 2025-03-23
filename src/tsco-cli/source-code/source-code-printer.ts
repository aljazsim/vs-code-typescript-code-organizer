import { Configuration } from "../configuration/configuration";
import { ImportConfiguration } from "../configuration/import-configuration";
import { AccessorNode } from "../elements/accessor-node";
import { ClassNode } from "../elements/class-node";
import { ElementNodeGroup } from "../elements/element-node-group";
import { ElementNode } from "../elements/element-node";
import { ExpressionNode } from "../elements/expression-node";
import { FunctionNode } from "../elements/function-node";
import { GetterNode } from "../elements/getter-node";
import { GetterSignatureNode } from "../elements/getter-signature-node";
import { ImportNode } from "../elements/import-node";
import { IndexSignatureNode } from "../elements/index-signature-node";
import { InterfaceNode } from "../elements/interface-node";
import { MethodNode } from "../elements/method-node";
import { MethodSignatureNode } from "../elements/method-signature-node";
import { PropertyNode } from "../elements/property-node";
import { PropertySignatureNode } from "../elements/property-signature-node";
import { SetterNode } from "../elements/setter-node";
import { SetterSignatureNode } from "../elements/setter-signature-node";
import { TypeAliasNode } from "../elements/type-alias-node";
import { VariableNode } from "../elements/variable-node";
import { ImportExpand } from "../enums/import-expand";
import { ImportSourceFilePathQuoteType } from "../enums/import-source-file-path-quote-type";
import { WriteModifier } from "../enums/write-modifier";
import { doubleQuote, newLine, newLineRegex, singleQuote, space } from "./source-code-constants";
import { resolveDeclarationDependenciesOrder } from "./source-code-dependency-resolver";
import { SourceCode } from "./source-code";

export class SourceCodePrinter
{
    // #region Public Static Methods (1)

    public static print(fileHeader: string | null, nodeGroups: ElementNodeGroup[], configuration: Configuration)
    {
        const printedSourceCode = this.printNodeGroups(nodeGroups, configuration);

        if (fileHeader && fileHeader.length > 0)
        {
            printedSourceCode.addBefore(this.printComment(fileHeader));
        }

        printedSourceCode.removeConsecutiveEmptyLines();
        printedSourceCode.trim();

        if (printedSourceCode.length > 0)
        {
            printedSourceCode.addNewLineAfter();
        }

        return printedSourceCode;
    }

    // #endregion Public Static Methods

    // #region Private Static Methods (10)

    private static printClass(node: ClassNode, configuration: Configuration)
    {
        const beforeMembers = node.sourceCode.substring(0, node.membersStart).trim();
        const nodes = node.organizeMembers(configuration.classes);

        resolveDeclarationDependenciesOrder(nodes);

        const members = this.printNodeGroups(nodes, configuration);
        const afterMembers = node.sourceCode.substring(node.membersEnd).trim();
        const nodeSourceCode = new SourceCode();

        if (configuration.classes.members.addPublicModifierIfMissing)
        {
            // add public modifier if missing
            node.properties.forEach(p => members.addPublicModifierIfMissing(p));
            node.methods.forEach(m => members.addPublicModifierIfMissing(m));
            node.getters.forEach(g => members.addPublicModifierIfMissing(g));
            node.setters.forEach(s => members.addPublicModifierIfMissing(s));
            node.accessors.forEach(a => members.addPublicModifierIfMissing(a));
        }

        if (configuration.classes.members.addPrivateModifierIfStartingWithHash)
        {
            // add private modifier if starting with hash
            node.properties.forEach(p => members.addPrivateModifierIfStartingWithHash(p));
            node.methods.forEach(m => members.addPrivateModifierIfStartingWithHash(m));
            node.getters.forEach(g => members.addPrivateModifierIfStartingWithHash(g));
            node.setters.forEach(s => members.addPrivateModifierIfStartingWithHash(s));
            node.accessors.forEach(a => members.addPrivateModifierIfStartingWithHash(a));
        }

        if (beforeMembers.length > 0)
        {
            nodeSourceCode.addAfter(beforeMembers);
            nodeSourceCode.addNewLineAfter();
        }

        nodeSourceCode.addAfter(members);

        if (afterMembers.length > 0)
        {
            nodeSourceCode.addAfter(afterMembers);
        }

        // add comments
        if (node.leadingComment)
        {
            nodeSourceCode.addBefore(node.indentation + node.leadingComment);
        }

        if (node.trailingComment)
        {
            nodeSourceCode.addAfter(" " + node.trailingComment);
        }

        return nodeSourceCode;
    }

    private static printComment(fileHeader: string, indentation = "")
    {
        const multilineComment = "*";
        const multilineCommentStart = new RegExp(`^/\\${multilineComment}+$`);
        const multilineCommentEnd = new RegExp(`^\\${multilineComment}+/$`);
        const singlelineComment = "//";

        const lines = fileHeader.trimStart().split(new RegExp(newLineRegex)).map(l => l.trim());

        for (let i = 0; i < lines.length; i++)
        {
            if (multilineCommentStart.test(lines[i]))
            {
                // do nothing
            }
            else if (multilineCommentEnd.test(lines[i]))
            {
                lines[i] = " " + lines[i].trim();
            }
            else if (lines[i].startsWith(multilineComment))
            {
                lines[i] = " " + multilineComment + " " + lines[i].substring(multilineComment.length).trim();
            }
            else if (lines[i].startsWith(singlelineComment))
            {
                lines[i] = singlelineComment + " " + lines[i].substring(singlelineComment.length).trim();
            }

            if (lines[i] !== "")
            {
                lines[i] = indentation + lines[i];
            }
        }

        if (lines[lines.length - 1] !== "")
        {
            lines.push("");
        }

        return lines.join(newLine);
    }

    private static printImport(node: ImportNode, configuration: ImportConfiguration)
    {
        const indentation = "    ";
        const source = node.source;
        const quote = configuration.quote === ImportSourceFilePathQuoteType.Single ? singleQuote : doubleQuote;
        const namedImports = (node.namedImports ?? []).filter(ni => ni && ni.name.trim().length > 0);
        const nameBinding = node.nameBinding;
        const namespace = node.namespace;
        let sourceCode = ""
        let namedImportsSourceCode = "";

        if (namedImports.length > 0)
        {
            const expand = configuration.expand === ImportExpand.Always || configuration.expand === ImportExpand.WhenMoreThanOneNamedImport && namedImports.length > 1;
            const allTypeOnly = namedImports.every(ni => ni.typeOnly);

            namedImportsSourceCode += allTypeOnly ? "type " : "";
            namedImportsSourceCode += `{${expand ? newLine : space}`;
            namedImportsSourceCode += namedImports.map(ni => (expand ? indentation : "") + (ni.typeOnly && !allTypeOnly ? "type " : "") + (ni.alias ? (ni.alias + " as ") : "") + ni.name).join(`,${expand ? newLine : space}`);
            namedImportsSourceCode += `${expand ? newLine : space}}`;
        }

        if (nameBinding)
        {
            if (namespace)
            {
                sourceCode = `import ${nameBinding}, * as ${namespace} from ${quote}${source}${quote};`;
            }
            else if (namedImports.length > 0)
            {
                sourceCode = `import ${nameBinding}, ${namedImportsSourceCode} from ${quote}${source}${quote};`;
            }
            else
            {
                sourceCode = `import ${nameBinding} from ${quote}${source}${quote};`;
            }
        }
        else if (namespace)
        {
            sourceCode = `import * as ${namespace} from ${quote}${source}${quote};`;
        }
        else if (namedImports.length > 0)
        {
            sourceCode = `import ${namedImportsSourceCode} from ${quote}${source}${quote};`;
        }
        else
        {
            sourceCode = `import ${quote}${source}${quote};`;
        }

        // add comments
        if (node.leadingComment)
        {
            sourceCode = node.leadingComment + sourceCode;
        }

        if (node.trailingComment)
        {
            sourceCode = sourceCode + " " + node.trailingComment;
        }

        return new SourceCode(sourceCode);
    }

    private static printInterface(node: InterfaceNode, configuration: Configuration)
    {
        const beforeMembers = node.sourceCode.substring(0, node.membersStart).trim();
        const members = this.printNodeGroups(node.organizeMembers(configuration.interfaces), configuration);
        const afterMembers = node.sourceCode.substring(node.membersEnd).trim();
        const nodeSourceCode = new SourceCode();

        if (beforeMembers.length > 0)
        {
            nodeSourceCode.addAfter(beforeMembers);
            nodeSourceCode.addNewLineAfter();
        }

        nodeSourceCode.addAfter(members);

        if (afterMembers.length > 0)
        {
            nodeSourceCode.addAfter(afterMembers);
        }

        // add comments
        if (node.leadingComment)
        {
            nodeSourceCode.addBefore(node.indentation + node.leadingComment);
        }

        if (node.trailingComment)
        {
            nodeSourceCode.addAfter(" " + node.trailingComment);
        }

        return nodeSourceCode;
    }

    private static printNode(node: ElementNode, configuration: Configuration)
    {
        let nodeSourceCode: SourceCode;

        if (node instanceof ImportNode)
        {
            nodeSourceCode = this.printImport(node, configuration.imports);
        }
        else if (node instanceof InterfaceNode)
        {
            nodeSourceCode = this.printInterface(node, configuration);
        }
        else if (node instanceof ClassNode)
        {
            nodeSourceCode = this.printClass(node, configuration);
        }
        else if (node instanceof TypeAliasNode)
        {
            nodeSourceCode = this.printType(node, configuration);
        }
        else if (node instanceof VariableNode)
        {
            nodeSourceCode = this.printVariable(node);
        }
        else
        {
            nodeSourceCode = this.printOther(node);
        }

        if (node instanceof PropertyNode)
        {
            // arrow function property -> add a new line
            nodeSourceCode.addNewLineAfterIf(node.isArrowFunction && configuration.classes.members.treatArrowFunctionPropertiesAsMethods);
        }

        nodeSourceCode.addNewLineAfter();

        return nodeSourceCode;
    }

    private static printNodeGroup(nodeGroup: ElementNodeGroup, configuration: Configuration)
    {
        const nodeGroupSourceCode = new SourceCode();
        const nodeGroupNodeCount = nodeGroup.getNodeCount();

        // print subgroups
        nodeGroupSourceCode.addAfter(this.printNodeGroups(nodeGroup.nodeSubGroups, configuration));

        // print nodes within a group
        for (const node of nodeGroup.nodes)
        {
            const nodeSourceCode = this.printNode(node, configuration);

            if ((node instanceof PropertySignatureNode && node.leadingComment) ||
                (node instanceof IndexSignatureNode && node.leadingComment) ||
                (node instanceof GetterSignatureNode && node.leadingComment) ||
                (node instanceof SetterSignatureNode && node.leadingComment) ||
                (node instanceof MethodSignatureNode && node.leadingComment) ||
                (node instanceof PropertyNode && node.leadingComment) ||
                (node instanceof AccessorNode && node.leadingComment) ||
                (node instanceof VariableNode && node.leadingComment))
            {
                if (nodeGroup.nodes.indexOf(node) > 0)
                {
                    // comment before an one-line element -> add new line
                    nodeSourceCode.addNewLineBefore()
                }
            }

            if (node instanceof InterfaceNode ||
                node instanceof ClassNode ||
                node instanceof TypeAliasNode ||
                node instanceof GetterNode ||
                node instanceof SetterNode ||
                node instanceof FunctionNode ||
                node instanceof MethodNode ||
                (node instanceof PropertyNode && node.writeMode !== WriteModifier.readOnly && node.isArrowFunction && configuration.classes.members.treatArrowFunctionPropertiesAsMethods) ||
                (node instanceof PropertyNode && node.writeMode === WriteModifier.readOnly && node.isArrowFunction && configuration.classes.members.treatArrowFunctionReadOnlyPropertiesAsMethods) ||
                node instanceof ExpressionNode)
            {
                if (nodeGroup.nodes.indexOf(node) > 0)
                {
                    // separate elements with an additional empty line
                    nodeSourceCode.addNewLineBefore();
                }
            }

            if (node instanceof VariableNode)
            {
                const index = nodeGroup.nodes.indexOf(node);

                if (index > 0 && !(nodeGroup.nodes[index - 1] instanceof VariableNode))
                {
                    // separate variables from non-variables with an additional empty line
                    nodeSourceCode.addNewLineBefore();
                }
            }

            nodeGroupSourceCode.addAfter(nodeSourceCode);
        }

        if (nodeGroup.isRegion && nodeGroup.regionConfiguration?.addRegions)
        {
            // wrap with region
            nodeGroupSourceCode.addRegion(nodeGroup.caption ?? "Region", nodeGroupNodeCount, nodeGroup.regionConfiguration);
        }

        return nodeGroupSourceCode;
    }

    private static printNodeGroups(nodeGroups: ElementNodeGroup[], configuration: Configuration)
    {
        const nodeGroupsSourceCode = new SourceCode();
        const nodeGroupsWithNodes = nodeGroups.filter(ng => ng.getNodeCount() > 0);

        for (const nodeGroup of nodeGroupsWithNodes)
        {
            const sourceCode = this.printNodeGroup(nodeGroup, configuration);

            if (nodeGroupsWithNodes.length > 1 &&
                nodeGroupsWithNodes.indexOf(nodeGroup) > 0)
            {
                // add empty line before non-first group
                sourceCode.addNewLineBefore();
            }

            nodeGroupsSourceCode.addAfter(sourceCode);
        }

        return nodeGroupsSourceCode;
    }

    private static printOther(node: ElementNode)
    {
        let sourceCode = node.sourceCode;

        // remove leading empty lines (but keep indentation)
        while (sourceCode.startsWith("\r") || sourceCode.startsWith("\n"))
        {
            sourceCode = sourceCode.substring(1);
        }

        // remove trailing empty lines
        sourceCode = sourceCode.trimEnd();

        // add comments
        sourceCode = (node.leadingComment ? (node.indentation + node.leadingComment) : "") + sourceCode;
        sourceCode = sourceCode + (node.trailingComment ? (" " + node.trailingComment) : "");

        return new SourceCode(sourceCode);
    }

    private static printType(node: TypeAliasNode, configuration: Configuration)
    {
        const beforeMembers = node.sourceCode.substring(0, node.membersStart).trim();
        const members = this.printNodeGroups(node.organizeMembers(configuration.types), configuration);
        const afterMembers = node.sourceCode.substring(node.membersEnd).trim();
        const nodeSourceCode = new SourceCode();

        if (beforeMembers.length > 0)
        {
            nodeSourceCode.addAfter(beforeMembers);
            nodeSourceCode.addNewLineAfter();
        }

        nodeSourceCode.addAfter(members);

        if (afterMembers.length > 0)
        {
            nodeSourceCode.addAfter(afterMembers);
        }

        // add comments
        if (node.leadingComment)
        {
            nodeSourceCode.addBefore(node.indentation + node.leadingComment);
        }

        if (node.trailingComment)
        {
            nodeSourceCode.addAfter(" " + node.trailingComment);
        }

        return nodeSourceCode;
    }

    private static printVariable(node: VariableNode): SourceCode
    {
        let sourceCode = "";

        sourceCode += node.leadingComment ?? "";
        sourceCode += node.isExport ? "export " : "";
        sourceCode += node.isDeclaration ? "declare " : "";
        sourceCode += node.isConst ? "const " : "let ";
        sourceCode += node.sourceCode.trim();
        sourceCode += ";";
        sourceCode += node.trailingComment ? (" " + node.trailingComment) : "";

        return new SourceCode(sourceCode);
    }

    // #endregion Private Static Methods
}
