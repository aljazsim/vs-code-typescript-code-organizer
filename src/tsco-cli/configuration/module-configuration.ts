import { ModuleMemberConfiguration } from "./module-member-configuration";
import { ModuleMemberGroupConfiguration } from "./module-member-group-configuration";
import { RegionConfiguration } from "./region-configuration";

export class ModuleConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly regions: RegionConfiguration,
        public readonly members: ModuleMemberConfiguration,
        public readonly memberGroups: ModuleMemberGroupConfiguration[])
    {
    }

    // #endregion Constructors
}
