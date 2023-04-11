import builtInModules from 'builtin-modules';
import open from 'open';
import vscode from 'vscode';

import { fetchNpmPackageRepository } from './util';

export default async function viewGithubRepository(moduleNames: string | string[]): Promise<void> {
    let selectedModuleName: string | undefined;

    if (typeof moduleNames === 'string') {
        selectedModuleName = moduleNames;
    } else {
        const items = moduleNames.map((moduleName) => {
            const item: vscode.QuickPickItem = { label: moduleName };

            if (builtInModules.includes(moduleName)) {
                item.description = 'builtIn';
            }

            return item;
        });

        const selectedItem = await vscode.window.showQuickPick(items, {
            placeHolder: 'select the module you want to browse and press Enter',
        });

        if (selectedItem) {
            selectedModuleName = selectedItem.label;
        }
    }

    if (selectedModuleName) {
        if (selectedModuleName.startsWith('@types/')) {
            const typeAddress = `https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/${selectedModuleName.replace(
                '@types/',
                '',
            )}`;
            await open(typeAddress);
        } else if (builtInModules.includes(selectedModuleName)) {
            const nodeDocumentURL = `https://nodejs.org/api/${selectedModuleName}.html`;
            await open(nodeDocumentURL);
        } else {
            const repositoryURL = await fetchNpmPackageRepository(selectedModuleName);

            if (repositoryURL) {
                // https://github.com/winterggg/view-github-repository or https://github.com/winterggg/view-github-repository/... => https://sourcegraph.com/github.com/winterggg/view-github-repository
                const sourcegraphURL = repositoryURL.replace(
                    /https?:\/\/github\.com\/([^/]+\/[^/]+)(\/.*)?/,
                    'https://sourcegraph.com/github.com/$1',
                );
                open(sourcegraphURL);
            } else {
                vscode.window.showErrorMessage(
                    `can't resolve the github repository of module ${selectedModuleName}!`,
                );
            }
        }
    }
}
