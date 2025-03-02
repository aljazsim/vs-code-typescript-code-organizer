import * as ts from "typescript";

import { InterfaceConfiguration } from "../configuration/interface-configuration.js";
import { InterfaceMemberType } from "../enums/interface-member-type.js";
import { getIsExport, isReadOnly, isWritable, order } from "../helpers/node-helper.js";
import { ElementNodeGroup } from "./element-node-group.js";
import { ElementNode } from "./element-node.js";
import { GetterSignatureNode } from "./getter-signature-node.js";
import { IndexSignatureNode } from "./index-signature-node.js";
import { MethodSignatureNode } from "./method-signature-node.js";
import { PropertySignatureNode } from "./property-signature-node.js";
import { SetterSignatureNode } from "./setter-signature-node.js";

export class InterfaceNode extends ElementNode
{
    // #region Properties (9)

    public readonly getters: GetterSignatureNode[] = [];
    public readonly indexes: IndexSignatureNode[] = [];
    public readonly isExport: boolean;
    public readonly membersEnd: number = 0;
    public readonly membersStart: number = 0;
    public readonly methods: (MethodSignatureNode | PropertySignatureNode)[] = [];
    public readonly name: string;
    public readonly properties: PropertySignatureNode[] = [];
    public readonly setters: SetterSignatureNode[] = [];

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, interfaceDeclaration: ts.InterfaceDeclaration, treatArrowFunctionPropertiesAsMethods: boolean)
    {
        super(sourceFile, interfaceDeclaration);

        this.name = (<ts.Identifier>interfaceDeclaration.name).escapedText?.toString() ?? sourceFile.getFullText().substring(interfaceDeclaration.name.pos, interfaceDeclaration.name.end).trim();

        if (interfaceDeclaration.members && interfaceDeclaration.members.length > 0)
        {
            this.membersStart = interfaceDeclaration.members[0].getFullStart() - interfaceDeclaration.getFullStart();
            this.membersEnd = interfaceDeclaration.members[interfaceDeclaration.members.length - 1].getEnd() - interfaceDeclaration.getFullStart();
        }

        // members
        for (const member of interfaceDeclaration.members)
        {
            if (ts.isPropertySignature(member))
            {
                const propertySignature = member as ts.PropertySignature;

                if (treatArrowFunctionPropertiesAsMethods && propertySignature.type?.kind === ts.SyntaxKind.FunctionType)
                {
                    this.methods.push(new PropertySignatureNode(sourceFile, member));
                }
                else
                {
                    this.properties.push(new PropertySignatureNode(sourceFile, member));
                }
            }
            else if (ts.isGetAccessorDeclaration(member))
            {
                this.getters.push(new GetterSignatureNode(sourceFile, member));
            }
            else if (ts.isSetAccessorDeclaration(member))
            {
                this.setters.push(new SetterSignatureNode(sourceFile, member));
            }
            else if (ts.isIndexSignatureDeclaration(member))
            {
                this.indexes.push(new IndexSignatureNode(sourceFile, member));
            }
            else if (ts.isMethodSignature(member))
            {
                this.methods.push(new MethodSignatureNode(sourceFile, member));
            }
        }

        this.isExport = getIsExport(interfaceDeclaration);
    }

    // #endregion Constructors

    // #region Public Methods (1)

    public organizeMembers(configuration: InterfaceConfiguration)
    {
        const regions: ElementNodeGroup[] = [];

        for (const memberGroup of configuration.memberGroups)
        {
            const sortDirection = memberGroup.sortDirection;
            const placeAbove = memberGroup.placeAbove;
            const placeBelow = memberGroup.placeBelow;
            const memberGroups: ElementNodeGroup[] = [];

            for (const memberType of memberGroup.memberTypes)
            {
                let elementNodes = Array<ElementNode>();

                if (memberType === InterfaceMemberType.properties)
                {
                    elementNodes = this.getProperties();
                }
                else if (memberType === InterfaceMemberType.readOnlyProperties)
                {
                    elementNodes = this.getReadOnlyProperties();
                }
                else if (memberType === InterfaceMemberType.indexes)
                {
                    elementNodes = this.indexes;
                }
                if (memberType === InterfaceMemberType.gettersAndSetters)
                {
                    elementNodes = this.getGettersAndSetters();
                }
                else if (memberType === InterfaceMemberType.methods)
                {
                    elementNodes = this.methods;
                }

                if (elementNodes.length > 0)
                {
                    memberGroups.push(new ElementNodeGroup(null, [], order(sortDirection, elementNodes, placeAbove, placeBelow, false), false, null));
                }
            }

            if (memberGroups.length > 0)
            {
                if (memberGroup.memberTypesGrouped)
                {
                    regions.push(new ElementNodeGroup(memberGroup.caption, memberGroups, [], true, configuration.regions));
                }
                else 
                {
                    regions.push(new ElementNodeGroup(memberGroup.caption, [], order(sortDirection, memberGroups.flatMap(mg => mg.nodes), placeAbove, placeBelow, false), true, configuration.regions));
                }
            }
        }

        return regions;
    }

    // #endregion Public Methods

    // #region Private Methods (3)

    private getGettersAndSetters()
    {
        return this.getters.concat(this.setters);
    }

    private getProperties()
    {
        return this.properties.filter((x) => isWritable(x));
    }

    private getReadOnlyProperties()
    {
        return this.properties.filter((x) => isReadOnly(x));
    }

    // #endregion Private Methods
}
