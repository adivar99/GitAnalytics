package http

import (
	"bytes"
	"fmt"
	"io"
	"net/http"
)

type APIClient struct {
	BaseUrl string
}

func NewAPIClient(baseURL string) *APIClient {
	return &APIClient{
		BaseUrl: baseURL,
	}
}

func (api *APIClient) get(endpoint string) ([]byte, error) {
	url := fmt.Sprintf("%s%s", api.BaseUrl, endpoint)

	response, err := http.Get(url)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	return io.ReadAll(response.Body)
}

func (api *APIClient) post(endpoint string, payload []byte) ([]byte, error) {
	url := fmt.Sprintf("%s%s", api.BaseUrl, endpoint)

	response, err := http.Post(url, "application/json", bytes.NewBuffer(payload))

	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	return io.ReadAll(response.Body)
}

// PostExample calls an example API using the POST method
func (c *APIClient) SendMasterInfo(payload []byte) ([]byte, error) {
	return c.post("/api/v1/agent/master_info", payload)
}
