import * as ts from "typescript";

import { ClassConfiguration } from "../configuration/class-configuration";
import { ClassMemberType } from "../enums/class-member-type";
import { WriteModifier } from "../enums/write-modifier";
import { getDecorators, getDependencies, getIsAbstract, getIsExport, getIsStatic, isPrivate, isProtected, isPublic, isReadOnly, isWritable, order } from "../helpers/node-helper";
import { AccessorNode } from "./accessor-node";
import { ConstructorNode } from "./constructor-node";
import { ElementNode } from "./element-node";
import { ElementNodeGroup } from "./element-node-group";
import { GetterNode } from "./getter-node";
import { MethodNode } from "./method-node";
import { PropertyNode } from "./property-node";
import { SetterNode } from "./setter-node";
import { StaticBlockDeclarationNode } from "./static-block-declaration-node";

export class ClassNode extends ElementNode
{
    // #region Properties (14)

    public readonly accessors: AccessorNode[] = [];
    public readonly constructors: ConstructorNode[] = [];
    public readonly decorators: string[];
    public readonly getters: GetterNode[] = [];
    public readonly isAbstract: boolean;
    public readonly isExport: boolean;
    public readonly isStatic: boolean;
    public readonly membersEnd: number = 0;
    public readonly membersStart: number = 0;
    public readonly methods: (MethodNode | PropertyNode)[] = [];
    public readonly name: string;
    public readonly properties: PropertyNode[] = [];
    public readonly setters: SetterNode[] = [];
    public readonly staticBlockDeclarations: StaticBlockDeclarationNode[] = [];

    // #endregion Properties

    // #region Constructors (1)

    constructor(sourceFile: ts.SourceFile, classDeclaration: ts.ClassDeclaration, treatArrowFunctionPropertiesAsMethods: boolean, treatArrowFunctionReadOnlyPropertiesAsMethods: boolean)
    {
        super(sourceFile, classDeclaration);

        this.name = (<ts.Identifier>classDeclaration.name).escapedText.toString();

        if (classDeclaration.members && classDeclaration.members.length > 0)
        {
            this.membersStart = classDeclaration.members[0].getFullStart() - classDeclaration.getFullStart();
            this.membersEnd = classDeclaration.members[classDeclaration.members.length - 1].getEnd() - classDeclaration.getFullStart();
        }

        this.decorators = getDecorators(classDeclaration, sourceFile);

        this.isAbstract = getIsAbstract(classDeclaration);
        this.isStatic = getIsStatic(classDeclaration);

        // members
        for (const member of classDeclaration.members)
        {
            if (ts.isClassStaticBlockDeclaration(member))
            {
                this.staticBlockDeclarations.push(new StaticBlockDeclarationNode(sourceFile, member));
            }
            else if (ts.isConstructorDeclaration(member))
            {
                this.constructors.push(new ConstructorNode(sourceFile, member));
            }
            else if (ts.isAutoAccessorPropertyDeclaration(member))
            {
                this.accessors.push(new AccessorNode(sourceFile, member));
            }
            else if (ts.isPropertyDeclaration(member))
            {
                const property = new PropertyNode(sourceFile, member);

                if (treatArrowFunctionPropertiesAsMethods && property.isArrowFunction && property.writeMode == WriteModifier.writable ||
                    treatArrowFunctionReadOnlyPropertiesAsMethods && property.isArrowFunction && property.writeMode == WriteModifier.readOnly)
                {
                    this.methods.push(property);
                }
                else
                {
                    this.properties.push(property);
                }
            }
            else if (ts.isGetAccessorDeclaration(member))
            {
                this.getters.push(new GetterNode(sourceFile, member));
            }
            else if (ts.isSetAccessorDeclaration(member))
            {
                this.setters.push(new SetterNode(sourceFile, member));
            }
            else if (ts.isMethodDeclaration(member))
            {
                this.methods.push(new MethodNode(sourceFile, member));
            }
        }

        if (classDeclaration.modifiers)
        {
            // check if there's and dependencies on properties within decorators
            for (const decorator of classDeclaration.modifiers.filter(m => ts.isDecorator(m)))
            {
                for (const dependency of getDependencies(sourceFile, decorator, []))
                {
                    this.dependencies.push(dependency);
                }
            }
        }

        this.isExport = getIsExport(classDeclaration);
    }

    // #endregion Constructors

    // #region Public Methods (1)

    public organizeMembers(configuration: ClassConfiguration)
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

                if (memberType === ClassMemberType.privateStaticReadOnlyProperties)
                {
                    elementNodes = this.getPrivateStaticReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.privateReadOnlyProperties)
                {
                    elementNodes = this.getPrivateReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.privateStaticProperties)
                {
                    elementNodes = this.getPrivateStaticProperties();
                }
                else if (memberType === ClassMemberType.privateProperties)
                {
                    elementNodes = this.getPrivateProperties();
                }
                else if (memberType === ClassMemberType.protectedStaticReadOnlyProperties)
                {
                    elementNodes = this.getProtectedStaticReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.protectedReadOnlyProperties)
                {
                    elementNodes = this.getProtectedReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.protectedStaticProperties)
                {
                    elementNodes = this.getProtectedStaticProperties();
                }
                else if (memberType === ClassMemberType.protectedProperties)
                {
                    elementNodes = this.getProtectedProperties();
                }
                else if (memberType === ClassMemberType.publicStaticReadOnlyProperties)
                {
                    elementNodes = this.getPublicStaticReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.publicReadOnlyProperties)
                {
                    elementNodes = this.getPublicReadOnlyProperties();
                }
                else if (memberType === ClassMemberType.publicStaticProperties)
                {
                    elementNodes = this.getPublicStaticProperties();
                }
                else if (memberType === ClassMemberType.publicProperties)
                {
                    elementNodes = this.getPublicProperties();
                }
                else if (memberType === ClassMemberType.staticBlockDeclarations)
                {
                    elementNodes = this.staticBlockDeclarations;
                }
                else if (memberType === ClassMemberType.constructors)
                {
                    elementNodes = this.constructors;
                }
                else if (memberType === ClassMemberType.publicStaticAccessors)
                {
                    elementNodes = this.getPublicStaticAccessors();
                }
                else if (memberType === ClassMemberType.publicAccessors)
                {
                    elementNodes = this.getPublicAccessors();
                }
                else if (memberType === ClassMemberType.publicAbstractAccessors)
                {
                    elementNodes = this.getPublicAbstractAccessors();
                }
                else if (memberType === ClassMemberType.protectedStaticAccessors)
                {
                    elementNodes = this.getProtectedStaticAccessors();
                }
                else if (memberType === ClassMemberType.protectedAccessors)
                {
                    elementNodes = this.getProtectedAccessors();
                }
                else if (memberType === ClassMemberType.protectedAbstractAccessors)
                {
                    elementNodes = this.getProtectedAbstractAccessors();
                }
                else if (memberType === ClassMemberType.privateStaticAccessors)
                {
                    elementNodes = this.getPrivateStaticAccessors();
                }
                else if (memberType === ClassMemberType.privateAccessors)
                {
                    elementNodes = this.getPrivateAccessors();
                }
                else if (memberType === ClassMemberType.publicStaticGettersAndSetters)
                {
                    elementNodes = this.getPublicStaticGettersAndSetters();
                }
                else if (memberType === ClassMemberType.publicGettersAndSetters)
                {
                    elementNodes = this.getPublicGettersAndSetters();
                }
                else if (memberType === ClassMemberType.publicAbstractGettersAndSetters)
                {
                    elementNodes = this.getPublicAbstractGettersAndSetters();
                }
                else if (memberType === ClassMemberType.protectedStaticGettersAndSetters)
                {
                    elementNodes = this.getProtectedStaticGettersAndSetters();
                }
                else if (memberType === ClassMemberType.protectedGettersAndSetters)
                {
                    elementNodes = this.getProtectedGettersAndSetters();
                }
                else if (memberType === ClassMemberType.protectedAbstractGettersAndSetters)
                {
                    elementNodes = this.getProtectedAbstractGettersAndSetters();
                }
                else if (memberType === ClassMemberType.privateStaticGettersAndSetters)
                {
                    elementNodes = this.getPrivateStaticGettersAndSetters();
                }
                else if (memberType === ClassMemberType.privateGettersAndSetters)
                {
                    elementNodes = this.getPrivateGettersAndSetters();
                }
                else if (memberType === ClassMemberType.publicStaticMethods)
                {
                    elementNodes = this.getPublicStaticMethods();
                }
                else if (memberType === ClassMemberType.publicMethods)
                {
                    elementNodes = this.getPublicMethods();
                }
                else if (memberType === ClassMemberType.publicAbstractMethods)
                {
                    elementNodes = this.getPublicAbstractMethods();
                }
                else if (memberType === ClassMemberType.protectedStaticMethods)
                {
                    elementNodes = this.getProtectedStaticMethods();
                }
                else if (memberType === ClassMemberType.protectedMethods)
                {
                    elementNodes = this.getProtectedMethods();
                }
                else if (memberType === ClassMemberType.protectedAbstractMethods)
                {
                    elementNodes = this.getProtectedAbstractMethods();
                }
                else if (memberType === ClassMemberType.privateStaticMethods)
                {
                    elementNodes = this.getPrivateStaticMethods();
                }
                else if (memberType === ClassMemberType.privateMethods)
                {
                    elementNodes = this.getPrivateMethods();
                }

                if (elementNodes.length > 0)
                {
                    memberGroups.push(new ElementNodeGroup(null, [], order(sortDirection, elementNodes, placeAbove, placeBelow, configuration.members.groupMembersWithDecorators), false, null));
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
                    regions.push(new ElementNodeGroup(memberGroup.caption, [], order(sortDirection, memberGroups.flatMap(mg => mg.nodes), placeAbove, placeBelow, configuration.members.groupMembersWithDecorators), true, configuration.regions));
                }
            }
        }

        return regions;
    }

    // #endregion Public Methods

    // #region Private Methods (36)

    private getPrivateAccessors()
    {
        return this.accessors.filter(x => isPrivate(x) && !x.isStatic && !x.isAbstract);
    }

    private getPrivateGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isPrivate(x) && !x.isStatic && !x.isAbstract);
    }

    private getPrivateMethods()
    {
        return this.methods.filter(x => isPrivate(x) && !x.isStatic && !x.isAbstract);
    }

    private getPrivateProperties()
    {
        return this.properties.filter(x => isPrivate(x) && isWritable(x) && !x.isStatic);
    }

    private getPrivateReadOnlyProperties()
    {
        return this.properties.filter(x => isPrivate(x) && isReadOnly(x) && !x.isStatic);
    }

    private getPrivateStaticAccessors()
    {
        return this.accessors.filter(x => isPrivate(x) && x.isStatic && !x.isAbstract);
    }

    private getPrivateStaticGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isPrivate(x) && x.isStatic && !x.isAbstract);
    }

    private getPrivateStaticMethods()
    {
        return this.methods.filter(x => isPrivate(x) && x.isStatic && !x.isAbstract);
    }

    private getPrivateStaticProperties()
    {
        return this.properties.filter(x => isPrivate(x) && isWritable(x) && x.isStatic);
    }

    private getPrivateStaticReadOnlyProperties()
    {
        return this.properties.filter(x => isPrivate(x) && isReadOnly(x) && x.isStatic);
    }

    private getProtectedAbstractAccessors()
    {
        return this.accessors.filter(x => isProtected(x) && !x.isStatic && x.isAbstract);
    }

    private getProtectedAbstractGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isProtected(x) && !x.isStatic && x.isAbstract);
    }

    private getProtectedAbstractMethods()
    {
        return this.methods.filter(x => isProtected(x) && !x.isStatic && x.isAbstract);
    }

    private getProtectedAccessors()
    {
        return this.accessors.filter(x => isProtected(x) && !x.isStatic && !x.isAbstract);
    }

    private getProtectedGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isProtected(x) && !x.isStatic && !x.isAbstract);
    }

    private getProtectedMethods()
    {
        return this.methods.filter(x => isProtected(x) && !x.isStatic && !x.isAbstract);
    }

    private getProtectedProperties()
    {
        return this.properties.filter(x => isProtected(x) && isWritable(x) && !x.isStatic);
    }

    private getProtectedReadOnlyProperties()
    {
        return this.properties.filter(x => isProtected(x) && isReadOnly(x) && !x.isStatic);
    }

    private getProtectedStaticAccessors()
    {
        return this.accessors.filter(x => isProtected(x) && x.isStatic && !x.isAbstract);
    }

    private getProtectedStaticGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isProtected(x) && x.isStatic && !x.isAbstract);
    }

    private getProtectedStaticMethods()
    {
        return this.methods.filter(x => isProtected(x) && x.isStatic && !x.isAbstract);
    }

    private getProtectedStaticProperties()
    {
        return this.properties.filter(x => isProtected(x) && isWritable(x) && x.isStatic);
    }

    private getProtectedStaticReadOnlyProperties()
    {
        return this.properties.filter(x => isProtected(x) && isReadOnly(x) && x.isStatic);
    }

    private getPublicAbstractAccessors()
    {
        return this.accessors.filter(x => isPublic(x) && !x.isStatic && x.isAbstract);
    }

    private getPublicAbstractGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isPublic(x) && !x.isStatic && x.isAbstract);
    }

    private getPublicAbstractMethods()
    {
        return this.methods.filter(x => isPublic(x) && !x.isStatic && x.isAbstract);
    }

    private getPublicAccessors()
    {
        return this.accessors.filter(x => isPublic(x) && !x.isStatic && !x.isAbstract);
    }

    private getPublicGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isPublic(x) && !x.isStatic && !x.isAbstract);
    }

    private getPublicMethods()
    {
        return this.methods.filter(x => isPublic(x) && !x.isStatic && !x.isAbstract);
    }

    private getPublicProperties()
    {
        return this.properties.filter(x => isPublic(x) && isWritable(x) && !x.isStatic);
    }

    private getPublicReadOnlyProperties()
    {
        return this.properties.filter(x => isPublic(x) && isReadOnly(x) && !x.isStatic);
    }

    private getPublicStaticAccessors()
    {
        return this.accessors.filter(x => isPublic(x) && x.isStatic && !x.isAbstract);
    }

    private getPublicStaticGettersAndSetters()
    {
        return this.getters.concat(this.setters).filter(x => isPublic(x) && x.isStatic && !x.isAbstract);
    }

    private getPublicStaticMethods()
    {
        return this.methods.filter(x => isPublic(x) && x.isStatic && !x.isAbstract);
    }

    private getPublicStaticProperties()
    {
        return this.properties.filter(x => isPublic(x) && isWritable(x) && x.isStatic);
    }

    private getPublicStaticReadOnlyProperties()
    {
        return this.properties.filter(x => isPublic(x) && isReadOnly(x) && x.isStatic);
    }

    // #endregion Private Methods
}
