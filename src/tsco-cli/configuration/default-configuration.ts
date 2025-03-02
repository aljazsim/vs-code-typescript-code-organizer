import { ClassMemberType } from "../enums/class-member-type";
import { ImportExpand } from "../enums/import-expand";
import { ImportSourceFilePathQuoteType } from "../enums/import-source-file-path-quote-type";
import { InterfaceMemberType } from "../enums/interface-member-type";
import { ModuleMemberType } from "../enums/module-member-type";
import { TypeMemberType } from "../enums/type-member-type";
import { Configuration } from "./configuration";

// #region Variables (1)

export const defaultConfiguration: Configuration =
{
    files: {
        include: ["./**/*.ts"],
        exclude: ["./**/*.d.ts", "node_modules/**", "dist/**", "out/**"]
    },
    imports: {
        removeUnusedImports: true,
        sortImportsBySource: true,
        sortImportsByName: true,
        groupImportsBySource: true,
        separateImportGroups: true,
        quote: ImportSourceFilePathQuoteType.Double,
        expand: ImportExpand.Never,
    },
    modules: {
        regions: {
            addRegions: false,
            addMemberCountInRegionName: false,
            addRegionCaptionToRegionEnd: false
        },
        members: {
            treatArrowFunctionVariablesAsMethods: false,
            treatArrowFunctionConstantsAsMethods: true
        },
        memberGroups: [
            {
                sortDirection: "asc",
                caption: "Enums",
                memberTypes: [ModuleMemberType.enums, ModuleMemberType.exportedEnums],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Interfaces",
                memberTypes: [ModuleMemberType.interfaces, ModuleMemberType.exportedInterfaces],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Classes",
                memberTypes: [ModuleMemberType.classes, ModuleMemberType.exportedClasses],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Types",
                memberTypes: [ModuleMemberType.types, ModuleMemberType.exportedTypes],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Functions",
                memberTypes: [ModuleMemberType.functions],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Exported Functions",
                memberTypes: [ModuleMemberType.exportedFunctions],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Variables",
                memberTypes: [
                    ModuleMemberType.constants,
                    ModuleMemberType.variables,
                    ModuleMemberType.exportedConstants,
                    ModuleMemberType.exportedVariables
                ],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            }
        ]
    },
    classes: {
        regions: {
            addRegions: false,
            addMemberCountInRegionName: false,
            addRegionCaptionToRegionEnd: false
        },
        members: {
            addPublicModifierIfMissing: true,
            addPrivateModifierIfStartingWithHash: false,
            groupMembersWithDecorators: false,
            treatArrowFunctionPropertiesAsMethods: false,
            treatArrowFunctionReadOnlyPropertiesAsMethods: true
        },
        memberGroups: [
            {
                sortDirection: "asc",
                caption: "Properties",
                memberTypes: [
                    ClassMemberType.privateStaticReadOnlyProperties,
                    ClassMemberType.privateReadOnlyProperties,
                    ClassMemberType.privateStaticProperties,
                    ClassMemberType.privateProperties,
                    ClassMemberType.protectedStaticReadOnlyProperties,
                    ClassMemberType.protectedReadOnlyProperties,
                    ClassMemberType.protectedStaticProperties,
                    ClassMemberType.protectedProperties,
                    ClassMemberType.publicStaticReadOnlyProperties,
                    ClassMemberType.publicReadOnlyProperties,
                    ClassMemberType.publicStaticProperties,
                    ClassMemberType.publicProperties
                ],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Static Block Declarations",
                memberTypes: [ClassMemberType.staticBlockDeclarations],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Constructors",
                memberTypes: [ClassMemberType.constructors],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Accessors",
                memberTypes: [
                    ClassMemberType.publicStaticAccessors,
                    ClassMemberType.publicAccessors,
                    ClassMemberType.publicAbstractAccessors,
                    ClassMemberType.protectedStaticAccessors,
                    ClassMemberType.protectedAccessors,
                    ClassMemberType.protectedAbstractAccessors,
                    ClassMemberType.privateStaticAccessors,
                    ClassMemberType.privateAccessors
                ],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Public Static Getters And Setters",
                memberTypes: [ClassMemberType.publicStaticGettersAndSetters],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Public Getters And Setters",
                memberTypes: [
                    ClassMemberType.publicGettersAndSetters,
                    ClassMemberType.publicAbstractGettersAndSetters
                ],
                memberTypesGrouped: false,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Protected Static Getters And Setters",
                memberTypes: [ClassMemberType.protectedStaticGettersAndSetters],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Protected Getters And Setters",
                memberTypes: [
                    ClassMemberType.protectedGettersAndSetters,
                    ClassMemberType.protectedAbstractGettersAndSetters
                ],
                memberTypesGrouped: false,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Private Static Getters And Setters",
                memberTypes: [ClassMemberType.privateStaticGettersAndSetters],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Private Getters And Setters",
                memberTypes: [ClassMemberType.privateGettersAndSetters],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Public Static Methods",
                memberTypes: [ClassMemberType.publicStaticMethods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Public Methods",
                memberTypes: [ClassMemberType.publicMethods, ClassMemberType.publicAbstractMethods],
                memberTypesGrouped: false,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Protected Static Methods",
                memberTypes: [ClassMemberType.protectedStaticMethods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Protected Methods",
                memberTypes: [ClassMemberType.protectedMethods, ClassMemberType.protectedAbstractMethods],
                memberTypesGrouped: false,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Private Static Methods",
                memberTypes: [ClassMemberType.privateStaticMethods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Private Methods",
                memberTypes: [ClassMemberType.privateMethods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            }
        ]
    },
    interfaces: {
        regions: {
            addRegions: false,
            addMemberCountInRegionName: false,
            addRegionCaptionToRegionEnd: false
        },
        members: {
            treatArrowFunctionPropertiesAsMethods: false,
            treatArrowFunctionReadOnlyPropertiesAsMethods: true
        },
        memberGroups: [
            {
                sortDirection: "asc",
                caption: "Properties",
                memberTypes: [InterfaceMemberType.readOnlyProperties, InterfaceMemberType.properties],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Indexes",
                memberTypes: [InterfaceMemberType.indexes],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Getters And Setters",
                memberTypes: [InterfaceMemberType.gettersAndSetters],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Methods",
                memberTypes: [InterfaceMemberType.methods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            }
        ]
    },
    types: {
        regions: {
            addRegions: false,
            addMemberCountInRegionName: false,
            addRegionCaptionToRegionEnd: false
        },
        members: {
            treatArrowFunctionPropertiesAsMethods: true
        },
        memberGroups: [
            {
                sortDirection: "asc",
                caption: "Properties",
                memberTypes: [TypeMemberType.properties],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Indexes",
                memberTypes: [TypeMemberType.indexes],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            },
            {
                sortDirection: "asc",
                caption: "Methods",
                memberTypes: [TypeMemberType.methods],
                memberTypesGrouped: true,
                placeAbove: [],
                placeBelow: []
            }
        ]
    }
};

// #endregion Variables
