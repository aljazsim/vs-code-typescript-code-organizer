export class ClassMemberConfiguration
{
    // #region Constructors (1)

    constructor(
        public readonly addPublicModifierIfMissing: boolean,
        public readonly addPrivateModifierIfStartingWithHash: boolean,
        public readonly groupMembersWithDecorators: boolean,
        public readonly treatArrowFunctionPropertiesAsMethods: boolean,
        public readonly treatArrowFunctionReadOnlyPropertiesAsMethods: boolean)
    {
    }

    // #endregion Constructors
}
