import { createAction, Property } from '@activepieces/pieces-framework';
import { httpClient, HttpMethod } from "@activepieces/pieces-common";
import { pipesignAuth } from "../../index";

interface GraphQLResponse {
    data?: {
        documentsByFolder: {
            total: number;
            data: unknown[];
        }
    };
    errors?: { message: string }[];
}

export const listDocumentsInFolder = createAction({
    auth: pipesignAuth,
    name: 'list_documents_in_folder',
    displayName: 'List Documents in Folder',
    description: 'Lists all documents within a specific folder.',
    props: {
        folder_id: Property.ShortText({
            displayName: 'Folder ID',
            description: 'The ID of the folder to list documents from.',
            required: true,
        }),
        limit: Property.Number({
            displayName: 'Limit',
            description: 'Number of documents to retrieve. Default is 60.',
            required: false,
        }),
        page: Property.Number({
            displayName: 'Page',
            description: 'Page number to retrieve. Default is 1.',
            required: false,
        })
    },
    async run(context) {
        const { folder_id, limit, page } = context.propsValue;
        const apiToken = context.auth;

        const graphqlQuery = `
            query DocumentsByFolder($folderId: ID!, $limit: Int, $page: Int) {
                documentsByFolder(folder_id: $folderId, limit: $limit, page: $page) {
                    total
                    data {
                        id
                        name
                        created_at
                        files { original signed }
                        signatures {
                            public_id
                            name
                            email
                            action { name }
                            viewed { created_at }
                            signed { created_at }
                            rejected { created_at }
                        }
                    }
                }
            }
        `;

        const response = await httpClient.sendRequest<GraphQLResponse>({
            method: HttpMethod.POST,
            url: 'https://api.autentique.com.br/v2/graphql',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiToken}`
            },
            body: {
                query: graphqlQuery,
                variables: {
                    folderId: folder_id,
                    limit: limit || 60,
                    page: page || 1
                }
            }
        });

        if (response.body.errors) {
            const errorMessages = response.body.errors.map(e => e.message).join(', ');
            throw new Error(`GraphQL Error: ${errorMessages}`);
        }
        
        return response.body.data?.documentsByFolder?.data ?? [];
    },
});
