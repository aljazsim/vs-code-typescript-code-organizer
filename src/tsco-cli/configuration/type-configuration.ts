import { RegionConfiguration } from "./region-configuration";
import { TypeMemberConfiguration } from "./type-member-configuration";
import { TypeMemberGroupConfiguration } from "./type-member-group-configuration";

export class TypeConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly regions: RegionConfiguration,
        public readonly members: TypeMemberConfiguration,
        public readonly memberGroups: TypeMemberGroupConfiguration[])
    {
    }

    // #endregion Constructors
}
