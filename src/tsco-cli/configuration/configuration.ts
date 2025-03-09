import { ClassMemberType } from "../enums/class-member-type";
import { ImportExpand } from "../enums/import-expand";
import { ImportSourceFilePathQuoteType } from "../enums/import-source-file-path-quote-type";
import { InterfaceMemberType } from "../enums/interface-member-type";
import { ModuleMemberType } from "../enums/module-member-type";
import { TypeMemberType } from "../enums/type-member-type";
import { distinct, remove } from "../helpers/array-helper";
import { fileExists, readFile } from "../helpers/file-system-helper";
import { convertPascalCaseToTitleCase } from "../helpers/string-helper";
import { log } from "../source-code/source-code-logger";
import { ClassConfiguration } from "./class-configuration";
import { ClassMemberConfiguration } from "./class-member-configuration";
import { ClassMemberGroupConfiguration } from "./class-member-group-configuration";
import { defaultConfiguration } from "./default-configuration";
import { FileConfiguration } from "./file-configuration";
import { ImportConfiguration } from "./import-configuration";
import { InterfaceConfiguration } from "./interface-configuration";
import { InterfaceMemberConfiguration } from "./interface-member-configuration";
import { InterfaceMemberGroupConfiguration } from "./interface-member-group-configuration";
import { ModuleConfiguration } from "./module-configuration";
import { ModuleMemberConfiguration } from "./module-member-configuration";
import { ModuleMemberGroupConfiguration } from "./module-member-group-configuration";
import { RegionConfiguration } from "./region-configuration";
import { TypeConfiguration } from "./type-configuration";
import { TypeMemberConfiguration } from "./type-member-configuration";
import { TypeMemberGroupConfiguration } from "./type-member-group-configuration";

export class Configuration
{
    // #region Constructors (1)

    constructor
        (
            public readonly files: FileConfiguration,
            public readonly imports: ImportConfiguration,
            public readonly modules: ModuleConfiguration,
            public readonly classes: ClassConfiguration,
            public readonly interfaces: InterfaceConfiguration,
            public readonly types: TypeConfiguration
        )
    {
    }

    // #endregion Constructors

    // #region Public Static Methods (2)

    public static async getConfiguration(configurationFilePath: string | null)
    {
        const defaultConfiguration = await this.getDefaultConfiguration();
        let configuration = defaultConfiguration;

        try
        {
            if (configurationFilePath && await fileExists(configurationFilePath))
            {
                configuration = JSON.parse(await readFile(configurationFilePath));

                log(`tsco using configuration file ${configurationFilePath}`);
            }
            else
            {
                log("tsco using default configuration");
            }
        }
        catch
        {
            log("tsco using default configuration");
        }

        return new Configuration(
            new FileConfiguration(
                configuration.files?.include ?? defaultConfiguration.files.include,
                configuration.files?.exclude ?? defaultConfiguration.files.exclude,
            ),
            new ImportConfiguration
                (
                    configuration.imports?.removeUnusedImports ?? defaultConfiguration.imports.removeUnusedImports,
                    configuration.imports?.sortImportsBySource ?? defaultConfiguration.imports.sortImportsBySource,
                    configuration.imports?.sortImportsByName ?? defaultConfiguration.imports.sortImportsByName,
                    configuration.imports?.groupImportsBySource ?? defaultConfiguration.imports.groupImportsBySource,
                    configuration.imports?.separateImportGroups ?? defaultConfiguration.imports.separateImportGroups,
                    this.parseImportSourceFilePathQuoteType(configuration.imports?.quote) ?? defaultConfiguration.imports.quote,
                    this.parseImportExpand(configuration.imports?.expand) ?? defaultConfiguration.imports.expand
                ),
            new ModuleConfiguration
                (
                    new RegionConfiguration
                        (
                            configuration.modules.regions?.addRegions ?? defaultConfiguration.modules.regions.addRegions,
                            configuration.modules.regions?.addMemberCountInRegionName ?? defaultConfiguration.modules.regions.addMemberCountInRegionName,
                            configuration.modules.regions?.addRegionCaptionToRegionEnd ?? defaultConfiguration.modules.regions.addRegionCaptionToRegionEnd
                        ),
                    new ModuleMemberConfiguration
                        (
                            configuration.modules?.members.treatArrowFunctionVariablesAsMethods ?? defaultConfiguration.modules.members.treatArrowFunctionVariablesAsMethods,
                            configuration.modules?.members.treatArrowFunctionConstantsAsMethods ?? defaultConfiguration.modules.members.treatArrowFunctionConstantsAsMethods,
                        ),
                    this.fixModuleMemberMemberGroup(defaultConfiguration.modules.memberGroups, configuration.modules?.memberGroups.map(g => this.parseModuleMemberGroupConfiguration(g)) ?? [])
                ),
            new ClassConfiguration
                (
                    new RegionConfiguration
                        (
                            configuration.classes.regions?.addRegions ?? defaultConfiguration.classes.regions.addRegions,
                            configuration.classes.regions?.addMemberCountInRegionName ?? defaultConfiguration.classes.regions.addMemberCountInRegionName,
                            configuration.classes.regions?.addRegionCaptionToRegionEnd ?? defaultConfiguration.classes.regions.addRegionCaptionToRegionEnd
                        ),
                    new ClassMemberConfiguration
                        (
                            configuration.classes?.members.addPublicModifierIfMissing ?? defaultConfiguration.classes.members.addPublicModifierIfMissing,
                            configuration.classes?.members.addPrivateModifierIfStartingWithHash ?? defaultConfiguration.classes.members.addPrivateModifierIfStartingWithHash,
                            configuration.classes?.members.groupMembersWithDecorators ?? defaultConfiguration.classes.members.groupMembersWithDecorators,
                            configuration.classes?.members.treatArrowFunctionPropertiesAsMethods ?? defaultConfiguration.classes.members.treatArrowFunctionPropertiesAsMethods,
                            configuration.classes?.members.treatArrowFunctionReadOnlyPropertiesAsMethods ?? defaultConfiguration.classes.members.treatArrowFunctionReadOnlyPropertiesAsMethods,
                        ),
                    this.fixClassMemberMemberGroup(defaultConfiguration.classes.memberGroups, configuration.classes?.memberGroups.map(g => this.parseClassMemberGroupConfiguration(g)) ?? [])
                ),
            new InterfaceConfiguration
                (
                    new RegionConfiguration
                        (
                            configuration.interfaces.regions?.addRegions ?? defaultConfiguration.interfaces.regions.addRegions,
                            configuration.interfaces.regions?.addMemberCountInRegionName ?? defaultConfiguration.interfaces.regions.addMemberCountInRegionName,
                            configuration.interfaces.regions?.addRegionCaptionToRegionEnd ?? defaultConfiguration.interfaces.regions.addRegionCaptionToRegionEnd
                        ),
                    new InterfaceMemberConfiguration
                        (
                            configuration.interfaces?.members.treatArrowFunctionPropertiesAsMethods ?? defaultConfiguration.interfaces.members.treatArrowFunctionPropertiesAsMethods,
                            configuration.interfaces?.members.treatArrowFunctionReadOnlyPropertiesAsMethods ?? defaultConfiguration.interfaces.members.treatArrowFunctionReadOnlyPropertiesAsMethods,
                        ),
                    this.fixInterfaceMemberMemberGroup(defaultConfiguration.interfaces.memberGroups, configuration.interfaces?.memberGroups.map(g => this.parseInterfaceMemberGroupConfiguration(g)) ?? [])
                ),
            new TypeConfiguration
                (
                    new RegionConfiguration
                        (
                            configuration.types.regions?.addRegions ?? defaultConfiguration.types.regions.addRegions,
                            configuration.types.regions?.addMemberCountInRegionName ?? defaultConfiguration.types.regions.addMemberCountInRegionName,
                            configuration.types.regions?.addRegionCaptionToRegionEnd ?? defaultConfiguration.types.regions.addRegionCaptionToRegionEnd
                        ),
                    new TypeMemberConfiguration
                        (
                            configuration.types?.members.treatArrowFunctionPropertiesAsMethods ?? defaultConfiguration.types.members.treatArrowFunctionPropertiesAsMethods,
                        ),
                    this.fixTypeMemberMemberGroup(defaultConfiguration.types.memberGroups, configuration.types?.memberGroups.map(g => this.parseTypeMemberGroupConfiguration(g)) ?? [])
                )
        );
    }

    public static getDefaultConfiguration()
    {
        return new Configuration(
            new FileConfiguration(
                distinct(defaultConfiguration.files.include.map((f: string) => f as string).filter((f: string) => f && f.trim().length > 0)),
                distinct(defaultConfiguration.files.exclude.map((f: string) => f as string).filter((f: string) => f && f.trim().length > 0))
            ),
            new ImportConfiguration
                (
                    defaultConfiguration.imports.removeUnusedImports,
                    defaultConfiguration.imports.sortImportsBySource,
                    defaultConfiguration.imports.sortImportsByName,
                    defaultConfiguration.imports.groupImportsBySource,
                    defaultConfiguration.imports.separateImportGroups,
                    this.parseImportSourceFilePathQuoteType(defaultConfiguration.imports.quote) ?? ImportSourceFilePathQuoteType.Double,
                    this.parseImportExpand(defaultConfiguration.imports.expand) ?? ImportExpand.Never
                ),
            new ModuleConfiguration
                (
                    new RegionConfiguration
                        (
                            defaultConfiguration.modules.regions.addRegions,
                            defaultConfiguration.modules.regions.addMemberCountInRegionName,
                            defaultConfiguration.modules.regions.addRegionCaptionToRegionEnd
                        ),
                    new ModuleMemberConfiguration
                        (
                            defaultConfiguration.modules.members.treatArrowFunctionVariablesAsMethods,
                            defaultConfiguration.modules.members.treatArrowFunctionConstantsAsMethods,
                        ),
                    defaultConfiguration.modules.memberGroups.map(g => this.parseModuleMemberGroupConfiguration(g)) ?? []
                ),
            new ClassConfiguration
                (
                    new RegionConfiguration
                        (
                            defaultConfiguration.classes.regions.addRegions,
                            defaultConfiguration.classes.regions.addMemberCountInRegionName,
                            defaultConfiguration.classes.regions.addRegionCaptionToRegionEnd
                        ),
                    new ClassMemberConfiguration
                        (
                            defaultConfiguration.classes.members.addPublicModifierIfMissing,
                            defaultConfiguration.classes.members.addPrivateModifierIfStartingWithHash,
                            defaultConfiguration.classes.members.groupMembersWithDecorators,
                            defaultConfiguration.classes.members.treatArrowFunctionPropertiesAsMethods,
                            defaultConfiguration.classes.members.treatArrowFunctionReadOnlyPropertiesAsMethods,
                        ),
                    defaultConfiguration.classes.memberGroups.map(g => this.parseClassMemberGroupConfiguration(g)) ?? []
                ),
            new InterfaceConfiguration
                (
                    new RegionConfiguration
                        (
                            defaultConfiguration.interfaces.regions.addRegions,
                            defaultConfiguration.interfaces.regions.addMemberCountInRegionName,
                            defaultConfiguration.interfaces.regions.addRegionCaptionToRegionEnd
                        ),
                    new InterfaceMemberConfiguration
                        (
                            defaultConfiguration.interfaces.members.treatArrowFunctionPropertiesAsMethods,
                            defaultConfiguration.interfaces.members.treatArrowFunctionReadOnlyPropertiesAsMethods,
                        ),
                    defaultConfiguration.interfaces.memberGroups.map(g => this.parseInterfaceMemberGroupConfiguration(g)) ?? []
                ),
            new TypeConfiguration
                (
                    new RegionConfiguration
                        (
                            defaultConfiguration.types.regions.addRegions,
                            defaultConfiguration.types.regions.addMemberCountInRegionName,
                            defaultConfiguration.types.regions.addRegionCaptionToRegionEnd
                        ),
                    new TypeMemberConfiguration
                        (
                            defaultConfiguration.types.members.treatArrowFunctionPropertiesAsMethods,
                        ),
                    defaultConfiguration.types.memberGroups.map(g => this.parseTypeMemberGroupConfiguration(g)) ?? []
                )
        );
    }

    // #endregion Public Static Methods

    // #region Private Static Methods (10)

    private static fixClassMemberMemberGroup(defaultMemberTypeOrder: ClassMemberGroupConfiguration[], memberTypeOrder: ClassMemberGroupConfiguration[]): ClassMemberGroupConfiguration[]
    {
        const memberTypes = memberTypeOrder.flatMap(mto => mto.memberTypes);
        const allMemberTypes = defaultMemberTypeOrder.flatMap(mt => mt.memberTypes);
        const missingMemberTypes = allMemberTypes.filter(mt => !memberTypes.includes(mt));
        const fixedMemberTypeOrder: ClassMemberGroupConfiguration[] = [];

        // add existing member types
        for (const memberGroupConfiguration of memberTypeOrder) 
        {
            fixedMemberTypeOrder.push(memberGroupConfiguration);
        }

        // add missing member types (one per group)
        for (const missingMemberType of missingMemberTypes) 
        {
            fixedMemberTypeOrder.push(new ClassMemberGroupConfiguration("asc", convertPascalCaseToTitleCase(ClassMemberType[missingMemberType]), [missingMemberType], true, [], []));
        }

        return fixedMemberTypeOrder;
    }

    private static fixInterfaceMemberMemberGroup(defaultMemberTypeOrder: InterfaceMemberGroupConfiguration[], memberTypeOrder: InterfaceMemberGroupConfiguration[]): InterfaceMemberGroupConfiguration[]
    {
        const memberTypes = memberTypeOrder.flatMap(mto => mto.memberTypes);
        const allMemberTypes = defaultMemberTypeOrder.flatMap(mt => mt.memberTypes);
        const missingMemberTypes = allMemberTypes.filter(mt => !memberTypes.includes(mt));
        const fixedMemberTypeOrder: InterfaceMemberGroupConfiguration[] = [];

        // add existing member types
        for (const memberGroupConfiguration of memberTypeOrder) 
        {
            fixedMemberTypeOrder.push(memberGroupConfiguration);
        }

        // add missing member types (one per group)
        for (const missingMemberType of missingMemberTypes) 
        {
            fixedMemberTypeOrder.push(new InterfaceMemberGroupConfiguration("asc", convertPascalCaseToTitleCase(InterfaceMemberType[missingMemberType]), [missingMemberType], true, [], []));
        }

        return fixedMemberTypeOrder;
    }

    private static fixModuleMemberMemberGroup(defaultMemberTypeOrder: ModuleMemberGroupConfiguration[], memberTypeOrder: ModuleMemberGroupConfiguration[]): ModuleMemberGroupConfiguration[]
    {
        const memberTypes = memberTypeOrder.flatMap(mto => mto.memberTypes);
        const allMemberTypes = defaultMemberTypeOrder.flatMap(mt => mt.memberTypes);
        const missingMemberTypes = allMemberTypes.filter(mt => !memberTypes.includes(mt));
        const fixedMemberTypeOrder: ModuleMemberGroupConfiguration[] = [];

        // add existing member types
        for (const memberGroupConfiguration of memberTypeOrder) 
        {
            fixedMemberTypeOrder.push(memberGroupConfiguration);
        }

        // add missing member types (one per group)
        for (const missingMemberType of missingMemberTypes) 
        {
            fixedMemberTypeOrder.push(new ModuleMemberGroupConfiguration("asc", convertPascalCaseToTitleCase(ModuleMemberType[missingMemberType]), [missingMemberType], true, [], []));
        }

        return fixedMemberTypeOrder;
    }

    private static fixTypeMemberMemberGroup(defaultMemberTypeOrder: TypeMemberGroupConfiguration[], memberTypeOrder: TypeMemberGroupConfiguration[]): TypeMemberGroupConfiguration[]
    {
        const memberTypes = memberTypeOrder.flatMap(mto => mto.memberTypes);
        const allMemberTypes = defaultMemberTypeOrder.flatMap(mt => mt.memberTypes);
        const missingMemberTypes = allMemberTypes.filter(mt => !memberTypes.includes(mt));
        const fixedMemberTypeOrder: TypeMemberGroupConfiguration[] = [];

        // add existing member types
        for (const memberGroupConfiguration of memberTypeOrder) 
        {
            fixedMemberTypeOrder.push(memberGroupConfiguration);
        }

        // add missing member types (one per group)
        for (const missingMemberType of missingMemberTypes) 
        {
            fixedMemberTypeOrder.push(new TypeMemberGroupConfiguration("asc", convertPascalCaseToTitleCase(TypeMemberType[missingMemberType]), [missingMemberType], true, [], []));
        }

        return fixedMemberTypeOrder;
    }

    private static parseClassMemberGroupConfiguration(classMemberGroupConfiguration: ClassMemberGroupConfiguration)
    {
        const sortDirection = classMemberGroupConfiguration.sortDirection === "asc" ? "asc" : (classMemberGroupConfiguration.sortDirection === "desc" ? "desc" : "none");
        const caption = classMemberGroupConfiguration.caption ?? "Region";
        const memberTypes = distinct(classMemberGroupConfiguration.memberTypes as string[] ?? []).map(t => ClassMemberType[t as keyof typeof ClassMemberType]).filter(t => t != undefined);
        const memberTypesGrouped = classMemberGroupConfiguration.memberTypesGrouped ?? true;
        const placeAbove = distinct(classMemberGroupConfiguration.placeAbove as string[] ?? []);
        const placeBelow = distinct(classMemberGroupConfiguration.placeBelow as string[] ?? []);

        for (const pa of placeAbove)
        {
            if (placeBelow.indexOf(pa) > -1)
            {
                // remove and items that are present in above and below from below
                remove(placeBelow, pa);
            }
        }

        return new ClassMemberGroupConfiguration(sortDirection, caption, memberTypes, memberTypesGrouped, placeAbove, placeBelow);
    }

    private static parseImportExpand(importExpand: string)
    {
        if (importExpand === ImportExpand.Never)
        {
            return ImportExpand.Never;
        }
        else if (importExpand === ImportExpand.Always)
        {
            return ImportExpand.Always;
        }
        else if (importExpand === ImportExpand.WhenMoreThanOneNamedImport)
        {
            return ImportExpand.WhenMoreThanOneNamedImport;
        }
        else
        {
            return null;
        }
    }

    private static parseImportSourceFilePathQuoteType(quoteType: string)
    {
        if (quoteType === ImportSourceFilePathQuoteType.Double)
        {
            return ImportSourceFilePathQuoteType.Double;
        }
        else if (quoteType === ImportSourceFilePathQuoteType.Single)
        {
            return ImportSourceFilePathQuoteType.Single;
        }
        else
        {
            return null;
        }
    }

    private static parseInterfaceMemberGroupConfiguration(interfaceMemberGroupConfiguration: InterfaceMemberGroupConfiguration)
    {
        const sortDirection = interfaceMemberGroupConfiguration.sortDirection === "asc" ? "asc" : (interfaceMemberGroupConfiguration.sortDirection === "desc" ? "desc" : "none");
        const caption = interfaceMemberGroupConfiguration.caption ?? "Region";
        const memberTypes = distinct(interfaceMemberGroupConfiguration.memberTypes as string[] ?? []).map(t => InterfaceMemberType[t as keyof typeof InterfaceMemberType]).filter(t => t != undefined);
        const memberTypesGrouped = interfaceMemberGroupConfiguration.memberTypesGrouped ?? true;
        const placeAbove = distinct(interfaceMemberGroupConfiguration.placeAbove as string[] ?? []);
        const placeBelow = distinct(interfaceMemberGroupConfiguration.placeBelow as string[] ?? []);

        for (const pa of placeAbove)
        {
            if (placeBelow.indexOf(pa) > -1)
            {
                // remove and items that are present in above and below from below
                remove(placeBelow, pa);
            }
        }

        return new InterfaceMemberGroupConfiguration(sortDirection, caption, memberTypes, memberTypesGrouped, placeAbove, placeBelow);
    }

    private static parseModuleMemberGroupConfiguration(moduleMemberGroupConfiguration: ModuleMemberGroupConfiguration)
    {
        const sortDirection = moduleMemberGroupConfiguration.sortDirection === "asc" ? "asc" : (moduleMemberGroupConfiguration.sortDirection === "desc" ? "desc" : "none");
        const caption = moduleMemberGroupConfiguration.caption ?? "Region";
        const memberTypes = distinct(moduleMemberGroupConfiguration.memberTypes as string[] ?? []).map(t => ModuleMemberType[t as keyof typeof ModuleMemberType]).filter(t => t != undefined);
        const memberTypesGrouped = moduleMemberGroupConfiguration.memberTypesGrouped ?? true;
        const placeAbove = distinct(moduleMemberGroupConfiguration.placeAbove as string[] ?? []);
        const placeBelow = distinct(moduleMemberGroupConfiguration.placeBelow as string[] ?? []);

        for (const pa of placeAbove)
        {
            if (placeBelow.indexOf(pa) > -1)
            {
                // remove and items that are present in above and below from below
                remove(placeBelow, pa)
            }
        }

        return new ModuleMemberGroupConfiguration(sortDirection, caption, memberTypes, memberTypesGrouped, placeAbove, placeBelow);
    }

    private static parseTypeMemberGroupConfiguration(typeMemberGroupConfiguration: TypeMemberGroupConfiguration)
    {
        const sortDirection = typeMemberGroupConfiguration.sortDirection === "asc" ? "asc" : (typeMemberGroupConfiguration.sortDirection === "desc" ? "desc" : "none");
        const caption = typeMemberGroupConfiguration.caption ?? "Region";
        const memberTypes = distinct(typeMemberGroupConfiguration.memberTypes as string[] ?? []).map(t => TypeMemberType[t as keyof typeof TypeMemberType]).filter(t => t != undefined);
        const memberTypesGrouped = typeMemberGroupConfiguration.memberTypesGrouped ?? true;
        const placeAbove = distinct(typeMemberGroupConfiguration.placeAbove as string[] ?? []);
        const placeBelow = distinct(typeMemberGroupConfiguration.placeBelow as string[] ?? []);

        for (const pa of placeAbove)
        {
            if (placeBelow.indexOf(pa) > -1)
            {
                // remove and items that are present in above and below from below
                remove(placeBelow, pa);
            }
        }

        return new TypeMemberGroupConfiguration(sortDirection, caption, memberTypes, memberTypesGrouped, placeAbove, placeBelow);
    }

    // #endregion Private Static Methods
}
