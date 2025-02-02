import { ClassMemberConfiguration } from "./class-member-configuration.js";
import { ClassMemberGroupConfiguration } from "./class-member-group-configuration.js";
import { RegionConfiguration } from "./region-configuration.js";

export class ClassConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly regions: RegionConfiguration,
        public readonly members: ClassMemberConfiguration,
        public readonly memberGroups: ClassMemberGroupConfiguration[])
    {
    }

    // #endregion Constructors
}
