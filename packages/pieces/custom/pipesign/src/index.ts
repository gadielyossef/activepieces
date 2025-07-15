import { PieceAuth, createPiece } from "@activepieces/pieces-framework";
import { httpClient, HttpMethod } from "@activepieces/pieces-common";
import { listDocumentsInFolder } from "./lib/actions/list-documents-in-folder"; 

export const pipesignAuth = PieceAuth.SecretText({
    displayName: 'API Token',
    description: 'Insira seu token de API do Pipesign. Você pode encontrá-lo em "Configurações > API" na sua conta.',
    required: true,
    validate: async ({ auth }) => {
        try {
            await httpClient.sendRequest({
                url: 'https://api.autentique.com.br/v2/graphql',
                method: HttpMethod.POST,
                headers: {
                    'Authorization': `Bearer ${auth}`,
                },
                body: {
                    query: '{ me { id } }'
                }
            });
            return {
                valid: true,
            };
        } catch (e) {
            return {
                valid: false,
                error: 'Token de API inválido.',
            };
        }
    },
});

export const pipesign = createPiece({
    displayName: "Pipesign",
    auth: pipesignAuth,
    minimumSupportedRelease: '0.36.1',
    logoUrl: "https://app-pipefy-sign.pipefy.com/icons/PipefySignLogo.svg",
    authors: [
        "gadielyossef"
    ],
    actions: [
        listDocumentsInFolder,
    ],
    triggers: [],
});
