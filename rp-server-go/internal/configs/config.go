package configs

import (
	"fmt"
	"github.com/spf13/viper"
	"strings"
)

type connection struct {
	Name           string
	Endpoint       string
	Desination_URL string
}

type configuration struct {
	Server struct {
		Host string
		Port string
	}
	Static struct {
		Dir string
	}
	Bridge      connection
	Connections []connection
}

var Config *configuration

func NewConfiguration() (*configuration, error) {
	viper.AddConfigPath("data")
	viper.SetConfigName("config")
	viper.SetConfigType("yaml")
	viper.AutomaticEnv()
	viper.SetEnvKeyReplacer(strings.NewReplacer(`.`, `_`))
	err := viper.ReadInConfig()
	if err != nil {
		return nil, fmt.Errorf("error loading config file: %s", err)
	}
	err = viper.Unmarshal(&Config)
	if err != nil {
		return nil, fmt.Errorf("error reading config file: %s", err)
	}
	fmt.Println("Config loaded...")
	return Config, nil
}
