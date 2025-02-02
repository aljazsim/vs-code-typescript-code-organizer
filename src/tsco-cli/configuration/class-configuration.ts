import { ClassMemberConfiguration } from "./class-member-configuration";
import { ClassMemberGroupConfiguration } from "./class-member-group-configuration";
import { RegionConfiguration } from "./region-configuration";

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
