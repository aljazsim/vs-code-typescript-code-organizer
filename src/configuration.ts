import { ElementNodeGroupConfiguration } from "./element-node-group-configuration";

export class Configuration
{
    // #region Constructors (1)

    constructor(public readonly useRegions: boolean, public readonly addPublicModifierIfMissing: boolean, public readonly addMemberCountInRegionName: boolean, public readonly addRegionIndentation: boolean, public readonly addRegionCaptionToRegionEnd: boolean, public readonly groupPropertiesWithDecorators: boolean, public readonly treatArrowFunctionPropertiesAsMethods: boolean, public readonly organizeOnSave: boolean, public readonly memberOrder: ElementNodeGroupConfiguration[])
    {
    }

    // #endregion Constructors (1)
} 