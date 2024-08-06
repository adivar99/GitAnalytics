package http

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

type APIClient struct {
	BaseUrl string
	token   string
}

func NewAPIClient(baseURL, uuid string) *APIClient {
	api := &APIClient{
		BaseUrl: baseURL,
	}
	api.getToken(uuid)
	return api
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
func (api *APIClient) SendMasterInfo(payload []byte) ([]byte, error) {
	return api.post("/api/v1/agent/master_info", payload)
}

func (api *APIClient) getToken(uuid string) error {
	payload, err := json.Marshal(getTokenReq{uuid})
	if err != nil {
		return err
	}

	resp, err := api.post("/api/v1/agent/get-token", []byte(payload))
	if err != nil {
		return err
	}
	log.Println("Got token: " + string(resp))
	// api.token = resp.access_token
	return nil
}
