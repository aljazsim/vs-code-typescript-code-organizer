import { ElementNodeGroup } from "../elements/element-node-group";
import { ElementNode } from "../elements/element-node";
import { distinct } from "../helpers/array-helper";
import { getNodeNames } from "../helpers/node-helper";

// #region Functions (1)

function resolveDeclarationDependenciesOrderWithinGroup(nodes: ElementNode[])
{
    const maxIterations = 1000; // there might be a declaration dependency cycle

    for (let iteration = 0; iteration < maxIterations; iteration++)
    {
        let dependenciesDetected = false;

        for (let i = 0; i < nodes.length; i++)
        {
            const dependencies = distinct(nodes[i].dependencies.sort());

            for (const dependency of dependencies)
            {
                const dependencyIndex = nodes.findIndex(n => getNodeNames([n]).indexOf(dependency) >= 0);

                if (dependencyIndex > i)
                {
                    const node = nodes[i];
                    const dependencyNode = nodes[dependencyIndex];

                    for (let j = dependencyIndex; j > i; j--)
                    {
                        nodes[j] = nodes[j - 1];
                    }

                    nodes[i] = dependencyNode;
                    nodes[i + 1] = node;

                    dependenciesDetected = true;

                    break;
                }
            }
        }

        if (!dependenciesDetected)
        {
            break;
        }
    }
}

// #endregion Functions

// #region Exported Functions (1)

export function resolveDeclarationDependenciesOrder(nodeGroups: ElementNodeGroup[])
{
    for (const nodeGroup of nodeGroups)
    {
        resolveDeclarationDependenciesOrderWithinGroup(nodeGroup.nodes);
        resolveDeclarationDependenciesOrder(nodeGroup.nodeSubGroups);
    }
}

// #endregion Exported Functions
