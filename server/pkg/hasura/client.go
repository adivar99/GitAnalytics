package hasura

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

type Client struct {
	Endpoint    string
	AdminSecret string
	HttpClient  *http.Client
}

func NewClient() *Client {
	endpoint := os.Getenv("HASURA_ENDPOINT")
	if endpoint == "" {
		endpoint = "http://graphql-engine:8080/v1/graphql"
	}

	secret := os.Getenv("HASURA_ADMIN_SECRET")

	return &Client{
		Endpoint:    endpoint,
		AdminSecret: secret,
		HttpClient:  &http.Client{},
	}
}

type GraphQLRequest struct {
	Query     string                 `json:"query"`
	Variables map[string]interface{} `json:"variables,omitempty"`
}

type GraphQLResponse struct {
	Data   json.RawMessage `json:"data"`
	Errors []GraphQLError  `json:"errors,omitempty"`
}

type GraphQLError struct {
	Message string `json:"message"`
}

func (c *Client) Request(query string, variables map[string]interface{}, responseData interface{}) error {
	reqBody := GraphQLRequest{
		Query:     query,
		Variables: variables,
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", c.Endpoint, bytes.NewBuffer(jsonBody))
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if c.AdminSecret != "" {
		req.Header.Set("x-hasura-admin-secret", c.AdminSecret)
	}

	resp, err := c.HttpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("graphql request failed with status: %d", resp.StatusCode)
	}

	var graphQLResp GraphQLResponse
	if err := json.NewDecoder(resp.Body).Decode(&graphQLResp); err != nil {
		return fmt.Errorf("failed to decode response: %w", err)
	}

	if len(graphQLResp.Errors) > 0 {
		return fmt.Errorf("graphql error: %s", graphQLResp.Errors[0].Message)
	}

	if err := json.Unmarshal(graphQLResp.Data, responseData); err != nil {
		return fmt.Errorf("failed to unmarshal data: %w", err)
	}

	return nil
}
