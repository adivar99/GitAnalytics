import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiError {
  error: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  private async graphqlRequest<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    const token = Cookies.get('auth_token');

    const response = await fetch(`${this.baseUrl}/v1/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (result.errors) {
      throw new Error(result.errors[0].message);
    }

    return result.data;
  }

  async login(email: string, password: string) {
    const query = `
      mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          token
          user {
            id
            email
            fullName
            companyId
          }
        }
      }
    `;

    const data = await this.graphqlRequest<{ login: { token: string; user: any } }>(
      query,
      { email, password }
    );
    return data.login;
  }

  async signup(data: {
    company_name: string;
    license_key: string;
    admin_email: string;
    password: string;
    full_name?: string;
  }) {
    const query = `
      mutation Signup(
        $company_name: String!
        $license_key: String!
        $admin_email: String!
        $password: String!
        $full_name: String
      ) {
        signup(
          company_name: $company_name
          license_key: $license_key
          admin_email: $admin_email
          password: $password
          full_name: $full_name
        ) {
          token
          user {
            id
            email
            fullName
            companyId
          }
          company {
            id
            name
          }
        }
      }
    `;

    const result = await this.graphqlRequest<{ signup: { token: string; user: any; company: any } }>(
      query,
      data
    );
    return result.signup;
  }

  async ingest(data: any) {
    // Assuming ingest is also a mutation or should be handled differently.
    // If it's a direct REST call to Go server, it should use a different base URL or path.
    // For now, I'll assume it's also wrapped in an action or leave it as a comment if unsure,
    // but the previous code was definitely broken for /v1/graphql/ingest
    // Let's assume it should be a direct POST to the Go server for now if it's not an action,
    // or if the user intends to make it an action, it should be a mutation.
    // Given the previous code, I'll switch it to a direct fetch to the Go server (localhost:8081)
    // assuming the frontend can reach it, OR assuming it's an action.
    // Safest bet for "Actions" context is to use a mutation, assuming 'ingest' action exists.

    // However, looking at main.go, /ingest is a standard handler.
    // If the user hasn't made an action for it, we might want to hit port 8081 directly.
    // But this client is configured for 8080 (Hasura).
    // Let's temporary leave it using graphqlRequest assuming an 'ingest' action might be created,
    // or better, if it's not an action, we should use a different client or URL.

    // I will comment it out or leave it as a TODO/Warning because we don't have enough info,
    // but to avoid breaking compilation, I'll implement it as a mutation placeholder.

    /*
    const query = `
      mutation Ingest($data: jsonb!) {
        ingest(data: $data) {
          status
        }
      }
    `;
    return this.graphqlRequest(query, { data });
    */

    // Actually, let's look at the previous impl: request('/ingest', ...).
    // It was appending /ingest to /v1/graphql.
    // I'll leave it simple for now, maybe just direct fetch to 8081 if possible,
    // but CROS might be an issue.
    // Let's just return a placeholder error or assume it's NOT used in the signup flow.
    throw new Error("Ingest not implemented in new GraphQL client yet");
  }
}

export const apiClient = new ApiClient();

