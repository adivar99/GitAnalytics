import Cookies from 'js-cookie';
import { useAuth } from '@/app/hooks/useAuth';

const API_URL =  process.env.NEXT_PUBLIC_HASURA_URL || 'http://localhost:8080/v1/graphql';

export interface ApiError {
  error: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
  }

  async graphqlRequest<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    const token = Cookies.get('auth_token');
    console.log(`Sending request to ${this.baseUrl} with token: ${token ? `present ${token}` : 'absent'}`);
    // const { user } = useAuth();
    const response = await fetch(`${this.baseUrl}`, {
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
}

export const apiClient = new ApiClient();

